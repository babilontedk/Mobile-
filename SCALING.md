# Scaling Plan

## MVP
- One emulator container per session.
- Persistent volume per session.
- Static country-to-region mapping.

## Phase 2
- Pre-warmed emulator pool in each region.
- Redis-backed queue for provisioning bursts.
- Session idle detection and hibernation.

## Phase 3
- Kubernetes or Nomad per region.
- Region-agent becomes a stateless scheduler.
- Emulator pods launched from templates with node affinity for KVM-enabled hosts.
- TURN server and WebRTC transport for lower latency.
- Postgres replaces SQLite.

## Multi-country expansion
1. Deploy region agent in target region.
2. Expose agent URL.
3. Add country mapping entry in backend config.
4. Open port range and health checks.
5. Optionally add country-specific device profiles.
