Patient Robot Video Call (Raspberry Pi 5)
A minimal WebRTC video calling app for a patient service robot using a Node.js signaling server and web UIs for operator and robot.

Features
Room-based signaling over Socket.IO
Operator chooses camera/mic, initiates call
Robot auto-answers, streams Pi camera and mic
ICE config via /ice-config with STUN/TURN envs
Raspberry Pi kiosk script and systemd unit
Prerequisites
Node.js 18+
For WAN/NAT traversal, a TURN server is recommended
Raspberry Pi OS (Bookworm), Chromium browser, camera enabled (libcamera)
Setup
cd /workspace/patient-robot-call
cp .env.example .env  # edit as needed (TURN_*)
npm install
npm run dev
# open http://localhost:3000
Operator UI: http://<server>:3000/operator.html Robot UI: http://<server>:3000/robot.html

Set both to the same room (e.g., ward-1).

TURN (recommended)
Set the following in .env for reliability across networks:

TURN_URL=turn:turn.example.com:3478
TURN_USERNAME=robot
TURN_PASSWORD=secret
Raspberry Pi 5 Kiosk
Install Chromium and enable camera:

sudo apt update
sudo apt install -y chromium-browser
# enable camera in raspi-config if needed
Copy repo or only public + scripts and point ROBOT_URL to your server, e.g. http://server:3000/robot.html.

Install systemd user service:

# Copy service (adjust path if different)
mkdir -p ~/.config/systemd/user
cp /workspace/patient-robot-call/scripts/pi-kiosk.service ~/.config/systemd/user/

# Enable/Start
systemctl --user daemon-reload
systemctl --user enable pi-kiosk.service
systemctl --user start pi-kiosk.service

# To view logs:
journalctl --user -u pi-kiosk.service -f
Environment overrides:

systemctl --user edit pi-kiosk.service
# Add in the editor under [Service]:
# Environment=ROBOT_URL=http://server:3000/robot.html
# Environment=ROOM=ward-1
Security Notes
Use TLS (reverse proxy like Nginx/Caddy) to serve over HTTPS for mic/cam access on most browsers
Configure authentication/authorization before deploying to production
Prefer a managed TURN like Twilio/Nimbleape/Coturn you operate
Development
Start server: npm run dev
Health: GET /healthz
ICE config: GET /ice-config
