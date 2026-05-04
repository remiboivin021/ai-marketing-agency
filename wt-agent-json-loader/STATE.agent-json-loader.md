# STATE — agent-json-loader

Branch: feature/agent-json-loader  
Worktree: ../wt-agent-json-loader  
Planner: planner-agent  
Executor: coder-agent  

---

# Mission

Implémenter un système de création d'agents à partir de fichiers JSON stockés dans server/data/agents/. Le serveur charge ces fichiers au démarrage et crée les agents correspondants avec leurs tâches et outils.

---

# Feature Type

- [x] new feature  

---

# Change Level

- [x] L2 — bounded standard change  

---

# Acceptance Criteria

- [ ] Les fichiers JSON dans server/data/agents/ sont chargés au démarrage
- [ ] Chaque JSON définit un agent avec id, name, description, prompt
- [ ] Chaque agent possède des tâches avec id, description et outils
- [ ] Les outils sont définis au niveau de chaque tâche
- [ ] Le système fonctionne sans erreur au démarrage

---

# Scope Contract

## Allowed Areas

- server/data/agents/ (nouveaux fichiers JSON)
- server/index.js (logique de chargement)
- server/data/agents.js (lecture des JSON si modification)
- src/components/ (si adaptation UI nécessaire)

## Forbidden Areas

- server/data/agents.json (format existant à ne pas modifier)

---

# Public Contract Impact

- [x] no

---

# Required Gates

- [ ] governance
- [ ] architect
- [ ] architect-security
- [ ] security
- [x] adr (potentiel - schema JSON)
- [x] doc
- [x] qa
- [x] review
- [x] release

---

# Blast Radius Assessment

- [x] multi-module

Reason: Nouveau schéma JSON + logique de chargement

---

# Parallel Safety Check

Travaux existants:
- feature/agent-interaction (UI) - OK
- fix/proxy-backend-connection (vite) - OK
- feature/agentic-llm (server/llm) - OK

Risque de collision: faible

---

# Execution Plan

1. Définir le format/schema du fichier JSON agent
2. Créer un fichier JSON example dans server/data/agents/
3. Modifier server/index.js pour charger les fichiers JSON
4. Adapter server/data/agents.js si nécessaire
5. Tester le chargement au démarrage

---

# Definition of Done

✔ Acceptance criteria met  
✔ QA passed  
✔ Review approved  
✔ Docs updated  

---

# Drift Detection Protocol

Coder-agent MUST STOP immediately si:
- nouveau module server nécessaire
- changement de schema non prévu

Appeler planner-agent avant de continuer.