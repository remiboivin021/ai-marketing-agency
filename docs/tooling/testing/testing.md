# Testing Strategy

This document explains the tooling expectations around running and reporting automated tests.

## Baseline

- Test commands should be reproducible locally and in CI
- Failures should be easy to locate
- Reports should point to actionable causes
- Test tooling should stay replaceable where practical

## Test types

| Type | Purpose | When to write |
|------|---------|---------------|
| Unit tests | Verify isolated behavior | Core logic |
| Integration tests | Verify component interaction | API, DB, services |
| E2E tests | Verify user workflows | Critical paths |

## Test organization

- Location: `<directory>`
- Naming: `<convention>`
- Tags: `<for filtering>`

## Running tests

```bash
<command to run all tests>
<command to run specific type>
<command to run with coverage>
```

## Rule

Document the role of the tooling, not just the current command syntax.

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>