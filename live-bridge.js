import fs from 'fs';
import crypto from 'crypto';
import readline from 'readline';
import { WebSocketServer } from 'ws';
import { TikTokLiveConnection } from 'piratetok-live-js';

const PORT = 8080;
const CONFIG_PATH = './config.json';

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ config.json not found! Run ./start.sh or create config.json first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

let config = loadConfig();

// Watch config.json for live edits without needing a restart
fs.watchFile(CONFIG_PATH, { interval: 1000 }, () => {
  try {
    config = loadConfig();
    console.log('🔄 Reloaded config.json');
  } catch (err) {
    console.error('⚠️ Failed to reload config.json:', err.message);
  }
});

// Start WebSocket server for Minecraft Bedrock
const wss = new WebSocketServer({ port: PORT });
let mcSocket = null;

wss.on('connection', (ws) => {
  mcSocket = ws;
  console.log('✅ Minecraft connected!');

  ws.on('close', () => {
    if (mcSocket === ws) mcSocket = null;
    console.log('⚠️ Minecraft disconnected.');
  });

  ws.on('error', (err) => {
    console.error('⚠️ Minecraft WebSocket error:', err.message);
  });
});

function sendMinecraftCommand(command) {
  if (!command) return;
  if (!mcSocket || mcSocket.readyState !== 1) {
    console.log(`⏳ Minecraft not connected — skipped: /${command}`);
    return;
  }

  const packet = {
    header: {
      version: 1,
      requestId: crypto.randomUUID(),
      messagePurpose: 'commandRequest',
      messageType: 'commandRequest'
    },
    body: {
      version: 1,
      commandLine: command,
      origin: {
        type: 'player'
      }
    }
  };

  mcSocket.send(JSON.stringify(packet));
  console.log(`🎮 Executed in Minecraft: /${command}`);
}

// Simple cooldown helper to prevent spam floods
const lastTriggered = new Map();
function canTrigger(key) {
  const cooldown = Number(config.cooldownMs ?? 1500);
  const now = Date.now();
  const prev = lastTriggered.get(key) || 0;
  if (now - prev < cooldown) return false;
  lastTriggered.set(key, now);
  return true;
}

// Lookup gift command (supports both new config.gifts and legacy top-level keys)
function getGiftCommand(giftName) {
  if (!giftName) return null;
  if (config.gifts && config.gifts[giftName]) return config.gifts[giftName];
  const reserved = new Set(['username', 'cooldownMs', 'gifts', 'events', 'chat']);
  if (!reserved.has(giftName) && typeof config[giftName] === 'string') {
    return config[giftName];
  }
  return null;
}

function askUsername() {
  return new Promise((resolve) => {
    const cliArg = process.argv[2]?.replace(/^@/, '').trim();
    if (cliArg) return resolve(cliArg);

    if (config.username && config.username.trim() !== '') {
      return resolve(config.username.replace(/^@/, '').trim());
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('🎥 Enter TikTok LIVE username (without @): ', (answer) => {
      rl.close();
      resolve(answer.replace(/^@/, '').trim());
    });
  });
}

async function start() {
  console.log(`🚀 WebSocket server listening on port ${PORT}`);
  console.log(`👉 In Minecraft Bedrock chat, run: /connect localhost:${PORT}`);

  const username = await askUsername();
  if (!username) {
    console.error('❌ No username provided. Exiting.');
    process.exit(1);
  }

  console.log(`🔌 Connecting to @${username}'s TikTok LIVE...`);
  const tiktok = new TikTokLiveConnection(username);

  let accumulatedLikes = 0;

  // 1. Gift Events
  tiktok.on('gift', (data) => {
    if (data?.giftType === 1 && !data?.repeatEnd) return; // Wait for streak end
    const giftName = data?.giftName || data?.extendedGiftInfo?.name || 'Unknown Gift';
    const repeatCount = data?.repeatCount || 1;
    const sender = data?.uniqueId || data?.user?.uniqueId || 'Viewer';

    console.log(`🎁 ${sender} sent ${repeatCount}x ${giftName}`);
    const cmd = getGiftCommand(giftName);
    if (cmd) {
      for (let i = 0; i < repeatCount; i++) {
        sendMinecraftCommand(cmd);
      }
    }
  });

  // 2. Likes Counter Milestone
  tiktok.on('like', (data) => {
    const count = Number(data?.likeCount || 1);
    accumulatedLikes += count;

    const milestone = config.events?.likeMilestone;
    const threshold = Number(milestone?.every || 100);
    const cmd = milestone?.command;

    console.log(`❤️ +${count} likes (${accumulatedLikes}/${threshold})`);

    while (cmd && threshold > 0 && accumulatedLikes >= threshold) {
      accumulatedLikes -= threshold;
      console.log(`🎉 Like milestone (${threshold}) reached!`);
      sendMinecraftCommand(cmd);
    }
  });

  // 3. New Follower
  tiktok.on('follow', (data) => {
    const user = data?.uniqueId || data?.user?.uniqueId || 'Viewer';
    console.log(`➕ New follower: ${user}`);
    const cmd = config.events?.follow;
    if (cmd && canTrigger('follow')) {
      sendMinecraftCommand(cmd);
    }
  });

  // 4. Share Event
  tiktok.on('share', (data) => {
    const user = data?.uniqueId || data?.user?.uniqueId || 'Viewer';
    console.log(`🔁 ${user} shared the LIVE`);
    const cmd = config.events?.share;
    if (cmd && canTrigger('share')) {
      sendMinecraftCommand(cmd);
    }
  });

  // 5. Viewer Join Event
  tiktok.on('join', (data) => {
    const user = data?.uniqueId || data?.user?.uniqueId || 'Viewer';
    console.log(`👋 ${user} joined`);
    const cmd = config.events?.join;
    if (cmd && canTrigger('join')) {
      sendMinecraftCommand(cmd);
    }
  });

  // 6. Chat Keyword Triggers
  tiktok.on('chat', (data) => {
    const rawMsg = (data?.comment || '').trim();
    const key = rawMsg.toLowerCase();
    const user = data?.uniqueId || data?.user?.uniqueId || 'Viewer';
    console.log(`💬 ${user}: ${rawMsg}`);

    if (config.chat) {
      const matchedKey = Object.keys(config.chat).find((k) => k.toLowerCase() === key);
      if (matchedKey && canTrigger(`chat:${matchedKey}`)) {
        sendMinecraftCommand(config.chat[matchedKey]);
      }
    }
  });

  tiktok.on('disconnected', () => {
    console.log('⚠️ Disconnected from TikTok LIVE.');
  });

  tiktok.on('error', (err) => {
    console.error('❌ TikTok LIVE error:', err?.message || err);
  });

  try {
    const state = await tiktok.connect();
    console.log(`✅ Connected to TikTok LIVE room (Room ID: ${state.roomId})`);
  } catch (err) {
    console.error('❌ Failed to connect to TikTok LIVE:', err?.message || err);
    console.log('💡 Make sure the user is currently LIVE and the username is spelled correctly.');
  }
}

start();
