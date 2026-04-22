# API Interface

This document describes the backend REST API exposed by the Express server for the cockpit dashboard frontend.

## Overview

- **Type**: `bidirectional` (frontend consumes backend)
- **Protocol**: `HTTP REST`
- **Base URL**: `http://localhost:3001`
- **Owner**: `backend-api feature`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/gateway` | Gateway health signals |
| `GET` | `/api/agents` | Agent projects with sub-agents |
| `GET` | `/api/projects` | Projects list |
| `GET` | `/health` | Server health check |

## GET /api/gateway

Returns gateway health and golden signals.

**Response:**
```json
[
  { "label": "string", "value": "string", "color": "string", "isStatus": "boolean" }
]
```

Example:
```json
[
  { "label": "Gateway", "value": "Connected", "color": "#10b981", "isStatus": true },
  { "label": "Traffic (sessions)", "value": "87", "color": "#10b981" }
]
```

## GET /api/agents

Returns agent projects with sub-agent telemetry data.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "x": "number",
    "y": "number",
    "description": "string",
    "metrics": { "uptime": "string", "latency": "string" },
    "subAgents": [{ "id": "string", "status": "string", "type": "string" }]
  }
]
```

## GET /api/projects

Returns projects list (same data as /api/agents in MVP).

**Response:** identical to `/api/agents`.

## Contract notes

- All endpoints return `Content-Type: application/json`
- No authentication in MVP
- No query parameters in MVP
- Data is served from `server/data/*.js` mock files
- Frontend accesses via Vite proxy at `/api/*` → `http://localhost:3001`

## Development

- Server starts on port 3001: `npm run dev:server`
- Both processes: `npm run dev:all` (concurrently)

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>