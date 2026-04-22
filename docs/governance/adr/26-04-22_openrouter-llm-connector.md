# ADR-001 — OpenRouter LLM Connector

## Status

Proposed

---

## Context

We need spawned agents to execute tasks by calling an LLM. When a user spawns an agent with a task description, the agent must:

1. Call an LLM (pass task + skill pipeline instructions)
2. Track execution state (pending → running → done/error)
3. Return the result to the agent's state in `agents.json`

The dashboard is a multi-agent development system. The skill pipeline (triage → planner → architect → adr → preflight → coder → qa → review → doc → release) must run inside a spawned agent — not as hard-coded logic. This means: the agent receives a task, calls an LLM, and the LLM produces code or decisions based on the skill instructions.

**Constraints shaping the decision:**

- OpenRouter is requested (single API key, multiple model providers)
- Must not log API keys (§12 observability hygiene)
- API key must not be in source code
- MVP: sync requests with polling-based status (no WebSocket/SSE)
- State must be persisted to `agents.json` (invariant I-03, I-10)
- Frontend reads from backend API only (invariant I-01)

---

## Decision

**Adopt OpenRouter as the LLM connector for agentic task execution.**

### Credential Management

- Store `OPENROUTER_API_KEY` in `.env` (gitignored)
- Server reads from `process.env.OPENROUTER_API_KEY`
- Key is never logged, never returned in API responses
- Missing key → server refuses to start (fail-fast)

### Call Pattern (MVP)

- **Sync request**: POST to OpenRouter, await response
- **Polling status**: execution state written to `agents.json` sub-agents on write
- No streaming (WebSocket/SSE forbidden per AGENTS.md invariant I-02)
- **Timeout**: 60s per LLM call, then error state

### Model Selection

- Default: `anthropic/claude-3.5-sonnet` (balanced cost/quality)
- Configurable per agent via `model` field in spawn request
- OpenRouter supports model aliases — no lock-in

### Skill Pipeline Integration

The LLM receives a **system prompt** that encodes the skill pipeline:

```
You are an agentic coding system. Execute tasks following this pipeline:
1. triage — classify the request
2. planner — produce STATE.<slug>.md
3. architect — structural review
4. adr — durable decisions
5. preflight — validate before coding
6. coder — implement (ONE task = ONE commit)
7. qa — validate
8. review — scope/contract check
9. doc — update docs
10. release — merge readiness

Return your reasoning and output in structured JSON.
```

The agent's task description becomes the `user` message. The skill pipeline is the `system` prompt.

### Sub-Agent State Model

Each sub-agent (skill execution) tracks:

```json
{
  "id": "s<N>",
  "task": "human-readable task description",
  "skill": "triage|planner|architect|...",
  "status": "pending|running|done|error",
  "model": "anthropic/claude-3.5-sonnet",
  "created_at": "ISO8601",
  "completed_at": "ISO8601|null",
  "result": "LLM response text|null",
  "error": "error message|null",
  "logs": ["step log entries"]
}
```

### Error Handling

- OpenRouter error → sub-agent status = `error`, `error` field populated
- Timeout → same treatment
- Invalid API key → server logs "OPENROUTER_API_KEY invalid" and refuses agent spawns
- Network failure → retry once, then error

---

## Alternatives Considered

### Option A — Anthropic Direct API

Use `https://api.anthropic.com/v1/messages` directly.

- **Benefits**: simpler auth (API key only), free tier, no provider abstraction
- **Risks**: single-model, harder to switch providers later, no unified billing
- **Why not chosen**: OpenRouter was explicitly requested; multiple provider support is a future-proofing benefit

### Option B — LiteLLM proxy

Self-host LiteLLM to abstract multiple LLM providers behind one internal API.

- **Benefits**: provider-agnostic, unified API, retry logic built-in
- **Risks**: infrastructure complexity (Docker + managed model endpoints), additional operational burden, another service to maintain
- **Why not chosen**: Overkill for MVP. Adds infra that isn't needed yet.

### Option C — No LLM (hard-coded skill logic)

Encode skill pipeline as TypeScript/JavaScript functions, no LLM calls.

- **Benefits**: deterministic, no API cost, no external dependency
- **Risks**: inflexible, can't adapt to new tasks, defeats the "agentic" purpose
- **Why not chosen**: Core requirement is agentic execution via LLM, not scripted behavior

---

## Affected Invariants

| Invariant | Effect | Status |
|----------|--------|--------|
| I-03 — Trust boundaries explicit, default-deny | **REFINED** | OpenRouter is explicitly enabled as a connector with security rules |
| I-09 — Connectors opt-in, security-reviewed | **REFINED** | OpenRouter is the named, approved connector with credential rules |
| I-10 — Operations deterministic | **ACKNOWLEDGED** | LLM calls are non-deterministic by nature. State model tracks execution but not results. Human review gate remains. |

No invariant is changed — all are explicitly refined or acknowledged.

---

## Contract / Surface Impact

| Surface | Change |
|---------|--------|
| `POST /api/agents` | Signature expanded: `task`, `model` optional fields. Response includes `subAgents[].status`. |
| `server/data/agents.json` | Schema expanded: each project gets `subAgents[]` array with execution state fields. |
| Frontend (AgentNetworkGraph.jsx) | No contract change — reads existing shape, may show sub-agent status indicators. |
| `.env` | New required variable: `OPENROUTER_API_KEY`. Not tracked in git. |

Compatibility: additive-only. Existing agents.json entries without `subAgents` default to `[]`. No migration needed for existing data.

---

## Migration Path

No migration required.

- New `subAgents` field: additive. Old projects get `[]` by default.
- `task` and `model` fields in spawn: optional. Existing UI flow unchanged.
- Schema is backward-compatible.

If rollback is needed: remove `subAgents` write logic from `spawnProject()`, revert schema — existing agents stay valid.

---

## Rollback Plan

Rollback is fully supported:

1. Set `OPENROUTER_API_KEY` to empty string or remove from `.env`
2. `spawnProject()` returns error immediately — no LLM call attempted
3. Existing `agents.json` data remains — `subAgents` just become stale history
4. No orphaned records — state is co-located with agent definition

**Rollback trigger**: empty/missing `OPENROUTER_API_KEY` or `LLM_ENABLED=false` in `.env`.

**No special monitoring required** — agents without sub-agents simply idle.

---

## Consequences

### Positive
- Agents can execute tasks autonomously via LLM
- Skill pipeline becomes an executable LLM prompt — portable across models
- OpenRouter gives multi-provider flexibility without code changes
- State model enables observability of skill execution progress

### Negative
- LLM calls introduce non-determinism — results must be human-reviewed
- API cost per spawned agent (token-based)
- OpenRouter adds an external service dependency
- Execution is sync+blocking for MVP (latency risk for large tasks)

### Follow-up Debt
- Streaming execution (WebSocket/SSE) not in MVP scope
- Retry strategy with backoff not implemented (single retry only)
- Cost tracking per agent not implemented
- Multiple concurrent agent executions not supported in MVP

---

## Required Follow-Up

- [ ] Update `AGENTS.md` → add OpenRouter to Runtime Contract
- [ ] Add `OPENROUTER_API_KEY` to `.env.example`
- [ ] `$security` gate sign-off (API key + call pattern)
- [ ] `$architect` review (LLM orchestration module design)
- [ ] NLSpec for LLM execution state model
- [ ] Planner produces `STATE.agentic-llm.md`

---

## References

- `server/data/agents.js` — agent persistence
- `server/data/agents.json` — state storage
- `AGENTS.md` — skill pipeline definition
- `docs/governance/constitution.md` §9.2 — security gate mandate

---

## Decision Quality Checklist

- [x] Problem is clearly stated
- [x] Decision is explicit
- [x] Alternatives were actually considered
- [x] Invariant impact is documented
- [x] Contract/surface impact is documented
- [x] Migration path is present if needed
- [x] Rollback plan is present if needed
- [x] Consequences are honest
- [x] Required follow-up is listed
- [x] References are included