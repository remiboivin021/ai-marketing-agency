# ADR Index

This directory contains the durable Architecture Decision Records for this repository.

ADRs are used when a decision is too important to remain implicit.

They exist to make structural reasoning, contract evolution, compatibility choices, and long-term tradeoffs reviewable over time.

---

## Purpose

Use ADRs to record decisions that affect:

- architecture boundaries
- invariants
- public contracts
- config/schema/file format compatibility
- runtime semantics
- trust boundaries
- migration strategy
- rollback strategy
- durable operational assumptions

ADRs are not for routine local implementation choices.

Those belong in:

- `.agents/DECISIONS.<slug>.md`

---

## Source Relationship

ADRs are part of the durable decision layer.

They sit above feature-local memory and below constitutional law.

### Related layers

- `.agents/_constitution.md` -> immutable governing law
- `AGENTS.md` -> routing + repo-level configuration
- `.agents/STATE.<slug>.md` -> feature-specific scope contract
- `.agents/DECISIONS.<slug>.md` -> local feature decision memory
- `docs/governance/adr/<yy-mm-dd_slug>.md` -> durable structural decision record

---

## When an ADR Is Required

Create an ADR when a change affects or may affect:

- system invariants
- module/package boundaries
- public API / CLI contracts
- config structure or compatibility
- schemas or file formats
- pipeline/runtime semantics
- trust boundaries
- migration requirements
- rollback-sensitive design choices
- long-lived repo governance assumptions

If the constitution, governance flow, architect gate, or preflight policy says ADR is required, implementation must not proceed until the ADR gate is satisfied.

---

## When an ADR Is Not Required

Do **not** create an ADR for:

- small local fixes
- narrow feature implementation choices
- test-only work
- documentation-only work
- isolated refactors with no durable architectural effect
- temporary implementation details that do not change long-term system assumptions

If the choice matters only inside the current feature and does not alter durable system shape, record it in `.agents/DECISIONS.<slug>.md` instead.

---

## File Naming Rule

Use this format:

```text
docs/governance/adr/<yy-mm-dd_slug>.md
```

Examples:

- `docs/governance/adr/26-03-06_runtime-graph-contract.md`
- `docs/governance/adr/26-03-06_config-schema-compatibility.md`
- `docs/governance/adr/26-03-06_plugin-trust-boundary.md`

Rules:

- use `<yy-mm-dd_slug>.md` naming
- one ADR = one primary decision
- filename should be stable and descriptive
- avoid vague names like `26-03-06_update.md`

---

## Template Rule

Every new ADR must be created from:

- `docs/governance/adr/_template.md`

Do not invent ad hoc ADR structure.

The template exists to force consistent treatment of:

- context
- decision
- alternatives
- invariant impact
- contract impact
- migration
- rollback
- consequences
- follow-up

---

## Status Model

Each ADR must declare one status:

- Proposed
- Accepted
- Rejected
- Superseded

### Meaning

#### Proposed

The decision is under active evaluation and is not yet binding.

#### Accepted

The decision is approved and becomes part of the repository's durable reasoning.

#### Rejected

The decision was considered and explicitly not adopted.

#### Superseded

A later ADR has replaced this one.

---

## Required Quality Bar

A good ADR must make it obvious:

- what problem existed
- why this needed durable documentation
- what was chosen
- what alternatives were considered
- what invariants or contract surfaces are affected
- whether migration is needed
- whether rollback is needed
- what tradeoffs remain
- what follow-up work is required

If these are missing, the ADR is incomplete.

---

## Relationship to Migration and Rollback

Migration and rollback sections are mandatory whenever applicable.

They are especially important for decisions involving:

- schema/config/file format changes
- public contracts
- persisted state
- runtime behavior assumptions
- compatibility windows
- operational deployment changes

A structural decision without migration/rollback thinking is often incomplete.

---

## Relationship to Governance

An ADR does not override constitutional law.

Precedence still applies:

`CONSTITUTION > AGENTS.md > NLSPEC > STATE > DECISIONS > TODO > verbal instruction`

ADRs are durable structural records, not a mechanism to bypass higher-order rules.

If an ADR conflicts with constitution or repo law, the conflict must be escalated and resolved - not silently accepted.

---

## Relationship to Feature Work

A feature may trigger an ADR.

Typical sequence:

`triage -> planner -> architect / architect-security -> adr -> preflight -> coder`

That means:

- planner identifies that durable decision-making is needed
- architecture/security gate resolves the design direction
- ADR records the durable decision
- only then can preflight confirm readiness

---

## Index Maintenance Rules

When creating a new ADR:

- create the new file from `_template.md`
- use the date-slug naming format `<yy-mm-dd_slug>.md`
- add it to the index below
- link related ADRs when relevant
- update superseded ADRs if applicable

Keep the index current.

---

## ADR List

Update this list whenever a new ADR is added.

- 26-03-06_example-title.md - `<title>`
- 26-03-07_example-title.md - `<title>`
- 26-03-08_example-title.md - `<title>`

---

## Practical Rule of Thumb

Use `.agents/DECISIONS.<slug>.md` for:

- local implementation choices
- feature-scoped reasoning
- temporary tradeoffs inside the current contract

Use `docs/governance/adr/<yy-mm-dd_slug>.md` for:

- decisions future contributors must know months later
- durable changes to system shape or compatibility
- decisions that affect how future work must be done

If forgetting the decision later would create architectural confusion, it probably deserves an ADR.


