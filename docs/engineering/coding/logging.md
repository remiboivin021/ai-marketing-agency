# Logging Conventions

> Topic: Logging | Audience: developers, ops

## Purpose
<!-- Define logging conventions for the project.
     Answers: what to log, when, at what level? -->

## Log Levels
| Level | When to Use |
|-------|-------------|
| DEBUG | Detailed diagnostic info for development |
| INFO | Normal operation events |
| WARNING | Unexpected but handled situations |
| ERROR | Failures that need attention |
| CRITICAL | Severe failures requiring immediate action |

## What to Log
| Event Type | Include | Exclude |
|------------|---------|---------|
| <event> | <what> | <what> |
| <event> | <what> | <what> |

## Log Format
| Field | Format |
|-------|--------|
| Timestamp | <format> |
| Level | <format> |
| Message | <format> |
| Context | <format> |

## Sensitive Data
- Never log: <list>
- Always mask: <list>

## Structured Logging
<!-- If using structured logging, define the schema -->

## Log Retention
| Environment | Retention | Notes |
|-------------|-----------|-------|
| Development | <duration> | |
| Staging | <duration> | |
| Production | <duration> | |

## Open Questions
- [ ] <question> → route to $architect

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: <SEM_VERSION (start at 0.1.0)>
Last modified: <DATE>