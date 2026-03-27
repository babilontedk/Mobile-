#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

echo "[1/4] Building custom emulator image..."
docker build -t cloud-android-lab-emulator:latest ./docker/emulator

echo "[2/4] Starting platform services..."
docker compose up -d --build

echo "[3/4] Waiting for services..."
sleep 15

echo "[4/4] Platform endpoints"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:4000/api"
echo "Germany region agent: http://localhost:4101/health"
echo "India region agent:   http://localhost:4102/health"
