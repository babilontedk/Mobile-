# Deployment Guide

## Local / single VPS MVP

1. Provision Ubuntu 22.04 or newer.
2. Ensure nested virtualization / KVM is available.
3. Install Docker and Docker Compose.
4. Clone the repo.
5. Copy `.env.example` to `.env`.
6. Run `./scripts/setup.sh`.

## Recommended machine sizes

### Per active emulator
- 4 vCPU minimum
- 8 GB RAM minimum
- 15+ GB fast SSD

### Small production pilot
- Global control plane: 2 vCPU / 4 GB
- Each region node: 8 vCPU / 16 GB if hosting 1-2 always-on emulators

## Multi-region setup

- Deploy `apps/backend` centrally.
- Deploy one `services/region-agent` on each region VM.
- Build and pre-pull the emulator image on each region VM.
- Set the region agent public URL in the backend environment.
- Open HTTP/HTTPS plus the configured VNC/ADB session port ranges.

## Cloud notes

- AWS: use bare metal or nested virtualization capable instances for best results.
- GCP: enable nested virtualization and use a compatible CPU platform.
- Azure: enable nested virtualization on supported VM families.

## TLS / WSS

For production place Caddy, Nginx, or Traefik in front of:
- frontend
- backend
- region agents

Terminate HTTPS there and forward traffic internally.
