# Authority Map

This document explains **who decides what**, **which file is authoritative for which kind of rule**, and **how to resolve ambiguity** without guessing.

Its purpose is to keep the system understandable and prevent rule drift across governance layers.

---

## Why This Exists

This repository has multiple control layers:

- constitutional rules
- routing rules
- skill procedures
- feature contracts
- execution rails
- durable decision records

Without a clear map, the same rule can accidentally exist in multiple places with slightly different meanings.

This file prevents that.

---

## Source of Truth by Layer

| Layer | Purpose | Source of truth |
| --- | --- | --- |
| Constitutional law | immutable governing rules | `.agents/_constitution.md` |
| Human-readable constitutional mirror | readable team-facing version | `docs/governance/constitution.md` |
| Routing and project configuration | skill routing, repo-level config, flows | `AGENTS.md` |
| Skill behavior | detailed operating procedure for each skill | `.agents/skills/*/SKILL.md` |
| Feature scope contract | feature-specific mission, scope, gates, blast radius | `.agents/STATE.<slug>.md` |
| Execution rail | current/next/done task sequencing | `.agents/TODO.<slug>.md` |
| Local feature decision memory | non-trivial implementation choices | `.agents/DECISIONS.<slug>.md` |
| Durable structural decision record | long-lived architecture decision | `docs/governance/adr/<yy-mm-dd_slug>.md` |
| Rigor classification | L1/L2/L3 level policy | `docs/governance/levels.md` |
| Workflow reference | canonical execution sequences | `docs/governance/workflows.md` |

---

## Authority Order

```text
$governance > $architect-security > $architect > $security > $qa > $review
$planner (scope, no veto) | $preflight (gate, no veto) | $triage (routing, no veto)
$coder (execution, no veto)
```

### Interpretation

#### `$governance`

Highest authority for:

- constitutional compliance
- invariants
- contract surfaces
- ADR/migration/rollback bypass
- repo law conflicts

#### `$architect-security`

Highest authority when a change is both:

- structural
- security-sensitive

#### `$architect`

Authority for:

- module boundaries
- system shape
- undefined blast radius
- structural risk

#### `$security`

Authority for:

- auth
- secrets
- dependencies
- network exposure
- untrusted input
- trust surfaces

#### `$qa`

Authority for:

- acceptance criteria confidence
- regressions
- missing behavioral proof

#### `$review`

Authority for:

- merge readiness
- scope discipline
- atomicity
- missing required gates at final review stage

#### `$planner`

Defines feature contract and scope.  
No veto power, but owns the planning artifact.

#### `$preflight`

Confirms execution readiness.  
No veto authority in the constitutional sense, but it is a hard execution gate.

#### `$triage`

Routes requests.  
No veto authority, but decides initial classification and escalation path.

#### `$coder`

Only skill allowed to write production code.  
No veto authority.

---

## Precedence Rules

When two sources conflict, use this order:

`CONSTITUTION > AGENTS.md > NLSPEC > STATE > DECISIONS > TODO > verbal instruction`

### Meaning

- Constitutional law overrides all lower layers
- Repo routing/config in AGENTS.md overrides lower-level task artifacts
- NLSPEC overrides per-feature execution artifacts when normative system behavior is involved
- `.agents/STATE.<slug>.md` defines the current feature contract
- `.agents/DECISIONS.<slug>.md` records decisions inside the current contract
- `.agents/TODO.<slug>.md` governs task execution order only
- verbal instruction is lowest and must not bypass written control layers

---

## Source-of-Truth Policy by Rule Type

Use this table when deciding where a rule belongs.

| Rule type | Put it here |
| --- | --- |
| Immutable repository law | `.agents/_constitution.md` |
| Readable constitutional explanation | `docs/governance/constitution.md` |
| Repo-specific routing, flow choice, config expectations | `AGENTS.md` |
| Detailed skill procedure | `.agents/skills/<skill>/SKILL.md` |
| Feature-specific scope, blast radius, required gates | `.agents/STATE.<slug>.md` |
| Current task sequencing | `.agents/TODO.<slug>.md` |
| Local implementation choice | `.agents/DECISIONS.<slug>.md` |
| Durable architecture decision | `docs/governance/adr/<yy-mm-dd_slug>.md` |
| Change rigor classification | `docs/governance/levels.md` |
| Canonical execution flow reference | `docs/governance/workflows.md` |

---

## What Must Never Be Confused

### Constitution vs AGENTS

- Constitution = law
- AGENTS = routing + repo config

AGENTS may explain how to operate within the law.  
It must not weaken constitutional rules.

### AGENTS vs Skills

- AGENTS = which skill / which flow / repo expectations
- Skills = how each skill behaves in detail

A skill must not contradict AGENTS or constitution.

### STATE vs TODO

- STATE = what may be done
- TODO = in what execution order tasks are done

TODO must never expand the STATE contract.

### DECISIONS vs ADR

- DECISIONS = local feature memory
- ADR = durable structural record

Not every decision deserves an ADR.  
But any decision affecting architecture, invariants, public contracts, trust boundaries, or compatibility may require one.

### Human-readable mirror vs immutable source

- `.agents/_constitution.md` = source of truth
- `docs/governance/constitution.md` = readable mirror

The mirror exists for usability.  
It does not outrank the source.

---

## Who Produces What

| Artifact | Primary producer |
| --- | --- |
| `AGENTS.md` | repo maintainer |
| `.agents/_constitution.md` | repo maintainer / governance system |
| `docs/governance/constitution.md` | repo maintainer from constitutional source |
| `.agents/STATE.<slug>.md` | `$planner` |
| `.agents/TODO.<slug>.md` | initialized from template, then maintained during execution |
| `.agents/DECISIONS.<slug>.md` | initialized from template, then appended as decisions occur |
| ADR | `$adr` / architecture process |
| code changes | `$coder` only |

---

## Decision Escalation Map

Use this when deciding where to escalate.

### Escalate to `$governance`

When the issue involves:

- constitutional compliance
- invariants
- public contract policy
- migration/rollback policy
- bypass attempts
- conflicting instruction precedence

### Escalate to `$architect`

When the issue involves:

- module boundaries
- structural scope expansion
- architectural tension
- undefined blast radius
- pipeline/runtime shape

### Escalate to `$architect-security`

When the issue combines:

- structural change
- security/trust impact

### Escalate to `$security`

When the issue involves:

- secrets
- auth
- dependency trust
- network exposure
- untrusted input
- execution boundaries

### Escalate to `$planner`

When the issue is:

- stale STATE
- missing scope
- expanded allowed areas
- changed blast radius
- changed required gates

### Escalate to `$conflict`

When two authorities or artifacts contradict and the conflict remains unresolved.

---

## Anti-Drift Rule

If the same rule appears in multiple places, one file must be declared the source of truth and the others must only reference or mirror it.

Do not maintain parallel "almost identical" rule copies without an explicit ownership model.

If drift appears:

- identify the real source of truth
- align mirrors/reference docs
- remove ambiguous duplication

---

## Practical Reading Order

For a new contributor, the best order is:

- `AGENTS.md`
- `docs/governance/constitution.md`
- `docs/governance/levels.md`
- `docs/governance/workflows.md`
- `docs/governance/authority-map.md`

For active feature work, the operational order is:

- `AGENTS.md`
- `.agents/STATE.<slug>.md`
- `.agents/TODO.<slug>.md`
- `.agents/DECISIONS.<slug>.md`

---

## Bottom Line

When in doubt:

- ask which layer owns the rule
- follow precedence
- escalate rather than improvise
- never let a lower artifact silently override a higher one

