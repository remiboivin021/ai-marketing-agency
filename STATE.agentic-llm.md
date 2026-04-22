# STATE — agentic-llm

Branch: feature/agentic-llm
Worktree: ../wt-agentic-llm
Planner: planner-agent
Executor: coder-agent

---

# Mission

Implementer la logique de spawn d'agent intelligent via OpenRouter LLM :
- Quand un agent est spawné avec une `task`, le backend appelle OpenRouter avec le skill pipeline
- Les sub-agentstrack l'exécution de chaque étape (triage → planner → architect → adr → preflight → coder → qa → review → doc → release)
- État persisté dans `agents.json` via `server/data/agents.js`
- Sécurité : API key validation, rate limiting, input validation, timeout

**En concret:**
- Créer `server/llm/openrouter.js` — client LLM (API key + fetch + timeout 60s)
- Créer `server/llm/prompt.js` — builder pour le system prompt (skill pipeline)
- Étendre `server/data/agents.js` — `spawnProject()` appelle le LLM et track les sub-agents
- Étendre `server/index.js` — input validation, rate limiting, API key check at startup
- Ajouter `OPENROUTER_API_KEY` dans `.env.example`
- Créer `.env` (gitignored) avec placeholder

Tout ce qui n'est pas listé ici est HORS SCOPE.

---

# Feature Type

- [x] new feature
- [ ] bug fix
- [ ] refactor (approved)
- [ ] performance improvement
- [ ] infrastructure
- [ ] security

---

# Change Level

- [ ] L1 — local low-risk
- [ ] L2 — bounded standard change
- [x] L3 — structural or sensitive

**Reason**: Nouvelle frontière server ↔ OpenRouter, nouveau module LLM, expansion du schema de persistence, introduction de credentials, changement de l'invariant I-03 (trust boundary).

---

# Acceptance Criteria

Un feature est COMPLETE seulement quand TOUTES les cases sont cochées:

- [ ] `OPENROUTER_API_KEY` validée au démarrage (doit commencer par `sk-`)
- [ ] `POST /api/agents {name, task?, model?}` retourne 201 avec le agent schema complet
- [ ] `task` > 4000 chars → HTTP 400
- [ ] `name` > 64 chars → HTTP 400
- [ ] 6e spawn/min/IP → HTTP 429 (rate limit)
- [ ] OpenRouter appelé avec skill pipeline system prompt + task user message
- [ ] Timeout 60s hard, puis sub-agent status = error
- [ ] API key jamais retournée dans une réponse API
- [ ] `subAgents[]` written to agents.json on each status transition
- [ ] `GET /api/agents` retourne les agents avec subAgents[] complets
- [ ] Logs structurés JSON (no key, no PII)
- [ ] Build `npm run build` passe

---

# Scope Contract

## Allowed Areas

- `server/llm/openrouter.js` — NOUVEAU : client LLM OpenRouter
- `server/llm/prompt.js` — NOUVEAU : skill pipeline system prompt builder
- `server/data/agents.js` — extension de spawnProject() + LLM call
- `server/data/agents.json` — schema expansion (sub-agent state model)
- `server/index.js` — input validation, rate limiting, API key startup check
- `.env` — NOUVEAU : OPENROUTER_API_KEY (gitignored)
- `.env.example` — ajout du template OPENROUTER_API_KEY
- `docs/architecture/contracts/26-04-22_llm-execution-state-model.md` — NLSpec (déjà créé)
- `docs/governance/adr/26-04-22_openrouter-llm-connector.md` — ADR-001 (déjà créé)

## Forbidden Areas

- `.opencode/` — NE PAS modifier
- `docs/` — pas de modification par coder (docs déjà cré��s)
- `src/` — pas de modification frontend
- `vite.config.js` — pas de modification
- Authentification sur le spawn endpoint
- WebSocket / SSE / streaming
- Exécution de code depuis les réponses LLM
- Retry strategy avec exponential backoff
- Multiple concurrent agent executions
- Code outside `server/` pour le MVP

Tout ce qui n'est pas explicitement autorisé est interdit.

---

# Public Contract Impact

- [x] oui — API REST + schema agents.json
- [ ] no

Surfaces affected:
- `POST /api/agents` — signature expandue (task, model optionals)
- `GET /api/agents` — retourne subAgents[] avec state model
- `server/data/agents.json` — schema expandu (subAgents[], task, model)

Migration needed: **non** — schema additive, backward-compatible.
ADR required: **oui** — ADR-001 déjà créé.

---

# Required Gates

- [x] governance — DONE (via triage findings)
- [x] architect — DONE (APPROVED)
- [x] architect-security — no (structural only, no security coupling)
- [x] security — DONE (findings documented, mitigations enforceable)
- [x] adr — DONE (ADR-001 created)
- [x] doc — DONE (NLSpec created)
- [x] qa — pending
- [x] review — pending
- [x] release — pending

---

# Blast Radius Assessment

- [ ] localized (single module)
- [x] multi-module (server/llm/ + server/data/ + server/index.js)
- [ ] cross-system
- [ ] unknown

**Reason**: 3 nouveaux modules sous `server/`, schema expansion, sécurité. Blast radius borné.

---

# Architectural Constraints

- API key validée au startup only — jamais re-lue en session
- Pas d'exécution de code depuis LLM responses (MVP)
- Toutes les écritures passent par `server/data/agents.js`
- LLM client isolé dans `server/llm/openrouter.js`
- Pas de nouvelle dépendance — built-in fetch uniquement
- Rate limit in-memory, stateless (reset on server restart)

---

# Parallel Safety Check

- active worktrees: AUCUN (feature/worktree pas encore créé)
- shared interfaces: AUCUNE
- schemas: server/data/agents.json — seul写入 point
- config: .env, .env.example

Collision risk: **none** — worktree pas encore créé, pas de shared surfaces actives.
Parallel safety: ✅

---

# Security Surface Check

- auth / permissions: NON (MVP-known gap, documented in ADR-001)
- secrets: OUI (`OPENROUTER_API_KEY`)
- connectors: OUI (OpenRouter)
- network: OUI (outbound HTTPS)
- dependencies: OUI (built-in fetch only)
- untrusted input: OUI (task field from user)
- trust boundaries: OUI (server → OpenRouter)
- plugin / command execution: NON

**security gate: PASS avec mitigations enforceables** — $security findings S1-S3 documentées, coder DOIT les implémenter.

---

# Execution Plan (Planner Output)

1. Créer `server/llm/` directory
2. Créer `server/llm/openrouter.js` — LLM client (API key, fetch, 60s timeout, 1 retry)
3. Créer `server/llm/prompt.js` — skill pipeline system prompt builder
4. Créer `.env` (gitignored) avec `OPENROUTER_API_KEY=` placeholder
5. Ajouter `.env.example` avec `OPENROUTER_API_KEY=your_key_here`
6. Étendre `server/data/agents.js` — `spawnProject()` avec LLM call + sub-agent tracking
7. Étendre `server/index.js` — API key check at startup, input validation, rate limiting middleware
8. Vérifier que `npm run build` passe
9. Vérifier que `npm run dev:server` démarre sans erreur
10. Commit par tâche (1 tâche = 1 commit)

Coder-agent DOIT convertir ceci en `TODO.agentic-llm.md` AVANT d'écrire du code.

---

# Refactor Shield

Refactoring INTERDIT sauf si explicitement approuvé.

Pas de:
- renommage de modules
- réorganisation de répertoires
- nettoyage de code hors scope
- introduction d'abstractions non requises par le scope

Si pression de refactor → STOP → appeler planner-agent.

---

# Definition of Done

✔ API key validée au startup
✔ Input validation enforceable
✔ Rate limiting enforceable
✔ LLM call avec timeout + retry
✔ Sub-agent state written immediately
✔ Logs structurés JSON (no key, no PII)
✔ Build passe
✔ DEV server startup OK
✔ QA approved
✔ Review approved
✔ Release readiness confirmed

---

# Drift Detection Protocol

Coder-agent DOIT S'ARRETER immédiatement si:

- scope expand
- architecture tension appears
- plan becomes invalid
- unexpected complexity emerges
- additional files needed outside Allowed Areas
- public contract impact changes
- required gates change during execution
- security mitigations ne peuvent pas être implémentées comme specifié

Call planner-agent avant de continuer.

Ne jamais improviser de changements structurels.

---

# Local Optimization Rule

Optimiser UNIQUEMENT ce que ce feature touche.

NE PAS optimiser tout le dépôt.

Optimization globale INTERDITE pendant le feature work.

---

# Decision Bridge

Tous les choix d'implémentation significatifs DOIVENT être logués dans:

`DECISIONS.agentic-llm.md`

Si une décision impacte l'architecture, les trust boundaries, les contrats, ou les invariants → escalade vers ADR.

---

# State Integrity Rule

`STATE.agentic-llm.md` est la seule source de vérité pour le scope du feature.

Si `STATE.agentic-llm.md` devient inaccurate:

planner-agent DOIT le mettre à jour immédiatement.

Ne jamais continuer avec un état périmé.

(End of file - total 256 lines)