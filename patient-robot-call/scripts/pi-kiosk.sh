#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
URL="${ROBOT_URL:-http://localhost:3000/robot.html}"
ROOM="${ROOM:-ward-1}"

# Enable Pi camera (if using libcamera) and mic permissions are handled by browser prompt

# Wait for network
until ping -c1 -W1 8.8.8.8 >/dev/null 2>&1; do
	echo "Waiting for network..."; sleep 2;
done

# Launch Chromium in kiosk mode pointing to the robot page with room preset
/usr/bin/chromium-browser \
	--autoplay-policy=no-user-gesture-required \
	--use-fake-ui-for-media-stream \
	--kiosk "${URL}?room=${ROOM}" \
	--disable-translate \
	--noerrdialogs \
	--disable-infobars \
	--start-fullscreen \
	--enable-features=WebRTCPipeWireCapturer \
	--use-angle=gl \
	--allow-http-screen-capture \
	--ignore-certificate-errors \
	--enable-logging=stderr \
	--v=0 \
	--app="${URL}?room=${ROOM}" &