# Workflows

This document defines the canonical execution sequences for repository work.

Its purpose is to make flow selection obvious and to keep `triage`, `planner`, `preflight`, and downstream gates aligned.

If a request does not clearly fit a flow, classify conservatively and escalate rather than improvising a custom sequence.

---

## Core Rule

A flow is valid only if:

- the request type is correctly classified
- the change level is honestly classified
- required gates are satisfied before execution
- preflight happens immediately before coding
- coding never starts on assumptions

---

## Flow Selection Rule

Select the flow based on the dominant risk of the requested change.

Use:

- **Standard Feature** for bounded additive work inside known system boundaries
- **Bug Fix** for correcting existing behavior without structural redesign
- **Structural Change** for architecture, contract, schema, runtime-shape, or boundary work
- **Security-Sensitive Change** for work that touches trust, exposure, secrets, auth, or untrusted execution/input surfaces

If the request touches constitutional or invariant surfaces, governance comes first.

If uncertain between two flows, choose the stricter one.

---

## 1. Standard Feature

### When to use

Use this flow when the change:

- adds or extends behavior within existing boundaries
- remains inside known module structure
- does not alter invariants or public contract compatibility
- does not require architecture redesign
- does not introduce a structural trust/safety issue

### Canonical flow

```text
triage -> planner -> preflight -> coder -> qa -> review -> doc -> release
```

### Notes

- doc may be light, but is still expected if behavior, config, API, or operator understanding changes
- release may be lightweight depending on repo policy, but remains part of the canonical path for feature work
- if structural tension appears during planning or execution, stop and escalate to the structural flow

---

## 2. Bug Fix

### When to use

Use this flow when the change:

- fixes existing behavior
- does not require architecture redesign
- does not alter invariants
- does not require migration/rollback planning
- stays inside existing system shape

### Canonical flow

```text
triage -> planner -> preflight -> coder -> qa -> review
```

### Notes

- if the bug reveals a structural issue, contract issue, or security issue, reclassify immediately
- doc may still be added if user-visible behavior, operational behavior, or known issue tracking requires it
- a "bug fix" label must not be used to bypass stricter gates

---

## 3. Structural Change

### When to use

Use this flow when the change affects or may affect:

- module/package boundaries
- runtime shape
- orchestration/pipeline semantics
- schema/config/file format structure
- public contract behavior requiring durable design reasoning
- migration or rollback-sensitive decisions
- architectural invariants

### Canonical flow

```text
governance? -> triage -> planner -> architect -> adr -> preflight -> coder -> qa -> review -> doc -> release
```

### Meaning of each step

- `governance?` is required first when constitutional or invariant surfaces are touched
- `triage` classifies the request and selects the structural flow
- `planner` defines the feature contract and expected blast radius
- `architect` resolves the structural decision
- `adr` records the durable decision when required
- `preflight` verifies readiness only after required structural gates are satisfied
- `coder` executes within the approved contract
- `qa` validates correctness and regression confidence
- `review` checks merge integrity and scope discipline
- `doc` updates architecture/behavior understanding
- `release` validates downstream readiness where applicable

### Notes

- do not place preflight before planner or architect
- preflight validates readiness; it does not invent missing structural approval
- if ADR is required, coding must not begin until the ADR gate is satisfied

---

## 4. Security-Sensitive Change

### When to use

Use this flow when the change affects:

- auth / authorization
- secrets / credentials
- dependency trust
- network exposure
- untrusted input
- execution surfaces
- trust boundaries
- plugin / connector / command execution risk

Use this flow especially when security and structure are both involved.

### Canonical flow

```text
governance? -> triage -> planner -> architect-security -> adr -> preflight -> coder -> security -> qa -> review -> doc -> release
```

### Meaning of each step

- `governance?` comes first if invariant or constitutional surfaces are touched
- `triage` classifies the request as security-sensitive
- `planner` defines scope, blast radius, and required gates
- `architect-security` resolves the combined structural/security decision
- `adr` records the durable design when required
- `preflight` confirms all readiness conditions before coding
- `coder` performs implementation
- `security` performs dedicated security review/validation where required
- `qa` validates behavior and regressions
- `review` checks final scope/merge discipline
- `doc` updates security/operational/behavioral understanding
- `release` validates downstream readiness

### Notes

- if the change is only security-relevant but not structural, the repository may choose a lighter path, but the canonical sensitive flow remains the safe default
- do not use a normal feature flow to bypass trust-surface review

---

## Governance-First Rule

Governance must happen before the selected flow when the request touches or may touch:

- constitutional rules
- invariants
- public contract policy
- migration policy
- rollback policy
- ADR-required surfaces
- trust boundary ownership ambiguity
- conflicts between higher-order rules

### Canonical prefix

`governance -> triage -> ...`

If governance says the request is blocked, no downstream flow may continue.

---

## Preflight Placement Rule

Preflight always sits after planning and after all required upstream gate satisfaction, and immediately before coder.

### Correct pattern

`... -> planner -> required gates -> preflight -> coder ...`

### Incorrect pattern

`... -> preflight -> planner ...`

### Why

- preflight depends on `.agents/STATE.<slug>.md`
- preflight checks required gates are satisfied
- preflight is an execution-readiness gate, not a planning gate

---

## Reclassification Rule

A flow is not permanent if reality changes.

Reclassify immediately if:

- blast radius increases
- forbidden areas become necessary
- public contract impact appears
- migration/rollback becomes necessary
- trust/security surfaces appear
- architecture tension appears
- planner assumptions fail

### Required action on reclassification

- stop coding
- return to planner
- update `.agents/STATE.<slug>.md`
- satisfy any newly required gates
- re-run preflight before coding resumes

---

## Flow vs Level

Flows and levels are related, but not identical.

- L1 usually maps to a light version of standard feature or bug fix flow
- L2 usually maps to standard feature or bounded bug fix
- L3 usually maps to structural or security-sensitive flow

The level expresses rigor.  
The flow expresses sequence.

Both must be consistent.

See `docs/governance/levels.md`.

---

## Canonical Summary Table

| Work type | Canonical flow |
| --- | --- |
| Standard feature | triage -> planner -> preflight -> coder -> qa -> review -> doc -> release |
| Bug fix | triage -> planner -> preflight -> coder -> qa -> review |
| Structural change | governance? -> triage -> planner -> architect -> adr -> preflight -> coder -> qa -> review -> doc -> release |
| Security-sensitive change | governance? -> triage -> planner -> architect-security -> adr -> preflight -> coder -> security -> qa -> review -> doc -> release |

---

## Non-Negotiable Summary

- No correct classification -> no valid flow
- No STATE -> no preflight PASS
- No satisfied required gates -> no preflight PASS
- No preflight PASS -> no coding
- No drift handling -> no safe continuation

A workflow is not a suggestion.

It is the sequence that keeps speed from turning into debt.

