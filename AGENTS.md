# AGENTS.md

> Routing + repository-level configuration for agentic execution.
> This is not governance. This is configuration and workflow routing.

## Identity

| Field | Value |
|-------|-------|
| Project | cockpit-dashboard |
| Type | React/Node full-stack webapp |
| Frontend | React 19 + TailwindCSS v4 + Lucide |
| Backend | Node.js + Express |
| State | JSON file persistence |

## Architecture Triggers

- **Changes to `src/components/`** → standard feature flow
- **Changes to `server/`** → standard feature flow  
- **Changes to schema/data format** → requires ADR

## Security Triggers

- **Auth/login endpoints** → `$security` gate
- **Secrets/credentials** → `$security` gate
- **External API calls** → review required

## System Invariants

1. Frontend reads from backend API - pas de données hardcodées en production
2. API RESTful - pas de WebSocket pour MVP
3. State persisted - pas de in-memory only

## Forbidden Areas

- `.opencode/` - ne pas modifier
- `docs/` - sauf si explicitement demandé

## Runtime Contract

```
GET /api/gateway     → GatewaySignals data
GET /api/agents    → AgentNetworkGraph data (includes dependsOn, pipelineDot)
GET /api/projects  → Projects list
POST /api/agents   → Spawn agent (with optional dependsOn, task)
GET /api/queue      → Queue statistics (jobs waiting, active, completed, failed)
POST /api/agents/:id/stop → Stop agent (cancel jobs, mark as error)
GET /health         → Health check (includes redis: connected/disconnected)
```

## New Features (orchestration-execution)

- **Task Queue**: Bull + Redis for agent task queue with concurrency
- **Parallel Execution**: Agents without dependencies run in parallel (max 5 concurrent)
- **Dependency Management**: Agents can declare `dependsOn` for DAG-based execution
- **Cost Tracking**: OpenRouter token usage (in/out) and execution time tracked per sub-agent
- **Fallback Mode**: Synchronous execution if Redis unavailable
- **Visualization**: Dependency arrows displayed on Canvas in AgentNetworkGraph

## Public Contracts

- Frontend accessible sulement après connexion (future)
- API REST JSON