# WebRTC Upgrade Path

The repository intentionally separates **session orchestration** from **stream delivery**.

## Current MVP
- Region agent returns a `streamUrl` that points at the emulator's browser control endpoint.

## WebRTC replacement
Replace the stream layer with one of these approaches:

1. Google Android Emulator WebRTC bridge (`-grpc 8554` + Envoy + emulator web client)
2. Dedicated screen gateway sidecar on each region node
3. TURN/Coturn for enterprise networks and mobile browser reliability

## Why the rest of the code does not change
The frontend only needs:
- session metadata
- connect URL
- control endpoints

That means you can migrate from VNC/WebSocket to WebRTC without redesigning auth, country routing, or session persistence.
