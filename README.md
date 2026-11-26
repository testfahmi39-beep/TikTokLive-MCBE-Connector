# TikTok LIVE to Minecraft Bedrock Bridge

Trigger Minecraft Bedrock commands from TikTok LIVE gifts using Termux and Node.js.

## Requirements
- **Termux** (Android) with **Node.js** installed (`pkg install nodejs`)
- **Minecraft Bedrock Edition** with **Cheats** and **Operator** enabled in your world
- **Enable Websocket** in Settings &rarr; General and disable **Required Encrypted Websocket**
## Setup & Run
1. Run in Termux
   ```bash
   termux-setup-storage
   mkdir -p ~/tiktok-mc
   unzip -o ~/storage/downloads/TikTokLive-MCBE-Connector-main.zip -d ~/tiktok-mc
   if [ ! -f ~/tiktok-mc/start.sh ]; then
     mv ~/tiktok-mc/*/* ~/tiktok-mc/ 2>/dev/null || mv ~/tiktok-mc/* ~/tiktok-mc/
   fi
   cd ~/tiktok-mc
   chmod +x start.sh
   ./start.sh
enter Ctrl + c

2. Quick bridge
   ```bash
   node live-bridge.js
or `./start.sh`

3. In Minecraft chat (Enable Cheats) type:
   ```bash
   /connect localhost:8080

## Configuration for gift & events
1. Run in Termux:
   ```bash
   cd ~/tiktok-mc
   nano config.json
- **You will see** like this:
   ```bash
  {
    "username": "username_here",
    "Rose": "summon tnt ~ ~2 ~",
    "TikTok": "give @p diamond 1",
    "Cap": "setblock ~ ~-1 ~ ice",
    "GG": "summon lightning_bolt ~ ~ ~"
  }
2. Change or add an event (`"giftname": "minecraftcommands"`) and DO NOT DELETE/CHANGE `"username": "username_here"` Make sure to put a comma `,` after one event added but the **bottom line event** is **excluded** (`"Cap": "setblock ~ ~-1 ~ ice",
    "GG": "summon lightning_bolt ~ ~ ~"`)

## Troubleshoot
