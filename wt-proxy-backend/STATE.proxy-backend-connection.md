# STATE — proxy-backend-connection

Branch: fix/proxy-backend-connection  
Worktree: ../wt-proxy-backend  
Planner: planner-agent  
Executor: coder-agent  

---

# Mission

Corriger le bug ECONNREFUSED en vérifiant que la documentation indique clairement comment démarrer le backend, ou améliorer la détection/gestion du cas où le backend n'est pas en cours d'exécution.

---

# Feature Type

- [x] bug fix  

---

# Change Level

- [x] L1 — local low-risk  

---

# Acceptance Criteria

- [ ] L'erreur ECONNREFUSED ne se produit plus OU une message clair est affiché à l'utilisateur
- [ ] Les utilisateurs savent comment démarrer le backend
- [ ] Si le backend n'est pas démarré, l'erreur est claire et actionnable

---

# Scope Contract

## Allowed Areas

- vite.config.js (configuration proxy)
- package.json (scripts)
- README.md (documentation)

## Forbidden Areas

- server/index.js (logique backend)
- code React

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
- [ ] qa
- [x] review
- [ ] release

---

# Blast Radius Assessment

- [x] localized (single module)

---

# Architectural Constraints

Ne pas modifier la logique backend.

---

# Parallel Safety Check

Travaux existants: feature/agentic-llm (server/index.js)
Risque de collision: faible (notre changement est documentation)

---

# Security Surface Check

Non - pas de surface de sécurité touchée.

---

# Execution Plan (Planner Output)

1. Évaluer les options de correction (documentation vs code)
2. Implémenter la solution
3. Valider que le comportement est correct

---

# Definition of Done

✔ Acceptance criteria met  
✔ Review approved  
✔ Docs updated  

---

# Drift Detection Protocol

Coder-agent MUST STOP immediately si:
- scope expands
- nouvelles options de correction émergent

Appeler planner-agent avant de continuer.

---

# State Integrity Rule

`STATE.proxy-backend-connection.md` est la source de vérité pour le périmètre de cette tâche.