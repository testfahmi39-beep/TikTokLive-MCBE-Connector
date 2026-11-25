# TikTok LIVE to Minecraft Bedrock Bridge

Trigger Minecraft Bedrock commands from TikTok LIVE gifts using Termux and Node.js.

## Requirements
- **Termux** (Android) with **Node.js** installed (`pkg install nodejs`)
- **Minecraft Bedrock Edition** with **Cheats** and **Operator** enabled in your world

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
   node live_bridge.js
then enter username (Must Be Live)

## Configuration for gift & events
