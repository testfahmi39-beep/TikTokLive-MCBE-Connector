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
- **Simulated command for** testing if the events fires:
  ```bash
  node simulator.js
Run in Termux
Type CTRL + c to exit a running bridge

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
1. Can't Configure config.json
- **If you run** `cd ~/tiktok-mc
   nano config.json` and get an error it means you didn't install nano yet:
  ```bash
  pkg install -y nano
- **After that** try rerun `cd ~/tiktok-mc
   nano config.json`
2. Install Node.js
- **If Termux says** `node:command not found` or `npm:command not found` it seems you didn't install Node.js yet, here's the command
  ```bash
  pkg update && pkg upgrade -y && pkg install -y nodejs
- **After that** try running `node live-bridge` or `./start.sh` again
3. Events didn't fire after running `node simulator.js`
- Minecraft isn't connected to the WebSocket yet: Make sure you typed `/connect localhost:8080` in Minecraft chat after starting `live-bridge.js` or `simulator.js`, and check that Termux shows `✅ Minecraft connected!`.
- Cheats or Operator permissions are off: In your Minecraft Bedrock world settings, make sure Activate Cheats is turned ON and your player has Operator permissions.
- Gift name mismatch or invalid command in `config.json:` Check that the gift name in `config.json` matches the exact TikTok gift name (case-sensitive) and that the Minecraft command itself is valid in Bedrock Edition (for example, `summon tnt ~ ~2 ~`).
- **Old Node process holding port** `8080`: If another script is still using port `8080`, stop leftover Node processes and restart:
   ```bash
    pkill -f "node " || true
  ./start.sh
- **Enable WebSocket from Minecraft**: go to settings &rarr; general and enable `WebSocket` and disable `Required Encrypted WebSocket`
4. **If you are running this from another phone and playing Minecraft to another phone**
- After starting the bridge you need to connect it to Minecraft by using the chat and typing `/connect local_ip_address:8080`. It must be connected to a same `Wi-Fi` network. To find the local ip address you need to run this on `Termux`
   ```bash
   ip -4 addr show wlan0 | grep -oE 'inet [0-9.]+' | awk '{print $2}'
