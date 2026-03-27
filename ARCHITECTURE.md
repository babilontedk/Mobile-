# Architecture

## Layers

### 1. Product layer
- Next.js UI for auth, country selection, device view, and controls.

### 2. Control plane
- NestJS API authenticates users and maps sessions to region agents.
- JWT authentication for API and socket calls.
- Session metadata persists in SQLite for MVP.

### 3. Region layer
- One regional agent per cloud location.
- Starts and manages Android emulator containers with Docker.
- Detects public IP, country, timezone, Android version, and device model.
- Provides session actions: reset, screenshot, install APK, navigation commands.

### 4. Device layer
- Android emulator container with browser-based remote display.
- Per-session persistent storage volume.
- ADB-enabled automation path for install and commands.

## Why this split works

A single global backend should not directly start emulators in every geography. Region agents let you add countries by deploying the same worker service close to users and registering it in the control plane.

## Request flow

1. Browser authenticates with the NestJS API.
2. User selects a country.
3. Backend resolves a region agent.
4. Region agent creates or reuses a persistent emulator container.
5. Frontend opens the region's device stream URL.
6. Device info panel shows public IP, timezone, country, Android version, and model.

## MVP transport

The included transport uses browser-based VNC/WebSocket for ease of setup.

## Production transport

Swap the stream layer to the emulator gRPC/WebRTC bridge and keep the same APIs:
- `POST /sessions`
- `POST /sessions/:id/control`
- `POST /sessions/:id/install-apk`
- `POST /sessions/:id/reset`
- `GET /sessions/:id`
