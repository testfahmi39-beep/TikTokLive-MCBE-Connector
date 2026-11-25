import { WebSocketServer } from 'ws';
import fs from 'fs';
import crypto from 'crypto';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const wss = new WebSocketServer({ port: 8080 });

console.log('Waiting for Minecraft... Type /connect localhost:8080 in chat.');

wss.on('connection', (ws) => {
    console.log('✅ Minecraft connected! Simulating gift in 3 seconds...');

    ws.on('message', (raw) => {
        try {
            const msg = JSON.parse(raw.toString());
            console.log('[MC RESPONSE]', JSON.stringify(msg.body));
        } catch {
            // ignore non-JSON frames
        }
    });

    setTimeout(() => {
        const simulatedGift = 'Rose';
        const command = config[simulatedGift];

        if (!command) {
            console.log(`[SIMULATOR] Gift "${simulatedGift}" not found in config.json.`);
            return;
        }

        console.log(`[SIMULATOR] Simulating gift: "${simulatedGift}" -> ${command}`);
        ws.send(JSON.stringify({
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
    }, 3000);
});
