# STATE — langchain-integration

Branch: feature/langchain-integration  
Worktree: ../wt-langchain  
Planner: planner-agent  
Executor: coder-agent  

---

# Mission

Intégrer LangChain.js pour exécuter les tâches d'agent définis dans les fichiers JSON. Les agents doivent pouvoir exécuter leurs tâches avec les tools associés via LangChain.

---

# Feature Type

- [x] new feature  

---

# Change Level

- [x] L3 — structural or sensitive  

---

# Acceptance Criteria

- [ ] LangChain installé et fonctionnel
- [ ] server/llm/AgentExecutor créé
- [ ] ToolRegistry implémenté avec tools de base
- [ ] POST /api/agents/:id/execute fonctionne
- [ ] Les tasks avec tools sont exécutées via LangChain
- [ ] Logs et gestion d'erreurs en place

---

# Scope Contract

## Allowed Areas

- server/llm/ (nouveau)
- server/index.js (nouvel endpoint)
- package.json (dépendances)

## Forbidden Areas

- Frontend - sauf si demandé explicitement
- data/agents.json existant - ne pas modifier

---

# Public Contract Impact

- [x] no - nouveau endpoint seulement

---

# Required Gates

- [ ] governance
- [x] architect - DONE (ADR not required)
- [ ] architect-security
- [x] security
- [ ] adr
- [x] doc
- [x] qa
- [x] review
- [x] release

---

# Blast Radius Assessment

- [x] multi-module

---

# Execution Plan

1. Installation LangChain + dépendances
2. Créer server/llm/tools.js (ToolRegistry)
3. Créer server/llm/index.js (AgentExecutor)
4. Ajouter endpoint POST /api/agents/:id/execute
5. Tester exécution end-to-end

---

# Definition of Done

✔ Acceptance criteria met  
✔ QA passed  
✔ Review approved  

---

# Drift Detection Protocol

Coder MUST STOP si:
- nouveau module demandé hors scope
- changement de schema JSON agent

Appeler planner-agent avant de continuer.