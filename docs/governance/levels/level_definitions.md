# Change Level Definitions

This document defines the rigor level for repository work. Its purpose is to ensure that:

- Low-risk local changes do not pay structural-process cost
- Bounded feature work gets the right amount of validation
- Structural and sensitive changes are escalated before implementation
- `triage`, `planner`, and `preflight` use the same language

If uncertain between two levels, choose the higher level.

---

## L1 - Local low-risk change

### Typical examples

- Doc-only change
- Test-only change
- Typo, wording, or message fix
- Highly localized bug fix
- Internal non-structural code edit in one bounded area
- Narrow implementation cleanup with no behavior or contract impact

### Required flow

```
triage -> planner -> preflight -> coder -> review
```

### Optional downstream gates

- `qa` if behavior changed
- `doc` if user-facing or operator-facing documentation changed
- `release` only if the repository requires release tracking even for low-risk changes

### Constraints

All of the following should remain true:

- No architecture trigger
- No security trigger
- No public contract change
- No invariant surface touched
- No migration required
- No forbidden area touched
- No undefined blast radius
- No more than 3 files unless explicitly justified by planner

### Typical shape

L1 should stay:
- Local
- Reviewable
- Easy to revert
- Free of structural implications

If the change stops being clearly local, it is no longer L1.

---

## L2 - Standard bounded feature/change

### Typical examples

- Normal feature inside existing module boundaries
- Bug fix touching several files
- Approved local refactor
- Behavior change within existing contracts
- Additive capability with bounded blast radius
- Implementation extension that does not alter invariants or contract compatibility

### Required flow

```
triage -> planner -> preflight -> coder -> qa -> review -> doc (if needed)
```

### Constraints

The following must hold:
- Blast radius is bounded and understood
- No invariant change
- No schema/public contract break
- No migration required unless escalated to L3
- No unresolved trust-boundary ambiguity
- No structural redesign hidden inside "normal feature work"

### Typical shape

L2 is the default level for:
- Real feature work
- Real bug fixing
- Bounded internal improvements

It may span multiple files and real behavior, but it still stays inside known system boundaries.

If the change starts to affect contracts, boundaries, schema, runtime semantics, or security-sensitive surfaces, it is no longer L2.

---

## L3 - Structural or sensitive change

### Typical examples

- Module or package boundary change
- Config contract change
- Dependency introduction or meaningful dependency upgrade
- Schema evolution
- File format change
- Pipeline semantics change
- Runtime orchestration change
- Public API / CLI contract change
- Migration-required change
- Rollback-sensitive change
- Security-sensitive feature
- Trust boundary change
- Blast radius unclear or cross-system

### Required flow

```
governance if invariant/contract surface touched
-> triage
-> planner
-> architect or architect-security
-> adr
-> preflight
-> coder
-> doc
-> security (if needed)
-> qa
-> review
-> release
```

### Constraints

The following are mandatory when applicable:
- ADR required for invariant, structural, or contract-affecting decisions
- Migration plan required when compatibility or persisted/public surfaces change
- Rollback plan required when reversal is non-trivial or risk is elevated
- All required gates must be explicitly satisfied before preflight may PASS
- No implementation may start while boundary, contract, or trust-surface ambiguity remains unresolved

### Typical shape

L3 is used when the cost of misclassification is high.

This includes changes where:
- The system shape may change
- External or public expectations may change
- Trust or security assumptions may change
- The repo needs durable decision records
- Downstream consumers may be affected

If the request feels "too important to guess," it is L3.

---

## Escalation Rules

Escalate from L1 or L2 to L3 immediately if any of the following becomes true:

- A public contract is affected
- A schema, config, file format, or pipeline semantic changes
- A migration or rollback concern appears
- A forbidden area must be touched
- A trust boundary or security surface becomes relevant
- The blast radius becomes unclear
- Planner can no longer keep the change bounded safely

When this happens:
- Stop execution
- Return to planner
- Update `STATE.<slug>.md`
- Trigger the required gates before coding continues

---

## Selection Rule

Use the lowest level that is still honest.

Do not classify low just to reduce process cost.

A wrong low classification is more expensive than a correct escalation.

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>