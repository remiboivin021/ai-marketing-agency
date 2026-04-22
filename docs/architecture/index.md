# Architecture Index

This document is the entry point for architecture documentation and explains which files to use for which question.

## Use this section

- `assumptions/` for design premises
- `boundaries/` for in-scope versus out-of-scope responsibilities
- `interfaces/` for interaction surfaces
- `data-flow/` for information movement
- `deployment/` for runtime placement
- `security/` for high-level protections
- `c4/` for visual architecture views

## Implementation modules

- **SpikeFormer** (`src/spikeformer/`) - Event-driven robotics framework using hexagonal architecture
  - Domain layer: events and ports
  - Application layer: use cases
  - Runtime layer: event bus
  - Adapters layer: ROS 2 integration

  See [synaptix_nlspec.md](../synaptix_nlspec.md) as the source of truth.

## Maintenance rule

When the system shape changes, update the matching architecture document in the same change stream.

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>