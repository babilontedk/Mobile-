#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CHROME_APK_URL:-}" ]]; then
  echo "CHROME_APK_URL not provided; keeping default browser setup."
  exit 0
fi

apk_path="/tmp/chrome.apk"
curl -L "$CHROME_APK_URL" -o "$apk_path"
adb wait-for-device
adb install -r "$apk_path" || true
