# Build Process

This document captures the build intent, expected artifacts, and constraints for reproducible outputs.

## Build contract

- **Inputs**: `<source, config, assets>`
- **Output**: `<binary, package, site, image>`
- **Reproducibility expectations**: `<same input -> same result>`
- **Failure policy**: `<fail fast | warnings allowed>`

## Build steps

1. `<step 1>`
2. `<step 2>`
3. `<step 3>`

## Artifacts

| Artifact | Purpose | Location |
|----------|---------|----------|
| `<name>` | `<purpose>` | `<path>` |

## Reproducibility

- Version control for all inputs
- Deterministic build commands
- Environment parity between local and CI

## Rule

Describe what the build guarantees, not just which commands happen to run today.

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>