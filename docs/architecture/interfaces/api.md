# API Interface

This document describes an API interface the system consumes or exposes, with emphasis on stability and ownership.

## Overview

- **Type**: `<input | output | bidirectional>`
- **Protocol**: `<HTTP | gRPC | WebSocket | etc.>`
- **Base URL**: `<url or path>`
- **Owner**: `<team or role>`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `<GET/POST/etc.>` | `<path>` | `<description>` |

## Request format

```json
{
  "<field>": "<type> - <description>"
}
```

## Response format

```json
{
  "<field>": "<type> - <description>"
}
```

## Contract notes

Document versioning expectations, validation rules, and migration paths for any stable interface.

## Error handling

| Code | Meaning | Recovery |
|------|---------|----------|
| `<4xx>` | `<client error>` | `<action>` |
| `<5xx>` | `<server error>` | `<action>` |

## Rate limiting

- Limit: `<N> requests per <time period>`
- Headers: `<X-RateLimit-*>` or similar

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>