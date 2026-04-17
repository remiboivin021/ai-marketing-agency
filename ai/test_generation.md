# Test Generation

This file defines how AI should propose or generate tests for this repository.

## Rules

- Test observable behavior, not implementation trivia.
- Prefer deterministic inputs and stable assertions.
- Cover failure cases when they are part of the contract.
- Do not generate brittle snapshot-heavy tests by default.
- State missing testability constraints when the system is hard to exercise.

## Minimum expectation

Every generated test should answer what behavior it protects.

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: 2026-03-01
---
