# Event Interface

This document describes an event-based interface the system consumes or produces, with emphasis on contract stability.

## Overview

- **Type**: `<producer | consumer | both>`
- **Transport**: `<Kafka | RabbitMQ | SQS | WebSocket | HTTP webhook | etc.>`
- **Topic/Channel**: `<name>`
- **Owner**: `<team or role>`

## Event schema

```json
{
  "eventType": "<string>",
  "timestamp": "<ISO8601>",
  "payload": {
    "<field>": "<type> - <description>"
  },
  "metadata": {
    "correlationId": "<string>",
    "source": "<string>"
  }
}
```

## Versioning

- Current version: `<N>`
- Deprecation policy: `<policy>`
- Migration path: `<path>`

## Delivery guarantees

- At-least-once / Exactly-once / Best-effort
- Ordering: `<ordered | unordered>`
- Retry policy: `<policy>`

## Consumers

| Consumer | Purpose | Lag expectation |
|----------|---------|-------------------|
| `<name>` | `<purpose>` | `<lag>` |

## Schema evolution

Document how field additions, deprecations, and removals are handled.

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>