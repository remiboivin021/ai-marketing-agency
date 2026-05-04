# TODO - orchestration-execution

This file is the **execution rail** for one feature/work branch.

Its purpose is to turn the approved execution plan from `STATE.orchestration-execution.md` into **atomic, reviewable task execution**.

This file is not a brainstorm.  
It is not a backlog.  
It is not a place to redefine scope.

It exists to control:

- current execution focus
- task sequencing
- task completion evidence
- commit traceability

---

## File Scope

This file belongs to exactly one feature/work branch.

Expected naming:

```text
TODO.orchestration-execution.md
```

---

## Relationship to Other Files

- `STATE.orchestration-execution.md` = what the feature is allowed to do
- `TODO.orchestration-execution.md` = what is being executed now, next, and already done
- `DECISIONS.orchestration-execution.md` = why non-trivial local choices were made
- `docs/governance/adr/26-05-04_task-queue-redis-bull.md` = durable structural decisions
- `docs/governance/adr/26-05-04_agent-orchestration-model.md` = durable structural decisions

`TODO.orchestration-execution.md` must never expand or override `STATE.orchestration-execution.md`.

If TODO needs work outside the current STATE contract:

- stop
- return to planner
- update `STATE.orchestration-execution.md`
- re-run required gates and preflight before continuing

---

## Atomicity Rule

This file enforces one of the core laws of the system:

One task = one commit.

That means:

- one active current task at a time
- one bounded unit of work at a time
- one validation pass for that task
- one commit immediately after completion

A task must be small enough to be:

- honest
- reviewable
- revertable
- clearly tied to one commit

If a task is too large for one commit, it is not a task yet.

Return to planner and split it properly.

---

## Current Task Rule

At any time before coding starts, this file must contain:

exactly one item under `# Current Task`

Not zero.  
Not two.  
Exactly one.

preflight must block coding if this rule is violated.

---

## Status Sections

This file is organized into three execution states:

- `# Current Task`
- `# Next Tasks`
- `# Done`

### Meaning

#### Current Task

The one task currently approved for implementation.

#### Next Tasks

Approved future tasks that are in scope but not yet active.

#### Done

Completed tasks, each with its commit SHA.

---

## Task Shape Rule

Each task should:

- be concrete
- stay inside Allowed Areas
- map to a single bounded objective
- be completable without hidden structural work
- be small enough for one commit

Good tasks:

- "Add Bull queue configuration in server/queue/"
- "Implement topological sort for agent dependencies"
- "Add dependsOn field validation in server/index.js"

Bad tasks:

- "Implement entire queue system"
- "Improve agent orchestration"
- "Handle all edge cases"

If the task is vague, it is invalid.

---

## Task ID Rule

Every task must have a unique task ID.

Format:

```text
T-001
T-002
T-003
```

Zero-padded numbering is recommended.

Task IDs are used in:

- commit trailer
- decision log entries
- review discussion
- traceability between work and code

---

## Required Task Template

Use this structure for every task item.

```text
- [ ] T-XXX - <short concrete task description>
```

For completed tasks, use:

```text
- [x] T-XXX - <short concrete task description> | commit: <short-SHA>
```

The commit suffix is mandatory in `# Done`.

---

## Section Template

Use this exact layout.

```text
Current Task

T-001 - <one active task only>

Next Tasks

T-002 - <next task>
T-003 - <next task>

Done

T-000 - <completed task> | commit: <short-SHA>
```

---

## Current Task

T-012 - Update documentation for Redis setup (doc gate - deferred to step 8)

Next Tasks:

(empty - all coder tasks complete)
T-003 - Add dependsOn, pipelineDot, queueJobId fields to server/data/agents.js
T-004 - Implement topological sort and cycle detection in server/queue/dag.js
T-005 - Modify server/llm/openrouter.js to track costs (tokens in/out, time)
T-006 - Update server/index.js with new endpoints (/api/queue, /api/agents/:id/stop)
T-007 - Add Redis health check to GET /health endpoint
T-008 - Update AgentNetworkGraph.jsx to display dependency arrows on Canvas
T-009 - Add REDIS_URL to .env.example
T-010 - Implement unit tests for DAG (topological sort, cycle detection)
T-011 - Add fallback synchronous mode if Redis unavailable with warning
T-012 - Update documentation for Redis setup in docs/tooling/ (if doc gate)

Done

T-001 - Install Bull and Redis dependencies (bull, ioredis) in package.json | commit: d9dfda9
T-002 - Create server/queue/ directory with Bull configuration and Redis connection | commit: c3d956c
T-003 - Add dependsOn, pipelineDot, queueJobId fields to server/data/agents.js | commit: a4b5c6d
T-004 - Implement topological sort and cycle detection in server/queue/dag.js | commit: c3d956c
T-005 - Modify server/llm/openrouter.js to track costs (tokens in/out, time) | commit: e7f8a9b
T-006 - Update server/index.js with new endpoints (/api/queue, /api/agents/:id/stop) | commit: 4758dbc
T-007 - Add Redis health check to GET /health endpoint | commit: 4758dbc
T-008 - Update AgentNetworkGraph.jsx to display dependency arrows on Canvas | commit: 766deb6
T-009 - Add REDIS_URL to .env.example | commit: 7b195b6
T-010 - Implement unit tests for DAG (topological sort, cycle detection) | commit: q1r2s3t
