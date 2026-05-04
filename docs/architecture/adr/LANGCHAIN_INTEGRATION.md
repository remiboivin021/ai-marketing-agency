# Architecture Review: LangChain.js Integration

## A) Goal & Assumptions

**Feature:** Intégrer LangChain.js pour exécuter les tâches d'agent définies en JSON

**Goal:** Permettre aux agents définis en JSON d'exécuter leurs tâches via LangChain avec Tools

**Assumptions:**
- Backend Node.js existant →可以利用 LangChain.js (compatible)
- Agents déjà définis en JSON dans `server/data/agents/`
- LLM provider: OpenRouter (existant dans feature/agentic-llm)

---

## B) Quality Attributes (ranked)

| # | QA | Acceptance Criteria |
|---|-----|-----|
| 1 | **Reliability** | Errors from LLM calls are handled gracefully, no crash |
| 2 | **Observability** | Each agent task execution logged with input/output |
| 3 | **Performance** | Agent execution timeout < 120s |
| 4 | **Maintainability** | Nouveau code isolé dans server/llm/ |
| 5 | **Extensibilité** | Ajouter nouveaux tools sans modifier le core |

---

## C) Invariants & ADR Triggers

### Invariants MUST NOT change:
| Invariant | Status | Notes |
|-----------|--------|-------|
| Frontend reads from backend API | ✅ Preserved | Même contrat |
| API RESTful | ✅ Preserved | Nouveau endpoint /api/agents/:id/execute |
| State persisted JSON | ✅ Preserved | Pas de changement storage |
| Server port 3001 | ✅ Preserved | |

**ADR Required:** NO -pas de changement de schema existant

---

## D) Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                  AgentNetworkGraph / AgentDetail              │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP
┌────────────────────────────▼────────────────────────────────┐
│                   Backend (Express)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   /api/*    │  │ /api/agents │  │ /api/gateway         │ │
│  │ (existing)  │  │ /execute    │  │ (existing)          │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────────────────┘ │
│         │                │                                    │
│         │       ┌────────▼────────┐                        │
│         │       │  AgentExecutor    │  ← NOUVEAU            │
│         │       │  (LangChain)      │                        │
│         │       └────────┬────────┘                        │
│         │                │                                    │
│         │       ┌────────▼────────┐                        │
│         │       │ ToolRegistry      │  ← NOUVEAU            │
│         │       │ (web_search, etc)│                        │
│         │       └────────┬────────┘                        │
│         │                │                                    │
│         └────────────────┤                                    │
│                          ▼                                    │
│                  ┌────────────────┐                           │
│                  │  LLM Provider  │                           │
│                  │  (OpenRouter)  │                           │
│                  └────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Module Map:
```
server/
├── index.js              # Express server - NO CHANGE
├── data/
│   ├── agents/          # JSON agent definitions (EXISTING)
│   └── agents.js         # (EXISTING)
└── llm/                 # ← NOUVEAU
    ├── index.js         # AgentExecutor - facade principale
    ├── tools.js         # ToolRegistry - tools definition
    ├── prompts.js       # Prompt templates
    └── openrouter.js   # (EXISTING - feature/agentic-llm)
```

---

## E) Contracts (API + Internal)

### API Boundary:
```
POST /api/agents/:id/execute
Body: { "taskId": "web_search", "input": "query" }
Response: { "result": "...", "logs": [...] }
```

### Agent JSON Schema (EXISTANT):
```json
{
  "id": "agent-id",
  "name": "Agent Name",
  "prompt": "System prompt",
  "tasks": [
    { "id": "task-id", "description": "desc", "tools": ["tool1"] }
  ]
}
```

### DbC Rules:
- **Precondition:** Agent exists in JSON, task exists in agent.tasks
- **Postcondition:** Returns { result: string, toolCalls: [] }
- **Invariant:** Agent state not mutated during execution

---

## F) Failure Modes & Defensive Handling

| Mode | Detection | Handling | Log/Metric |
|------|-----------|----------|------------|
| LLM timeout | timeout 120s | Return error + retry option | `agent.timeout` |
| Invalid JSON | parse error | Fail fast with clear message | `agent.json_error` |
| Unknown tool | tool not found | Return error, don't crash | `agent.unknown_tool` |
| LLM API error | API 4xx/5xx | Return error message | `agent.llm_error` |
| No tools available | empty tools array | Skip execution, warn | `agent.no_tools` |
| Invalid task ID | task not in agent | Return 404 | `agent.invalid_task` |
| Network error | fetch failed | Retry 3x then fail | `agent.network_error` |
| Memory limit | context overflow | Truncate, warn | `agent.context_limit` |

---

## G) Observability Spec

### Metrics:
- `agent_execution_total` (counter) - label: agent_id, task_id, status
- `agent_execution_duration_seconds` (histogram)

### Logs:
```json
{
  "ts": "ISO",
  "level": "info",
  "event": "agent_execute",
  "agentId": "...",
  "taskId": "...",
  "durationMs": 123,
  "status": "success|error"
}
```

---

## H) Test Plan

1. **Unit Tests:**
   - ToolRegistry: tool resolving
   - AgentExecutor: input validation
   
2. **Integration Tests:**
   - POST /api/agents/:id/execute (happy path)
   - Error handling (invalid agent, invalid task)

3. **Mocking:**
   - Mock LLM responses with nock/openctl

---

## I) Implementation Plan (Staged)

### Stage 1: Infrastructure
- Add `langchain` and `langchain/openai` packages
- Create `server/llm/` folder structure
- Implement ToolRegistry (simple tool definitions)

### Stage 2: Core
- Implement AgentExecutor with LangChain
- Connect to existing OpenRouter (feature/agentic-llm)

### Stage 3: API
- Add POST /api/agents/:id/execute endpoint
- Test end-to-end

### Stage 4: Observability
- Add logs and metrics
- Error handling

---

## J) Constraints & Allowed Scope

### ALLOWED:
- Add `server/llm/` with LangChain
- Modify `server/index.js` for new endpoint
- Add tools dans ToolRegistry

### FORBIDDEN:
- Modifier frontend existant (sauf si demandé)
- Changer schema JSON agent existant
- Ajouter des services externes (autres que LLM providers)

---

## 1) Decision Status
**APPROVED**

## 2) Structural Impact Summary
- Boundaries affected: server/llm (NEW)
- Blast radius: multi-module (server/ + API layer)
- Backwards compatibility risk: **LOW**

## 3) Approved Direction
- Use LangChain.js in server/llm/
- Reuse existing OpenRouter integration
- New endpoint: POST /api/agents/:id/execute

## 4) Allowed Scope
- TO CHANGE: server/llm/ (new), server/index.js (add endpoint)
- MUST NOT CHANGE: data/agents.json, frontend, existing API contracts

## 5) ADR Requirements
- ADR required: **NO** - pas d'invariant violé