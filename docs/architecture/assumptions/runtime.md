# Runtime Assumptions

This document describes the assumptions about the runtime environment in which the system executes.

## Platform

- **OS**: Linux (prototype) → Linux embarqué (target)
- **Runtime**: Python 3.10+ (prototype), C/Rust (target)
- **Dependencies**: ROS 2, rclpy

## Resource assumptions

### Memory

- Base footprint: ~50 MB (prototype)
- Per-request overhead: fixed allocation (pas de malloc dynamique)
- Max heap/stack: predetermined at compile time

### CPU

- Baseline consumption: 1 core dédiée pour boucle contrôle
- Spike capacity: reserved pour emergency handlers

### Storage

- Temp storage: /tmp minimal
- Log storage: fichier rotates, 100 MB max

## Execution model

- Concurrency model: Event-driven avec priority queues
- Thread pool size: fixed (réseau RTOS)
- Isolation: process (prototype), bare-metal (target Zephir RTOS)

## Lifecycle

- Startup time: < 2 s
- Shutdown: graceful avec emergency stop
- Hot reload: not supported (system safety)

## Monitoring

- Health checks: heartbeat watchdog
- Metrics: latence boucle contrôle, WCET
- Logging: fichier local avec rotation

---
Maintainer/Author: SpikeFormer Team
Version: 0.1.0
Last modified: 2026-04-13