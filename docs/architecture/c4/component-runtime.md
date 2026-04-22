# Component Diagram — <ContainerName>

> C4 Level 3 | Audience: developers, tech leads

## Scope
<!-- Which container from Level 2 is being decomposed. -->

## Components
| Component | Type | Responsibility | Entry Point |
|-----------|------|----------------|-------------|
| <name> | Service / Repository / Handler / ... | <responsibility> | `src/path/to/file` |

## Inter-Component Communication
| From | To | Mechanism | Notes |
|------|----|-----------|-------|
| <component> | <component> | direct call / event / interface | |

## Diagram

```mermaid
C4Component
  title Component Diagram — <ContainerName>

  Container_Boundary(api, "<ContainerName>") {
    Component(router, "<Router>", "<Tech>", "<Responsibility>")
    Component(svc, "<Service>", "<Tech>", "<Responsibility>")
    Component(repo, "<Repository>", "<Tech>", "<Responsibility>")
  }

  ContainerDb(db, "<Database>", "<Tech>", "")

  Rel(router, svc, "delegates to")
  Rel(svc, repo, "queries")
  Rel(repo, db, "SQL")
```

## Key Interfaces / Contracts
```typescript
// pseudocode suffisant pour décrire le contrat public
interface IMyService {
  execute(input: InputDTO): Promise<OutputDTO>
}
```

## Error Handling Policy
<!-- How are failures surfaced? Exceptions, result types, events? -->

## Testability Notes
<!-- Which components are unit-testable in isolation? What needs mocking? -->

## Open Questions
- [ ] <question> → route to $coder / $architect

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: <SEM_VERSION (start at 0.1.0)>
ADR: <link or n/a>
Status: DRAFT / APPROVED
Last modified: <DATE>
---
