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
GET /api/agents    → AgentNetworkGraph data
GET /api/projects  → Projects list
```

## Public Contracts

- Frontend accessible sulement après connexion (future)
- API REST JSON