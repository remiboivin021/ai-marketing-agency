# Environment Definitions

This document defines the different environments used in the development and deployment lifecycle.

## Environments

### Local

- **Purpose**: Individual development and testing
- **Characteristics**: `<single machine | in-memory | mock services>`
- **Access**: `<open | restricted>`

### CI

- **Purpose**: Automated validation on every change
- **Characteristics**: `<ephemeral | isolated | seeded>`
- **Access**: `<automated only>`

### Staging

- **Purpose**: Pre-production validation
- **Characteristics**: `<production-like | reduced scale>`
- **Access**: `<team | staging users>`

### Production

- **Purpose**: Live service delivery
- **Characteristics**: `<full scale | production配置>`
- **Access**: `<restricted>`

## Environment matrix

| Aspect | Local | CI | Staging | Production |
|--------|-------|-----|---------|------------|
| `<aspect>` | `<value>` | `<value>` | `<value>` | `<value>` |

## Transition rules

- Local → CI: Automatic on commit
- CI → Staging: After passing all gates
- Staging → Production: After staging validation

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>