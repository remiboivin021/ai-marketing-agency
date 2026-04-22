# TODO — backend-api

> Feature execution rail. One task at a time. One task = one commit.

---

## File Scope

Slug: `backend-api`
Worktree: `../wt-backend-api`
Branch: `feature/backend-api`
Started: 2026-04-22

---

## # Current Task

**Task 1**: Create `server/` directory structure with Express entry point

```
Status   : in_progress
Gate     : coder
Commit   : not yet
```

**Evidence**:
- [ ] `server/index.js` created with Express app
- [ ] `server/data/gateway.js` created with mock data
- [ ] `server/data/agents.js` created with mock data
- [ ] `server/index.js` starts without error
- [ ] `GET /api/gateway` returns JSON
- [ ] `GET /api/agents` returns JSON
- [ ] `GET /api/projects` returns JSON
- [ ] port 3001 accessible

---

## # Done

*(empty — no tasks completed yet)*

---

## # Backlog

### Task 2 — package.json scripts

```
Status   : pending
Gate     : coder
Prereq   : Task 1
```

- Add `"dev:server": "node server/index.js"`
- Add `"dev:all": "concurrently \"npm run dev:server\" \"npm run dev\""`
- Add `concurrently` to dependencies

### Task 3 — vite.config.js proxy

```
Status   : pending
Gate     : coder
Prereq   : Task 2
```

- Add proxy: `/api` → `http://localhost:3001`

### Task 4 — GatewaySignals.jsx fetch

```
Status   : pending
Gate     : coder
Prereq   : Task 3
```

- Replace static `signals` array with `useEffect` → `fetch('/api/gateway')`
- Keep identical rendering

### Task 5 — AgentNetworkGraph.jsx fetch

```
Status   : pending
Gate     : coder
Prereq   : Task 4
```

- Replace static `projects` array with `useEffect` → `fetch('/api/agents')`
- Keep identical rendering

### Task 6 — QA validation

```
Status   : pending
Gate     : qa
Prereq   : Task 5
```

- Run all acceptance criteria checks
- Verify no visual regression

---

## Execution Protocol

1. Move Task N from Backlog to Current Task
2. Execute the task
3. Add evidence checkboxes as you go
4. When all evidence checked → commit with message: `feat(backend): task N description`
5. Move to next task
6. Repeat

---

## Drift Protocol

STOP and call `$planner` if:
- Scope drift detected
- Additional files needed outside Allowed Areas
- Architecture tension appears
- Plan becomes invalid

---

## References

- STATE: `STATE.backend-api.md`
- Decisions: `DECISIONS.backend-api.md`