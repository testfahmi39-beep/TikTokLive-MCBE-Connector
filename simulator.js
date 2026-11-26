import fs from 'fs';
import crypto from 'crypto';
import { WebSocketServer } from 'ws';

const PORT = 8080;
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const wss = new WebSocketServer({ port: PORT });
console.log(`🧪 Simulator listening on port ${PORT}`);
console.log(`👉 In Minecraft Bedrock chat, run: /connect localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('✅ Minecraft connected! Running full event test sequence...\n');

  const sendCmd = (label, cmd) => {
    if (!cmd) return;
    console.log(`▶ Simulating [${label}] -> /${cmd}`);
    ws.send(JSON.stringify({
      header: {
        version: 1,
        requestId: crypto.randomUUID(),
        messagePurpose: 'commandRequest',
        messageType: 'commandRequest'
      },
      body: {
        version: 1,
        commandLine: cmd,
        origin: { type: 'player' }
      }
    }));
  };

  const steps = [
    { delay: 2000, label: 'Gift: Rose', cmd: config.gifts?.Rose || config.Rose },
    { delay: 4500, label: 'New Follower', cmd: config.events?.follow },
    { delay: 7000, label: 'LIVE Share', cmd: config.events?.share },
    { delay: 9500, label: 'Like Milestone', cmd: config.events?.likeMilestone?.command },
    { delay: 12000, label: 'Chat: !tnt', cmd: config.chat?.['!tnt'] }
  ];

  for (const step of steps) {
    setTimeout(() => {
      if (ws.readyState === 1) sendCmd(step.label, step.cmd);
    }, step.delay);
  }
});
