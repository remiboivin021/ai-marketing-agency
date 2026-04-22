# Integration Assumptions

This document captures assumptions about external integrations, APIs, and services the system depends on.

## External services

| Service | Purpose | Assumptions |
|---------|---------|-------------|
| ROS 2 | Communication inter-modules | Humble+, Python support via rclpy |
| Gazebo | Simulation | Fortress+ |
| MATLAB/SCilab | Validation | à déterminer |

## API assumptions

- **Protocol**: DDS (ROS 2) + Shared Memory
- **Authentication**: none (réseau local)
- **Timeout**: 5 ms timeout pour boucle contrôle
- **Retry policy**: pas de retry pour boucles temps réel

## Data exchange

- **Format**: Messages ROS 2 ( DDS)
- **Schema evolution**: backward compatible uniquement
- **Validation**: client-side (publishers)

## Third-party libraries

| Library | Version | Purpose |
|---------|---------|---------|
| ROS 2 | Humble+ | Middleware communication |
| rclpy | Humble+ | Python client library |
| Gazebo | Fortress+ | Simulation |

## Integration constraints

- Rate limits: N/A (localhost)
- Quotas: N/A (prototype)
- Allowed network destinations: localhost uniquement

## Contract degradation

En cas d'indisponibilité des dépendances externes:
- ROS 2: passage en mode dégradé (pas de communication)
- Gazebo: mode Hardware-in-the-loop seulement
- Validation MATLAB/SCilab:报告会保留离线模式

---
Maintainer/Author: SpikeFormer Team
Version: 0.1.0
Last modified: 2026-04-13