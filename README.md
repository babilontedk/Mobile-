# Cloud Android Lab

A cloud-based virtual mobile testing platform that lets users choose a country and control a virtual Android phone from the browser.

## What is included

- **Next.js 15 frontend** with Tailwind CSS and responsive device dashboard
- **NestJS control plane** with JWT auth, session management, country mapping, and REST/WebSocket APIs
- **Regional emulator agents** that run Android emulator containers and expose per-session browser access
- **Dockerized Android emulator image** built on `budtmo/docker-android`
- **One-command setup script** for local MVP bootstrap
- **Deployment docs** for single-host, per-region VPS, and multi-region expansion

## Important MVP note

The repo is designed so beginners can run it quickly. The included browser control path uses the emulator's HTML5 browser-access layer (noVNC/WebSocket) because it is easier to bootstrap reliably on commodity VPS hardware. The architecture, APIs, TURN/Coturn placeholders, and region-agent abstraction are intentionally laid out so you can swap the stream transport to Google's emulator WebRTC bridge later without changing the product surface.

If you want strict WebRTC transport from day one, see `docs/WEBRTC_UPGRADE.md`.

## Quick start

```bash
cp .env.example .env
./scripts/setup.sh
```

Then open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Germany region agent: http://localhost:4101/health
- India region agent: http://localhost:4102/health

## Demo accounts

Create an account in the UI or call the signup endpoint.

## Default countries in MVP

- Germany -> Frankfurt-style region node (`region-de`)
- India -> Mumbai-style region node (`region-in`)
- United States -> Example mapping only (add another region agent)

## Main workflows

1. User signs up / logs in.
2. User selects a country.
3. Backend creates a persistent session by asking the selected region agent to start an emulator container.
4. Region agent allocates ports, starts the emulator, detects public IP and timezone, and returns connection metadata.
5. Frontend opens the live device view and offers controls: Home, Back, Recent, Rotate, Reset, Screenshot, APK upload.

## Repository layout

```text
apps/
  frontend/           Next.js UI
  backend/            NestJS control plane
services/
  region-agent/       Regional emulator worker/orchestrator
scripts/              Setup and deployment scripts
docker/
  emulator/           Custom emulator image and bootstrap logic
docs/                 Architecture, deployment, scaling, WebRTC upgrade path
```

## Beginner-friendly local MVP

The local setup runs all services on one machine. In production, deploy one `region-agent` per cloud region and keep the NestJS control plane global.
