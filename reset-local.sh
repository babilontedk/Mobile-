#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
docker compose down -v --remove-orphans || true
docker ps -a --filter label=cloud-android-lab=true -q | xargs -r docker rm -f
