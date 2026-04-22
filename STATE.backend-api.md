# STATE — backend-api

Branch: feature/backend-api  
Worktree: ../wt-backend-api  
Planner: planner-agent  
Executor: coder-agent  

---

# Mission

Créer un serveur backend Express minimaliste qui expose les données du dashboard via une API RESTful, en remplacement des données mockées dans les composants frontend. Le frontend doit lire ces données depuis le backend via fetch().

**En concret:**
- Créer un serveur Express dans `server/`
- Exposer 3 endpoints REST : `GET /api/gateway`, `GET /api/agents`, `GET /api/projects`
- Les endpoints retournent les mêmes données que les composants mockuent actuellement
- Modifier les composants frontend (`GatewaySignals`, `AgentNetworkGraph`) pour appeler ces endpoints
- Ajouter un script `dev:server` dans package.json

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

**Reason**: Nouvelle frontière front/back, nouveau processus runtime, nouveau contrat API public, modification du flux de données.

---

# Acceptance Criteria

Un feature est COMPLETE seulement quand TOUTES les cases sont cochées:

- [ ] `GET /api/gateway` retourne les données GatewaySignals (status, traffic, errors, pending agents, saturation)
- [ ] `GET /api/agents` retourne les données AgentNetworkGraph (projects avec sub-agents)
- [ ] `GET /api/projects` retourne la liste des projets agents
- [ ] Les composants frontend `GatewaySignals` et `AgentNetworkGraph` font un fetch() vers ces endpoints
- [ ] Les données sont identiques visuellement à l'état actuel (pas de regression UI)
- [ ] `npm run dev:server` démarre le serveur sur un port (3001)
- [ ] Les deux processus (Vite + Express) fonctionnent simultanément en dev
- [ ] Le build frontend `npm run build` produit un bundle qui fonctionne avec le backend

---

# Scope Contract

## Allowed Areas

- `server/` — NOUVEAU répertoire backend Express
- `package.json` — ajout des scripts dev:server
- `vite.config.js` — configuration proxy Vite vers backend
- `src/components/GatewaySignals.jsx` — modification pour fetch() vers /api/gateway
- `src/components/AgentNetworkGraph.jsx` — modification pour fetch() vers /api/agents + /api/projects
- `src/App.jsx` — pas de modification (reste inchangé)
- `src/components/AgentCockpit.jsx` — pas de modification
- `src/components/NavBar.tsx` — pas de modification

## Forbidden Areas

- `.opencode/` — NE PAS modifier
- `docs/` — NE PAS modifier
- `src/App.jsx` — NE PAS modifier
- `src/components/AgentCockpit.jsx` — NE PAS modifier
- `src/components/NavBar.tsx` — NE PAS modifier
- Authentification / login
- Base de données (SQLite, PostgreSQL, etc.)
- WebSocket / SSE
- APIs externes
- Endpoints d'écriture (POST, PUT, DELETE)

Tout ce qui n'est pas explicitement autorisé est interdit.

---

# Public Contract Impact

- [x] oui — API REST
- [ ] no

Surfaces affected:
- 3 endpoints REST: `GET /api/gateway`, `GET /api/agents`, `GET /api/projects`
- Format de réponse: JSON
- Ces endpoints sont le contrat public entre frontend et backend

Migration needed: non (données mockées → données serveur, pas de migration de données)
ADR required: non (scope limité au MVP, pas de changement de format existant)

---

# Required Gates

- [ ] governance
- [ ] architect
- [ ] architect-security
- [ ] security
- [ ] adr
- [x] doc
- [x] qa
- [x] review
- [x] release

---

# Blast Radius Assessment

- [ ] localized (single module)  
- [x] multi-module (server + 2 composants frontend)  
- [ ] cross-system  
- [ ] unknown  

**Reason**: 1 nouveau module (server/) + modifications dans 2 composants frontend existants. Blast radius borné.

---

# Architectural Constraints

- Pas de nouveaux frameworks — Express uniquement
- Pas de changement de module boundaries
- Pas de redesign de composants
- Pas d'introduction de state management (useState local suffit)
- Pas d'abstractions supplémentaires — données plates dans les endpoints

---

# Parallel Safety Check

- active worktrees: OUI — feature/backend-api
- shared interfaces: AUCUNE
- schemas: AUCUN
- config: package.json, vite.config.js

Collision risk: **none** — le backend est un nouveau module, les composants modifiés ne sont pas partagés.

Parallel safety: ✅

---

# Security Surface Check

- auth / permissions: NON
- secrets: NON
- connectors: NON
- network: OUI (serveur HTTP) — mais pas d'exposition externe, dev local uniquement
- dependencies: OUI (express) — mais déjà reviewed dans le projet
- untrusted input: NON
- trust boundaries: NON
- plugin / command execution: NON

**security gate: not required** — scope MVP local dev, pas de surface d'attaque

---

# Execution Plan (Planner Output)

1. Créer `server/` avec structure Express (server.js + routes + données)
2. Créer `server/index.js` — entry point Express
3. Créer `server/routes/gateway.js` — endpoint GET /api/gateway
4. Créer `server/routes/agents.js` — endpoints GET /api/agents + GET /api/projects
5. Modifier `package.json` — ajouter `"dev:server": "node server/index.js"` + `"dev:all"` pour les deux processes
6. Modifier `vite.config.js` — ajouter proxy vers localhost:3001
7. Modifier `src/components/GatewaySignals.jsx` — useEffect + fetch /api/gateway
8. Modifier `src/components/AgentNetworkGraph.jsx` — useEffect + fetch /api/agents + /api/projects
9. Vérifier l'équivalence visuelle des données
10. Commit par tâche (1 tâche = 1 commit)

Coder-agent DOIT convertir ceci en `TODO.backend-api.md` AVANT d'écrire du code.

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

✔ Acceptance criteria fulfilled
✔ QA passed
✔ Doc updated (API endpoints)
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

`DECISIONS.backend-api.md`

Si une décision impacte l'architecture, les trust boundaries, les contrats, ou les invariants → escalade vers ADR.

---

# State Integrity Rule

`STATE.backend-api.md` est la seule source de vérité pour le scope du feature.

Si `STATE.backend-api.md` devient inaccurate:

planner-agent DOIT le mettre à jour immédiatement.

Ne jamais continuer avec un état périmé.