# CI Policy

This document defines the rules the CI system is expected to enforce.

## Typical gates

- Formatting or lint baseline
- Build integrity
- Required automated tests
- Documentation sync for contract changes

## Enforcement

| Gate | Action on failure |
|------|-------------------|
| Lint | Block merge |
| Build | Block merge |
| Tests | Block merge |
| Docs sync | Warn or block |

## Policy note

A CI gate should exist only if it protects a real risk and remains understandable to contributors.

## Exceptions

Document how to handle exceptional cases where a gate might need to be bypassed.

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: <DATE>