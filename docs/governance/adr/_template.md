# ADR-XXX — <title>

## Status

Choose one:

- Proposed
- Accepted
- Rejected
- Superseded

---

## Context

What problem are we solving?

Describe:
- the system pressure or decision point
- why this cannot be safely left implicit
- what changed in the repo, architecture, contract surface, or risk profile
- what constraints shape the decision

Be specific.

---

## Decision

State the chosen decision clearly.

This section should answer:

- what was chosen
- what is now allowed
- what is now forbidden
- which boundaries or contracts this decision affects
- what future work must assume from now on

Avoid vague wording.

---

## Alternatives Considered

List the serious alternatives that were evaluated.

For each alternative, explain briefly:
- why it was considered
- why it was not chosen

Example structure:

### Option A — <name>
- Benefits:
- Risks:
- Why not chosen:

### Option B — <name>
- Benefits:
- Risks:
- Why not chosen:

---

## Affected Invariants

List the invariants affected by this decision.

Examples:

- `I-01`
- `I-03`

If no invariant is affected, say so explicitly.

If invariants are affected, explain whether they are:
- preserved
- refined
- extended
- changed

Any invariant change must remain consistent with constitutional rules.

---

## Contract / Surface Impact

Does this decision affect any of the following?

- public API
- CLI
- config
- schema
- file format
- pipeline semantics
- runtime behavior
- trust boundary
- external integrations

For each affected surface, describe:
- what changes
- who is impacted
- whether compatibility is preserved

---

## Migration Path

Required whenever compatibility, persisted data, public contracts, config, schema, file format, or runtime assumptions change.

Describe:
- what must move from old to new
- whether migration is additive, staged, or breaking
- sequencing constraints
- compatibility window if any
- fallback behavior during migration

If not applicable, write:

`No migration required.`

---

## Rollback Plan

Required whenever reversal is non-trivial, risky, or operationally important.

Describe:
- whether rollback is possible
- what must be reverted
- what data or state may be left behind
- what the rollback trigger would be
- what must be monitored after rollback

If rollback is intentionally not supported, say so and justify why.

---

## Consequences

### Positive
What becomes better because of this decision?

Examples:
- simpler architecture
- reduced ambiguity
- safer trust boundary
- better reviewability
- cleaner contract ownership

### Negative
What cost or tradeoff does this decision introduce?

Examples:
- more process
- migration burden
- stricter coupling
- reduced short-term flexibility
- added documentation or tooling cost

### Follow-up Debt
What remains unresolved on purpose?

List debt explicitly rather than hiding it.

---

## Required Follow-Up

List any required next actions.

Examples:
- update `AGENTS.md`
- update `docs/governance/workflows.md`
- add migration tooling
- add tests
- update documentation
- create follow-up ADR
- notify downstream consumers

Use concrete items.

---

## References

Link the decision to the relevant artifacts.

Examples:
- `.agents/STATE.<slug>.md`
- `.agents/DECISIONS.<slug>.md`
- related ADRs
- affected modules/files
- issue/ticket references if your repo uses them

---

## Decision Quality Checklist

- [ ] Problem is clearly stated
- [ ] Decision is explicit
- [ ] Alternatives were actually considered
- [ ] Invariant impact is documented
- [ ] Contract/surface impact is documented
- [ ] Migration path is present if needed
- [ ] Rollback plan is present if needed
- [ ] Consequences are honest
- [ ] Required follow-up is listed
- [ ] References are included
