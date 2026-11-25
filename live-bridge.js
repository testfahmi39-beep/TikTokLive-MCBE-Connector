import { WebSocketServer } from 'ws';
import fs from 'fs';
import crypto from 'crypto';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { TikTokLiveClient, EventType } from 'piratetok-live-js';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const wss = new WebSocketServer({ port: 8080 });
let mcSocket = null;

wss.on('connection', (ws) => {
    mcSocket = ws;
    console.log('✅ Minecraft connected!');

    ws.on('message', (raw) => {
        try {
            const msg = JSON.parse(raw.toString());
            if (msg?.header?.messagePurpose === 'commandResponse' || msg?.header?.messageType === 'commandResponse') {
                console.log('[MC RESPONSE]', JSON.stringify(msg.body));
            }
        } catch {
            // ignore non-JSON frames
        }
    });

    ws.on('close', () => {
        mcSocket = null;
        console.log('⚠️ Minecraft disconnected.');
    });
});

function runMinecraftCommand(command) {
    if (!mcSocket || mcSocket.readyState !== 1) {
        console.log(`⚠️ Skipped (Minecraft not connected): ${command}`);
        return;
    }

    mcSocket.send(JSON.stringify({
        header: {
            requestId: crypto.randomUUID(),
            messagePurpose: 'commandRequest',
            version: 1
        },
        body: {
            version: 1,
            commandLine: command.replace(/^\//, ''),
            origin: {
                type: 'player'
            }
        }
    }));
}

async function getUsername() {
    let username = (process.argv[2] || '').replace(/^@/, '').trim();

    if (!username) {
        const rl = readline.createInterface({ input, output });
        const defaultName = (config.username || '').replace(/^@/, '').trim();
        const promptText = defaultName
            ? `Enter TikTok username (press Enter for "${defaultName}"): `
            : 'Enter TikTok username (without @): ';

        const answer = await rl.question(promptText);
        rl.close();
        username = answer.replace(/^@/, '').trim() || defaultName;
    }

    if (!username) {
        console.error('❌ No TikTok username entered. Exiting.');
        process.exit(1);
    }

    return username;
}

const tiktokUsername = await getUsername();
console.log(`⏳ Connecting to @${tiktokUsername}'s TikTok LIVE...`);
console.log('💡 In Minecraft Bedrock, type: /connect localhost:8080');

const client = new TikTokLiveClient(tiktokUsername);

client.on(EventType.chat, (data) => {
    const user = data?.user?.uniqueId || data?.user?.nickname || 'viewer';
    const text = data?.comment || data?.content || '';
    console.log(`[CHAT] ${user}: ${text}`);
});

client.on(EventType.gift, (data) => {
    const user = data?.user?.uniqueId || data?.user?.nickname || 'viewer';
    const giftName = data?.gift?.name || data?.giftName || '';
    console.log(`[GIFT] ${user} sent "${giftName}"`);

    if (giftName === 'username') return;

    const command = config[giftName];
    if (command) {
        console.log(` -> Firing Minecraft command: ${command}`);
        runMinecraftCommand(command);
    } else if (giftName) {
        console.log(` -> No command mapped for "${giftName}" in config.json.`);
    }
});

client.connect()
    .then((roomId) => console.log(`✅ Connected to @${tiktokUsername}'s LIVE (Room ${roomId})!`))
    .catch((err) => console.error('❌ TikTok connection failed:', err?.message || err));
