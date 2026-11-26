#!/data/data/com.termux/files/usr/bin/bash
set -e

cd "$(dirname "$0")"

# Ensure package.json exists and uses ES modules
if [ ! -f package.json ]; then
  cat << 'PKG' > package.json
{
  "name": "tiktok-mc-bridge",
  "version": "1.0.0",
  "type": "module",
  "main": "live-bridge.js",
  "scripts": {
    "start": "node live-bridge.js",
    "sim": "node simulator.js"
  },
  "dependencies": {
    "piratetok-live-js": "^1.1.1",
    "ws": "^8.18.0"
  }
}
PKG
fi

# Ensure default config.json exists
if [ ! -f config.json ]; then
  cat << 'CFG' > config.json
{
  "username": "",
  "Rose": "summon tnt ~ ~2 ~",
  "TikTok": "give @p diamond 1",
  "Cap": "setblock ~ ~-1 ~ ice",
  "GG": "summon lightning_bolt ~ ~ ~"
}
CFG
fi

# Install dependencies if node_modules is missing
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

node live-bridge.js "$@"
