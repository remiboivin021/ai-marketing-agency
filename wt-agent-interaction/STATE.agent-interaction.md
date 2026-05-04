# STATE — agent-interaction

Branch: feature/agent-interaction  
Worktree: ../wt-agent-interaction  
Planner: planner-agent  
Executor: coder-agent  

---

# Mission

Permettre à l'utilisateur d'interagir avec un agent via un formulaire:
- Quand l'utilisateur clique sur un agent, afficher une vue détails avec un formulaire d'envoi d'instructions
- L'agent doit pouvoir répondre et afficher les informations dans la même vue

---

# Feature Type

- [x] new feature  

---

# Change Level

- [x] L2 — bounded standard change  

---

# Acceptance Criteria

- [ ] Au clic sur un agent, une vue détails s'ouvre avec formulaire
- [ ] Le formulaire permet d'envoyer des instructions à l'IA
- [ ] Les réponses de l'agent s'affichent dans la même vue
- [ ] Le flux envoi/reception fonctionne correctement

---

# Scope Contract

## Allowed Areas

- src/components/ (composants React)
- src/App.jsx (ou App.tsx)
- src/pages/ (si pages separées)
- server/index.js (nouvel endpoint API si besoin)

## Forbidden Areas

- server/data/ (données persistées)
- src de features non liées

---

# Public Contract Impact

- [x] no

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

- [x] multi-module

Reason: Composant UI nouveau + possible endpoint API

---

# Parallel Safety Check

Travaux existants:
- fix/proxy-backend-connection (vite.config.js) - OK
- feature/agentic-llm (server/) - OK (pas de collision sur notre scope)

Risque de collision: faible

---

# Execution Plan

1. Créer le composant AgentDetail pour afficher les détails et le formulaire
2. Créer le composant ChatAgent pour les messages
3. Ajouter la navigation vers le détail au clic sur un agent
4. Connecter à l'API backend si endpoint'existe
5. Tester le flux envoi/réception

---

# Definition of Done

✔ Acceptance criteria met  
✔ QA passed  
✔ Review approved  
✔ Docs updated  

---

# Drift Detection Protocol

Coder-agent MUST STOP immediately si:
- scope expands vers d'autres modules
- nouvelles API nécessaires

Appeler planner-agent avant de continuer.