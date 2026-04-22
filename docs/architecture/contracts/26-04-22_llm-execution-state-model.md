# NLSpec — LLM Execution State Model

> Normative contract for sub-agent execution state in agentic task execution.
> Defines the complete schema, contracts, data flow, failure modes, and acceptance criteria.

---

## 1. Overview and Goals

### 1.1 Purpose

When an agent is spawned with a `task`, the backend executes a skill pipeline by calling OpenRouter.
Each step of that pipeline (triage, planner, coder, etc.) is tracked as a **sub-agent** with a deterministic state model.

This spec defines:
- the sub-agent state schema
- the API contract for `POST /api/agents`
- the persistence contract to `agents.json`
- the LLM call contract (OpenRouter)
- the failure taxonomy
- the observability requirements
- the security constraints

### 1.2 Goals

1. Sub-agents track execution state (pending → running → done/error) per skill step.
2. State is persisted immediately on each state transition.
3. The frontend reads sub-agent state via the existing `GET /api/agents` contract.
4. LLM calls use OpenRouter with the skill pipeline as system prompt.
5. Security mitigations from the `$security` gate are enforceable.

### 1.3 Non-Goals

- LLM responses are **stored, not executed** (MVP constraint).
- Streaming execution (WebSocket/SSE) is out of scope.
- Code execution from LLM responses is out of scope.
- Authentication on spawn endpoint is out of MVP scope.
- Multiple concurrent agent executions are out of scope.
- Retry strategy with exponential backoff is out of MVP scope.

---

## 2. Domain Model and Glossary

### 2.1 Domain Objects

| Term | Definition |
|------|-----------|
| **Agent Project** | A spawned agent with `id`, `name`, `task`, and sub-agents |
| **Sub-Agent** | A single skill step execution with its own state and result |
| **Skill Pipeline** | triage → planner → architect → adr → preflight → coder → qa → review → doc → release |
| **LLM Execution** | The act of calling OpenRouter with task + pipeline prompt |
| **OpenRouter** | External API provider for LLM calls |
| **State File** | `server/data/agents.json` — persisted agent + sub-agent state |

### 2.2 State Machine (Sub-Agent)

```
[pending] → [running] → [done]
                  ↘ [error]
```

State transitions are **immutable once written** — a sub-agent never reverts to a prior state.

---

## 3. Interfaces and Contracts

### 3.1 POST /api/agents — Spawn Agent

**Request:**
```json
{
  "name": "string (1–64 chars, required)",
  "task": "string (1–4000 chars, optional, default: '') [S1 MITIGATION]",
  "model": "string (optional, default: 'anthropic/claude-3.5-sonnet')",
  "x": "number (0–1, optional, auto-generated)",
  "y": "number (0–1, optional, auto-generated)"
}
```

**Preconditions:**
- `name` is a non-empty string ≤ 64 characters.
- `task` is a string ≤ 4000 characters. Control characters (ASCII < 0x20 except `\n\r\t`) are stripped.
- `model` is a string ≤ 64 characters. If omitted, defaults to `anthropic/claude-3.5-sonnet`.
- `OPENROUTER_API_KEY` is set and valid (starts with `sk-`).
- Rate limit: ≤ 5 spawns per minute per IP. [S1 MITIGATION]

**Postconditions (success):**
- Returns HTTP 201 with the created agent project (schema §3.2).
- A sub-agent with `status: "pending"` is written to `agents.json` for each skill step in the pipeline.
- The LLM is called with the first skill (triage).
- Sub-agent state transitions to `running`, then `done` or `error`.

**Postconditions (failure):**
- HTTP 400: invalid input (name too long, task too long, etc.)
- HTTP 429: rate limit exceeded
- HTTP 500: OpenRouter call failed after retry → sub-agent status = `error`

**Response (201 Created):**
```json
{
  "id": "p<timestamp>",
  "name": "Agent Name",
  "task": "The user's task description",
  "x": 0.3,
  "y": 0.7,
  "description": "",
  "metrics": { "uptime": "—", "latency": "—" },
  "subAgents": [
    {
      "id": "s<tstamp>_0",
      "task": "classify the request",
      "skill": "triage",
      "status": "running",
      "model": "anthropic/claude-3.5-sonnet",
      "created_at": "<ISO8601>",
      "completed_at": null,
      "result": null,
      "error": null,
      "logs": ["LLM call initiated", "...step logs..."]
    }
  ]
}
```

### 3.2 Agent Project Schema

Each entry in `agents.json.projects[]`:

```json
{
  "id": "string (unique, p<timestamp> format)",
  "name": "string (1–64 chars)",
  "task": "string (0–4000 chars, optional)",
  "x": "number (0.0–1.0)",
  "y": "number (0.0–1.0)",
  "description": "string (0–500 chars)",
  "metrics": {
    "uptime": "string (e.g. '—', '99%')",
    "latency": "string (e.g. '—', '240ms')"
  },
  "subAgents": [
    {
      "id": "string (s<tstamp>_<index> format, e.g. 's1776880000000_0')",
      "task": "string (human-readable task description)",
      "skill": "string (triage|planner|architect|adr|preflight|coder|qa|review|doc|release)",
      "status": "string (pending|running|done|error)",
      "model": "string (OpenRouter model identifier)",
      "created_at": "string (ISO 8601, UTC, e.g. '2026-04-22T12:00:00.000Z')",
      "completed_at": "string|null (ISO 8601 UTC or null)",
      "result": "string|null (LLM response text or null)",
      "error": "string|null (error message or null)",
      "logs": ["string[] (step log entries, max 50)"]
    }
  ]
}
```

### 3.3 Field Constraints

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | string | 1–64 chars |
| `task` | string | 0–4000 chars, control chars stripped |
| `x`, `y` | number | 0.0–1.0 |
| `description` | string | 0–500 chars |
| `subAgents[].id` | string | unique within project |
| `subAgents[].skill` | string | enum: triage/planner/architect/adr/preflight/coder/qa/review/doc/release |
| `subAgents[].status` | string | enum: pending/running/done/error |
| `subAgents[].logs` | array | max 50 entries, each ≤ 500 chars |
| `subAgents[].result` | string\|null | null if pending/running/error |
| `subAgents[].error` | string\|null | null if pending/running/done |

### 3.4 GET /api/agents — Read Agents

**No contract change.** Existing response returns the full project schema including `subAgents`.

**Preconditions:** None.
**Postconditions:** Returns array of agent projects (schema §3.2), or `[]`.

### 3.5 LLM Call Contract (OpenRouter)

**Endpoint:** `POST https://openrouter.ai/api/v1/chat/completions`

**Headers:**
```
Authorization: Bearer <OPENROUTER_API_KEY>
Content-Type: application/json
```

**Request body:**
```json
{
  "model": "anthropic/claude-3.5-sonnet",
  "messages": [
    { "role": "system", "content": "<skill pipeline prompt from prompt.js>" },
    { "role": "user", "content": "<task description from user>" }
  ]
}
```

**Timeout:** 60 seconds (hard). After timeout → error state.

**Retry:** 1 retry on network failure. After retry failure → error state.

**API key format check at startup:** Must start with `sk-`. If not → server exits with code 1.

---

## 4. Data Flow / Execution Model

### 4.1 Spawn Execution Flow

```
1. POST /api/agents {name, task, model}
   2. Validate input (name ≤ 64, task ≤ 4000 + strip control chars)
   3. Check rate limit (5/min/IP)
   4. readProjects()
   5. Create agent project
   6. For each skill in pipeline (triage → ... → release):
      a. Create sub-agent with status "pending" + logs ["Starting skill: <name>"]
      b. writeProjects() [persist immediately]
      c. Call llm/openrouter.js(task + skill prompt)
      d. Update sub-agent: status "running" + log "LLM call initiated"
      e. writeProjects() [persist immediately]
      f. On LLM response:
         - Update sub-agent: status "done", result = LLM text, completed_at
         - log "Completed in <Xms>"
      g. On LLM error:
         - Update sub-agent: status "error", error = message, completed_at
         - log "Error: <message>"
      h. writeProjects() [persist immediately]
   7. res.json(agentProject) [HTTP 201]
```

### 4.2 Skill Pipeline (System Prompt)

Built by `server/llm/prompt.js`. The system prompt encodes:

```
You are an agentic coding system. Execute tasks following this pipeline:
- triage: classify the request (L1/L2/L3, change type, gates)
- planner: produce a structured feature contract (STATE.<slug>.md)
- architect: structural review of the plan
- adr: durable architecture decision records
- preflight: validate before coding
- coder: implement exactly ONE task = ONE commit
- qa: validate the implementation
- review: scope/contract check
- doc: update documentation
- release: merge readiness

Always reason step-by-step. Return structured output.
```

Each skill step gets a tailored prompt suffix specifying what to do for the current task.

### 4.3 Polling (Frontend)

The frontend polls `GET /api/agents` every 5 seconds (existing behavior).
Sub-agent status indicators update automatically.
No new contracts needed.

---

## 5. Validation / Linting Rules

| Rule | Enforcement |
|------|-------------|
| `name` ≤ 64 chars | HTTP 400 if exceeded |
| `task` ≤ 4000 chars | HTTP 400 if exceeded |
| `task` control chars stripped | Server-side before LLM call |
| `subAgents[].status` valid enum | Assert on write |
| `subAgents[].id` unique within project | Assert on creation |
| `completed_at` set only if status done/error | Assert on transition |
| `logs` max 50 entries | Truncate oldest on overflow |
| `OPENROUTER_API_KEY` starts with `sk-` | Exit code 1 at startup |
| Rate limit: 5 spawns/min/IP | HTTP 429 on exceeded |

---

## 6. Failure Modes and Error Taxonomy

| Code | Condition | System Response | Log |
|------|-----------|-----------------|-----|
| E01 | Missing `OPENROUTER_API_KEY` | Server exits code 1 | `FATAL: OPENROUTER_API_KEY missing` |
| E02 | Invalid API key format | Server exits code 1 | `FATAL: OPENROUTER_API_KEY must start with sk-` |
| E03 | `name` too long (> 64 chars) | HTTP 400 | `WARN: name exceeds max length` |
| E04 | `task` too long (> 4000 chars) | HTTP 400 | `WARN: task exceeds max length` |
| E05 | Rate limit exceeded | HTTP 429 | `WARN: rate limit exceeded for <IP>` |
| E06 | OpenRouter network failure | HTTP 500, sub-agent status = `error` | `ERROR: OpenRouter call failed: <msg>` |
| E07 | OpenRouter timeout (60s) | Sub-agent status = `error`, error = "LLM call timed out" | `WARN: LLM call timed out after 60000ms` |
| E08 | Invalid JSON in agents.json | `readProjects()` throws, server returns 500 | `ERROR: failed to parse agents.json: <msg>` |
| E09 | Malformed request body | HTTP 400 | `WARN: malformed request body` |

**Error responses are never logged as full objects** (observability hygiene §12).

---

## 7. Observability

### 7.1 Structured Logs (server/)

All logs are JSON to stderr:

```json
{
  "level": "INFO|WARN|ERROR|FATAL",
  "ts": "<ISO8601>",
  "event": "<event name>",
  "agent_id": "<id>",
  "skill": "<skill name>",
  "duration_ms": "<number or null>",
  "error": "<message or null>"
}
```

**Required log events:**
- `agent.spawned` — agent created (INFO)
- `llm.call.started` — OpenRouter call initiated (INFO)
- `llm.call.completed` — OpenRouter call succeeded (INFO, duration_ms)
- `llm.call.failed` — OpenRouter call failed (ERROR, error)
- `llm.call.timeout` — timeout exceeded (WARN)
- `subagent.status_changed` — status transition (INFO)
- `rate.limit.exceeded` — rate limit hit (WARN)
- `validation.failed` — input validation failure (WARN)

**Redacted fields:**
- `OPENROUTER_API_KEY` — NEVER logged
- `result` content — NOT logged (LLM response can be large)
- `task` content — NOT logged (can contain sensitive context)

### 7.2 Metrics

| Metric | Type | Labels |
|--------|------|--------|
| `llm_calls_total` | Counter | `model`, `status` (success/error/timeout) |
| `llm_latency_seconds` | Histogram | `model` |
| `agents_spawned_total` | Counter | — |
| `rate_limit_hits_total` | Counter | — |

### 7.3 No Traces

Trace instrumentation is out of scope for MVP.

---

## 8. Security & Trust Boundaries

### 8.1 Trust Boundary

```
[Client/User] → [Express Server] → [OpenRouter API]
                         ↓
                    [agents.json]
```

- Client input is **untrusted**. Validated before LLM call.
- OpenRouter response is **untrusted**. Stored only, never executed.
- `agents.json` is **server-only** (not served as static file).

### 8.2 Security Constraints

From `$security` gate (enforceable):

| Constraint | Implementation |
|-----------|--------------|
| API key starts with `sk-` | Check in `server/index.js` at startup |
| `task` ≤ 4000 chars | Validation in `spawnProject()` |
| Rate limit 5/min/IP | In-memory counter in `server/index.js` |
| HTTPS only | OpenRouter URL is `https://` only |
| 60s timeout | `AbortSignal.timeout(60000)` |
| No key in responses | Never included in any API response |
| No PII in logs | `task` and `result` not logged |

### 8.3 Future Security Gate Triggers

If a future feature adds **code execution from LLM responses**, a new `$security` gate is **mandatory** before implementation.

---

## 9. Extensibility Rules

| Change | Allowed | Constraint |
|--------|---------|---------|
| Add new skill to pipeline | YES | Add to enum in §3.3 + prompt.js |
| Add new sub-agent field | YES | Additive only, never required |
| Change default model | YES | Update prompt.js default |
| Add streaming | YES | Requires ADR + new `$security` gate |
| Add code execution | NO | New `$security` gate + ADR required |
| Remove sub-agent field | NO | Breaking change |
| Change state machine transitions | NO | Requires ADR |

---

## 10. Definition of Done

The implementation is complete when ALL checks pass:

### Contract & Schema
- [ ] `POST /api/agents` accepts `{name, task?, model?}` and returns 201 with full agent schema
- [ ] `GET /api/agents` returns agents including `subAgents[]` with all fields from §3.2
- [ ] `name` validation: > 64 chars → HTTP 400
- [ ] `task` validation: > 4000 chars → HTTP 400; control chars stripped
- [ ] `model` defaults to `anthropic/claude-3.5-sonnet`
- [ ] `subAgents[].status` is one of: pending/running/done/error
- [ ] `completed_at` set only when status is done or error

### Persistence
- [ ] Sub-agent state written to `agents.json` immediately on status transition
- [ ] `readProjects()` handles missing `subAgents` field (defaults to `[]`)
- [ ] `agents.json` valid JSON after every operation

### LLM Integration
- [ ] OpenRouter called with skill pipeline system prompt + task as user message
- [ ] 60s hard timeout enforced
- [ ] 1 retry on network failure, then error state
- [ ] API key validated at startup (must start with `sk-`)
- [ ] API key never returned in any API response
- [ ] LLM response stored in `result` field

### Security Mitigations (from `$security` gate)
- [ ] Missing/invalid `OPENROUTER_API_KEY` → server exits code 1
- [ ] Rate limit: 6th spawn/min/IP → HTTP 429
- [ ] All logs passivable: no API key, no PII, no full response bodies

### Observability
- [ ] All log events from §7.1 are emitted
- [ ] Logs are structured JSON to stderr
- [ ] Metrics from §7.2 are collected

### Security Acknowledge
- [ ] No auth on spawn endpoint (MVP-known gap, documented)
- [ ] No code execution from LLM responses (MVP constraint)
- [ ] LLM responses stored, not executed (MVP constraint)

---

## References

- `server/data/agents.js` — persistence layer
- `server/data/agents.json` — state storage
- `server/index.js` — Express entry point
- `server/llm/openrouter.js` — LLM client (new)
- `server/llm/prompt.js` — system prompt builder (new)
- `docs/governance/adr/26-04-22_openrouter-llm-connector.md` — ADR-001
- `AGENTS.md` — skill pipeline definition