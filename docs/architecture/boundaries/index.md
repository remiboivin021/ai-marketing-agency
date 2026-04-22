# Boundary Documentation

> Audience: architects, security, ops, data engineers, consumer teams

## What are Boundaries

Boundary documents define what crosses a separation point in the system and under what conditions.
They answer: **who can reach what, how, and with what constraints.**

Four boundary types are defined:

| Type | Core Question |
|------|---------------|
| **Trust** | Who trusts whom, and under what auth condition? |
| **Data** | What data crosses which boundary, and how is it controlled? |
| **Network** | What is reachable from where, at the infra level? |
| **Integration** | What contracts are exposed or consumed across system edges? |

---

## Index

### Trust Boundaries
| Scope | File | Status | ADR |
|-------|------|--------|-----|
| SpikeFormer | [trust-spikeformer.md](./trust-spikeformer.md) | APPROVED | n/a |
| <SystemName> | [trust-<name>.md](./trust-<name>.md) | DRAFT / APPROVED | <link or n/a> |

### Data Boundaries
| Scope | File | Status | ADR |
|-------|------|--------|-----|
| SpikeFormer | [data-spikeformer.md](./data-spikeformer.md) | APPROVED | n/a |
| <SystemName> | [data-<name>.md](./data-<name>.md) | DRAFT / APPROVED | <link or n/a> |

### Network Boundaries
| Scope | File | Status | ADR |
|-------|------|--------|-----|
| SpikeFormer | [network-spikeformer.md](./network-spikeformer.md) | APPROVED | n/a |
| <SystemName> | [network-<name>.md](./network-<name>.md) | DRAFT / APPROVED | <link or n/a> |

### Integration Boundaries
| Scope | File | Status | ADR |
|-------|------|--------|-----|
| SpikeFormer | [integration-spikeformer.md](./integration-spikeformer.md) | APPROVED | n/a |
| <SystemName> | [integration-<name>.md](./integration-<name>.md) | DRAFT / APPROVED | <link or n/a> |

---

## Usage Rules

- A boundary document is required as soon as the corresponding condition is met (see table above).
- A boundary document without a backing ADR is informational only — it is not a contract authority.
- Trust and Integration boundaries must be updated on every public contract change.
- Data boundaries must be reviewed on every schema or retention policy change.
- Network boundaries must be reviewed on every infra topology change.

## Naming Convention

- trust-<system-slug>.md
- data-<system-slug>.md
- network-<system-slug>.md
- integration-<system-slug>.md

## Trigger Matrix

| Change Type | Trust | Data | Network | Integration |
|-------------|-------|------|---------|-------------|
| New public endpoint | review | — | — | update |
| Auth mechanism change | update | — | — | review |
| New data flow cross-system | review | update | — | review |
| Schema / retention change | — | update | — | review |
| Infra topology change | review | — | update | — |
| New external dependency | review | review | review | update |
| Breaking contract change | — | — | — | update |

## Related
- [C4 Architecture Documentation](../c4/index.md)
- [ADR Register](../../governace/adr/index.md)
- [Architecture Constitution](../../governance/constitution.md)

---
Maintainer/Author: SpikeFormer Team
Last modified: 2026-04-13
---
