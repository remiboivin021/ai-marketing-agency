# Data Flow Documentation

> Audience: architects, data engineers, developers, ops
> Maintained by: $architect | Last updated: 2026-04-13

## What is Data Flow

Data Flow documents describe how data enters the system, is transformed, and exits or is persisted.
They answer: **where does data come from, what happens to it, and where does it go?**

Three flow phases are defined:

| Phase | Core Question |
|-------|---------------|
| **Ingestion** | How does data enter the system, and in what format? |
| **Processing** | How is data transformed, validated, enriched, or routed? |
| **Egress** | How does data leave, and in what form? |

Persistence is a special case — data may be stored at any phase.

---

## Index

### Templates
| Phase | File | Purpose |
|-------|------|---------|
| Ingestion | [ingestion.md](./ingestion.md) | How data enters |
| Processing | [processing.md](./processing.md) | How data is transformed |
| Persistence | [persistence.md](./persistence.md) | How data is stored |
| Egress | [egress.md](./egress.md) | How data leaves |

### Specific Flows
| Flow Name | File | Status | ADR |
|-----------|------|--------|-----|
| SpikeFormer | [flow-spikeformer.md](./flow-spikeformer.md) | APPROVED | n/a |
| <FlowName> | [flow-<name>.md](./flow-<name>.md) | DRAFT / APPROVED | <link or n/a> |

---

## Usage Rules

- A data flow document is required when a new input, transformation, or output path is introduced.
- Each flow document must include a diagram (Mermaid preferred).
- Sensitive transitions (PII, secrets, irreversible transforms) must be explicitly marked.
- A flow document without a backing ADR is informational only.

## Naming Convention

- Templates: `<phase>.md` (ingestion, processing, persistence, egress)
- Specific flows: `flow-<name>.md`

## Trigger Matrix

| Change Type | New Flow Doc Required |
|-------------|---------------------|
| New input source | ingestion |
| New transformation logic | processing |
| New storage or retention change | persistence |
| New output / export / API | egress |
| Cross-system data exchange | new flow-*.md |

## Related
- [Boundary Documentation](../boundaries/index.md)
- [C4 Architecture Documentation](../c4/index.md)
- [ADR Register](../../governance/adr/index.md)
- [Architecture Constitution](../../governance/constitution.md)

---
Maintainer/Author: SpikeFormer Team
Last modified: 2026-04-13