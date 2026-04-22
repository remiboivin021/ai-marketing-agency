# DECISIONS - agentic-llm

## D-001 — No abort-controller dependency (T-001)

Used `AbortController` + `setTimeout` for 60s timeout instead of `abort-controller` npm package.
Rationale: built-in Node 18+ APIs suffice, no new dependency needed per C-06 constraint.
Alternative considered: abort-controller npm → rejected (would add dependency not in package.json).

## D-002 — AbortController fallback (T-001)

Original code used `AbortSignal.timeout()` (Node 18+). Added manual `setTimeout + AbortController` wrapper
to ensure compatibility. No new dependencies, purely native Node APIs.

## D-003 — sync-only LLM execution (T-004)

spawnProject is fully async (await on each LLM call). No parallelization of skill steps.
Rationale: MVP simplicity, each skill depends on prior state, easier to debug and log.
Future: concurrent sub-agents → ADR required.

## D-004 — persistProject() reads before write (T-004)

Used readProjects() → findIndex → mutate → writeProjects instead of deep clone approach.
Rationale: avoids deep clone overhead, direct in-place update of the project array.
Alternative: deep clone whole store → rejected (unnecessary memory + complexity for MVP).

## D-005 — In-memory rate limiting (T-005)

Rate limit store is a Map in-memory, per-process. Resets on server restart.
Rationale: MVP scope. No Redis or external store needed.
Future: Redis-backed rate limit → ADR required.