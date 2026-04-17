# Coding Rules

This file defines the minimum quality bar for AI-assisted code generation in this repository.

## Core rules

- Prefer simple and explicit code over clever abstractions.
- Match existing repository conventions before introducing a new pattern.
- Avoid hidden side effects and implicit global state.
- Preserve public contracts unless a migration is documented.
- Add comments only when they clarify non-obvious intent.

## Change discipline

- Keep changes scoped to the request.
- Do not edit unrelated files for cleanup.
- Call out uncertainty instead of guessing behavior.
- Prefer deterministic logic and testable units.

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: 2026-03-01
---
