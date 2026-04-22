# Quickstart

This page is the shortest valid path to work safely in an initialized repository.

Read this first if you want to start using the agent system without reverse-engineering the full governance stack.

---

## Read Order

Read these files in this order:

1. `AGENTS.md`
2. `docs/governance/constitution.md`
3. `docs/governance/levels.md`
4. `docs/governance/workflows.md`

That is the minimum context required before starting feature work.

---

## What the System Expects

This repository is governed.

That means:

- coding never starts from a vague request
- every change must have a scope contract
- protected branches are forbidden for implementation
- work happens in dedicated worktrees
- risky work is escalated before coding
- one task = one commit
- drift requires re-planning, not improvisation

---

## The Smallest Valid Flow

For a normal feature or bug fix, the smallest valid flow is:

```text
triage -> planner -> preflight -> coder -> qa/review/doc as required by level and flow
```

For structural or sensitive work, architecture / ADR gates come before preflight.

See `docs/governance/workflows.md`.

---

## Step-by-Step Start

### 1. Create a dedicated worktree

Never work in the primary checkout.

Expected branch formats:

- `feature/<slug>`
- `fix/<slug>`
- `refactor/<slug>`

Example:

```bash
git worktree add ../wt-my-change -b feature/my-change
```

### 2. Enter the new worktree

Example:

```bash
cd ../wt-my-change
```

### 3. Make sure the repo is initialized

Before feature work begins, these must already exist and be valid:

- `AGENTS.md` fully initialized
- `.agents/_constitution.md`
- `docs/governance/constitution.md`
- `.agents/_STATE.md`
- `.agents/_TODO.md`
- `.agents/_DECISIONS.md`

If `AGENTS.md` still contains template placeholders, preflight must block coding.

### 4. Run triage

Triage decides:

- change type
- level (`L1`, `L2`, `L3`)
- selected flow
- likely required gates
- whether governance must happen first

If governance is required, stop and do that first.

### 5. Run planner

Planner creates the feature contract:

- `.agents/STATE.<slug>.md`

Planner must make explicit:

- mission
- acceptance criteria
- allowed areas
- forbidden areas
- blast radius
- required gates
- execution plan
- drift rules

No STATE -> no coding.

### 6. Initialize working artifacts

Create:

- `.agents/TODO.<slug>.md` from `.agents/_TODO.md`
- `.agents/DECISIONS.<slug>.md` from `.agents/_DECISIONS.md`

Rules:

- `.agents/TODO.<slug>.md` must have exactly one item under `# Current Task`
- `.agents/DECISIONS.<slug>.md` may start empty but must exist

### 7. Satisfy required gates before preflight

Depending on level and triggers, you may need:

- `$governance`
- `$architect`
- `$architect-security`
- `$security`
- `$adr`

Preflight does not invent readiness.  
It only verifies readiness.

If a gate is required, satisfy it first.

### 8. Run preflight

Preflight confirms:

- correct branch and worktree
- not on primary checkout
- initialized AGENTS.md
- constitution source and mirror present
- `.agents/STATE.<slug>.md` complete
- immutable templates present
- working artifacts initialized
- required gates satisfied
- collision/conflict risk resolved
- STATE still fresh

If any prerequisite is missing:

`BLOCKED`

### 9. Start coding only after PASS

Only `$coder` writes production code.

During implementation:

- stay inside Allowed Areas
- do not refactor opportunistically
- do not expand scope silently
- log significant non-trivial choices in `.agents/DECISIONS.<slug>.md`

### 10. Commit every completed task immediately

Rules:

- one task = one commit
- commit immediately after completion
- commit format:

```text
type(scope): description
```

plus trailer: `Task: T-NNN`

Every completed task in `.agents/TODO.<slug>.md` must end with:

`| commit: <short-SHA>`

---

## Hard Stops

Stop immediately if any of the following happens:

- you need files outside Allowed Areas
- blast radius is larger than expected
- architecture tension appears
- trust/security surface appears unexpectedly
- public contract impact changes
- required gates change
- planner assumptions become invalid

When that happens:

- stop coding
- return to planner
- update `.agents/STATE.<slug>.md`
- satisfy any newly required gates
- re-run preflight

---

## Minimal Mental Model

Use this model:

- `AGENTS.md` = routing + project configuration
- `constitution.md` = governing law
- `levels.md` = rigor classification
- `.agents/STATE.<slug>.md` = feature contract
- `.agents/TODO.<slug>.md` = execution rail
- `.agents/DECISIONS.<slug>.md` = local decision memory
- `preflight` = final readiness gate
- `$coder` = only code writer

---

## What Not To Do

Do not:

- code directly on `main`, `master`, `develop`, or `trunk`
- start coding before STATE exists
- treat AGENTS template placeholders as harmless
- create structural changes inside a normal feature without escalation
- use large "cleanup" edits during scoped work
- assume a gate is satisfied because it is mentioned in a flow
- continue when drift appears

---

## Ready-to-Start Checklist

- Dedicated worktree created
- Valid branch name
- Not in primary checkout
- AGENTS.md initialized
- Constitution source + mirror present
- Triage completed
- `.agents/STATE.<slug>.md` created
- `.agents/TODO.<slug>.md` initialized
- `.agents/DECISIONS.<slug>.md` initialized
- Required gates satisfied
- Preflight PASS obtained

If one box is missing, you are not ready to code.

---

## Where To Go Next

After this page, read:

- `docs/governance/authority-map.md`
- `docs/governance/workflows.md`
- `docs/governance/levels.md`

These three documents make the system much easier to operate consistently.

