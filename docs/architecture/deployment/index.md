# Deployment

This document is the entry point for deployment documentation and explains which files to use for which aspect of deployment.

## Contents

- `topology.md` for deployment topology documentation
- `environments.md` for environment definitions
- `state.md` for state management documentation

## Environments

### Prototype
| Environment | Platform | Tools | Purpose |
|------------|----------|-------|---------|
| PC local | PC | Gazebo | Development, simulation |

### Target
| Environment | Platform | OS | Purpose |
|------------|----------|-----|---------|
| Edge Device | Edge | Linux embarqué + RTOS | Production deployment |

## Maintenance rule

When the deployment model changes, update the matching deployment document in the same change stream.

---
Maintainer/Author: SpikeFormer Team
Version: 0.1.0
Last modified: 2026-04-13