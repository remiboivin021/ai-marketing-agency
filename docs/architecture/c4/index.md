# C4 Architecture Documentation

> Audience: architects, developers, ops
> Maintained by: $architect | Last updated: <date>

## What is C4

C4 is a four-level model for describing software architecture:
- **Level 1 — Context**: the system and its external relationships
- **Level 2 — Container**: the deployable units inside the system
- **Level 3 — Component**: the internal structure of a container
- **Level 4 — Code**: the class/module structure of a component (optional)

Each level zooms into the previous one. Never skip a level without justification.

---

## Index

### Level 1 — System Context
| System | File | Status | ADR |
|--------|------|--------|-----|
| <SystemName> | [context.md](./L1-context.md) | DRAFT / APPROVED | <link or n/a> |

### Level 2 — Container
| System | File | Status | ADR |
|--------|------|--------|-----|
| <SystemName> | [container.md](./L2-container.md) | DRAFT / APPROVED | <link or n/a> |

### Level 3 — Component
| Container | File | Status | ADR |
|-----------|------|--------|-----|
| <ContainerName> | [component-<name>.md](./L3-component-<name>.md) | DRAFT / APPROVED | <link or n/a> |

### Level 4 — Code
| Component | File | Status | Trigger |
|-----------|------|--------|---------|
| <ComponentName> | [code-<name>.md](./L4-code-<name>.md) | DRAFT / APPROVED | <why this level was needed> |

---

## Usage Rules

- L1 and L2 are always required.
- L3 is required when a container has non-trivial internal structure.
- L4 is optional — use only when internal structure is not self-evident from the code.
- Each file must carry its own `Status` header (`DRAFT / APPROVED`).
- A diagram without a matching ADR is not authoritative for architecture decisions.

## Naming Convention

- context.md
- container.md
- component-<container-slug>.md
- code-<component-slug>.md

## Related
- [Boundary Documentation](../boundaries/index.md)
- [ADR Register](../../governance/adr/index.md)
- [Architecture Constitution](../../governance/constitution.md)