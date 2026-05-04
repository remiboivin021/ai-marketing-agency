# ADR-002 — Agent Orchestration Model

## Status

Proposed

---

## Context

Le système actuel d'orchestration des agents utilise un modèle d'exécution strictement séquentiel :

```
triage → planner → architect → adr → preflight → coder → qa → review → doc → release
```

Chaque skill est exécuté de manière synchrone via `await` dans `server/data/agents.js`. Pour gérer une flotte d'agents IA opérationnelle, ce modèle présente des limitations :

1. **Pas de parallélisation** : Deux agents indépendants attendent en file sans raison
2. **Pas de gestion de dépendances** : Un agent "research" et un agent "writer" ne peuvent pas être liés
3. **Pas de priorisation** : Tous les agents ont la même priorité d'exécution
4. **Pas de scaling** : Un seul serveur Node.js traite séquentiellement

Le besoin est de passer à un modèle où :
- Les agents peuvent s'exécuter en parallèle s'ils n'ont pas de dépendances mutuelles
- Les dépendances entre agents peuvent être exprimées (agent B attend agent A)
- La topologie du pipeline peut être décrite (graphe dirigé acyclique - DAG)
- Le système respecte toujours les invariants de persistance et de déterminisme

Contraintes :
- Invariant I-06 (Constitution) : "Pipelines are defined in DOT graphs"
- Invariant I-10 (Constitution) : "Operations are deterministic given the same inputs"
- Le frontend visualize déjà un graphe (`AgentNetworkGraph.jsx` avec Canvas API)
- OpenRouter comme LLM provider (attention aux rate limits)

---

## Decision

Nous passons d'un modèle d'exécution séquentiel à un **modèle d'orchestration basé sur un DAG (Directed Acyclic Graph)** avec support de parallélisation.

### Nouveau modèle d'exécution :

1. **Définition de graphe** : Chaque agent peut déclarer ses dépendances via un champ `dependsOn: ["agent-id-1", "agent-id-2"]`
2. **Exécution parallèle** : Les agents sans dépendances en cours peuvent s'exécuter simultanément (via Bull queue concurrency)
3. **Graphe DOT** : La topologie est décrite dans un format DOT (respect I-06), stockée dans l'agent parent
4. **Déterminisme** : L'ordre de lancement est déterministe (tri topologique du graphe), même si l'ordre de complétion peut varier

### Ce qui est maintenant autorisé :
- Parallélisation des agents via Bull queue (`concurrency` setting)
- Déclaration de dépendances entre agents (champ `dependsOn` dans le JSON agent)
- Exécution asynchrone avec gestion d'état via événements Bull
- Topologie de pipeline décrite en DOT (stockée dans `pipelineDot` de l'agent)

### Ce qui est maintenant interdit :
- Exécution séquentielle forcée pour les agents sans dépendances (anti-pattern)
- Modification manuelle du statut des agents sans passer par la queue
- Création de cycles dans le graphe de dépendances (sera rejeté par validation)

### Frontières affectées :
- `server/data/agents.js` - logique d'exécution et validation de dépendances
- `server/queue/` - workers Bull avec gestion de concurrency et dépendances
- `server/data/agents.json` - nouveau champ `dependsOn`, `pipelineDot`, `queueJobId`
- `src/components/AgentNetworkGraph.jsx` - affichage des dépendances sur le graphe
- API endpoints - potentiellement `POST /api/agents` avec `dependsOn` dans le body

---

## Alternatives Considered

### Option A — Séquentiel avec `Promise.all()` (naïf)
- Benefits : Simple à implémenter, pas de queue complexe
- Risks : Pas de persistance, pas de gestion de dépendances fines, pas de priorité
- Why not chosen : Ne résout pas le besoin de dépendances et persistance

### Option B — Utiliser un moteur de workflow (Temporal, Cadence)
- Benefits : Moteur robuste, gestion d'état avancée, retries, sagas
- Risks : Infrastructure lourde, complexité massive, overkill pour MVP
- Why not chosen : Trop complexe pour le besoin actuel, stack monolithique Node.js

### Option C — LangChain Expression Language (LCEL) avec graph
- Benefits : Natif LLM, support DAG, parallélisation, bien intégré LLM
- Risks : Dépendance à LangChain (déjà rejeté dans DECISIONS.agentic-llm.md D-005)
- Why not chosen : Contre la décision existante de ne pas utiliser LangChain

### Option D — DAG personnalisé avec Bull queue (CHOISI)
- Benefits : Respecte l'ADR-001 (Bull/Redis), léger, contrôle total, persistance Redis
- Risks : À développer from scratch, validation des cycles à implémenter
- Why chosen : Cohérent avec ADR-001, stack Node.js simple, pas de nouvelle dépendance majeure

---

## Affected Invariants

- `I-06` (Constitution) : "Pipelines are defined in DOT graphs; no alternative execution paths"
  - **Status** : Préservé et renforcé
  - **Justification** : Les pipelines sont maintenant explicitement définis en DOT (`pipelineDot`), et l'exécution suit ce graphe (pas d'alternative path).

- `I-10` (Constitution) : "Operations are deterministic given the same inputs"
  - **Status** : Préservé avec nuance
  - **Justification** : Le tri topologique est déterministe (même graphe = même ordre de lancement). L'ordre de complétion peut varier (parallélisation), mais les résultats LLM restent déterministes.

- `I-03` (AGENTS.md) : "State persisted - pas de in-memory only"
  - **Status** : Préservé
  - **Justification** : Bull/Redis persiste les jobs, `agents.json` reste la source de vérité pour l'état final.

---

## Contract / Surface Impact

### API REST
- **Impact** : Modification de `POST /api/agents` pour accepter `dependsOn`
  ```json
  {
    "name": "writer-agent",
    "task": "Write blog post",
    "dependsOn": ["research-agent-id"]
  }
  ```
- **Nouveau champ** : `GET /api/agents` retourne maintenant `dependsOn` et `pipelineDot`
- **Compatibilité** : Rétro-compatible (champs optionnels, agents existants non affectés)

### Schema / File Format
- **Impact** : Nouveaux champs dans `agents.json` et `server/data/agents/*.json`
  - `dependsOn: string[]` - IDs des agents dont ce agent dépend
  - `pipelineDot: string` - Représentation DOT du pipeline
  - `queueJobId: string` - ID du job Bull (depuis ADR-001)
- **Compatibilité** : Additif, pas de migration breaking (champs par défaut à `[]` et `""`)

### Runtime Behavior
- **Impact** : Exécution asynchrone avec parallélisation
- **Qui est impacté** : Tous les nouveaux agents créés avec `task`
- **Déterminisme** : L'ordre de lancement est déterministe (tri topologique), pas l'ordre de fin

### Pipeline Semantics
- **Impact** : Passage de "séquentiel strict" à "DAG avec parallélisation"
- **Graphe DOT** : Exemple de sortie :
  ```dot
  digraph Pipeline {
    triage -> planner;
    planner -> architect;
    architect -> adr;
    adr -> preflight;
    preflight -> coder;
    coder -> qa;
    qa -> review;
    review -> doc;
    doc -> release;
  }
  ```

---

## Migration Path

### Séquence :
1. Ajouter les nouveaux champs dans `server/data/agents.js` (avec valeurs par défaut)
2. Créer la logique de validation de graphe (détection de cycles)
3. Implémenter le tri topologique pour l'ordre de lancement
4. Configurer Bull avec `concurrency` pour parallélisation
5. Mettre à jour `AgentNetworkGraph.jsx` pour afficher les flèches de dépendances

### Compatibilité window :
- Les agents créés avant cette ADR fonctionnent toujours (exécution séquentielle par défaut)
- Nouveau code ignore silencieusement les champs manquants chez les anciens agents

### Fallback behavior :
- Si `dependsOn` invalide (cycle détecté) → rejet de la création d'agent avec erreur 400
- Si Redis/Queue down → fallback synchrone avec warning (comme ADR-001)

---

## Rollback Plan

### Possibilité de rollback : YES

### Ce qui doit être reverté :
1. Supprimer la logique de tri topologique dans `server/data/agents.js`
2. Supprimer la gestion `dependsOn` et `pipelineDot`
3. Revenir à l'exécution séquentielle avec `await` simple
4. Revert des changements dans `AgentNetworkGraph.jsx` (si trop complexe)

### Données pouvant rester :
- Champs `dependsOn`, `pipelineDot`, `queueJobId` dans `agents.json` (ignorés)
- Jobs Bull en attente (seront nettoyés par `FLOW_EXPIRED`)

### Trigger de rollback :
- Complexité de debugging trop élevée
- Détection de cycles non fiable en production
- Performance dégradée à cause de la queue (latence ajoutée)

### Monitoring post-rollback :
- Vérifier que tous les agents repassent en mode synchrone
- S'assurer qu'aucun job Bull n'est en attente (ou les nettoyer)

---

## Consequences

### Positive
- **Parallélisation** : Réduction du temps d'exécution total pour agents indépendants
- **Dépendances explicites** : Graphe de tâches clair et documenté (DOT)
- **Scalabilité** : Peut ajouter plusieurs workers Node.js pour traiter plus d'agents
- **Visualisation** : Frontend peut afficher les flèches de dépendances sur le graphe
- **Respect I-06** : Pipeline défini en DOT, pas d'exécution alternative

### Negative
- **Complexité** : Tri topologique, détection de cycles, gestion asynchrone
- **Debugging** : Plus difficile de tracer l'exécution à travers plusieurs jobs Bull
- **Non-déterminisme temporel** : L'ordre de complétion peut varier (bien que lancement soit déterministe)
- **Nouveaux champs** : `dependsOn`, `pipelineDot`, `queueJobId` à maintenir dans le schema

### Follow-up Debt
- Implémenter UI pour définir visuellement les dépendances (drag & drop sur le graphe)
- Monitoring : métriques sur le temps d'exécution par agent et parallélisation réelle
- Documentation : guide utilisateur sur comment définir des pipelines avec dépendances
- Validation avancée : détecter dépendances circulaires trans-agents (pas juste intra-agent)

---

## Required Follow-Up

- [ ] Mettre à jour `AGENTS.md` avec nouvelles contraintes d'orchestration
- [ ] Créer `STATE.orchestration-execution.md` avec scope incluant DAG et dépendances
- [ ] Documenter format DOT dans `docs/architecture/pipeline-dot-format.md`
- [ ] Ajouter validation de cycles dans `server/data/agents.js`
- [ ] Mettre à jour `src/components/AgentNetworkGraph.jsx` pour afficher dépendances
- [ ] Tests unitaires pour le tri topologique et détection de cycles
- [ ] Ajouter exemples de pipelines avec dépendances dans `server/data/agents/`

---

## References

- `server/data/agents.js` - logique d'exécution actuelle à modifier
- `server/llm/openrouter.js` - appelé par les workers
- `src/components/AgentNetworkGraph.jsx` - visualisation graphe (Canvas API)
- `docs/governance/constitution.md` - I-06, I-10
- `AGENTS.md` - I-03
- ADR-001 — Task Queue System with Redis/Bull (dépendance directe)
- Documentation DOT : https://graphviz.org/doc/info/lang.html
- Bull queue concurrency : https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#concurrency

---

## Decision Quality Checklist

- [x] Problem is clearly stated
- [x] Decision is explicit
- [x] Alternatives were actually considered
- [x] Invariant impact is documented
- [x] Contract/surface impact is documented
- [x] Migration path is present
- [x] Rollback plan is present
- [x] Consequences are honest
- [x] Required follow-up is listed
- [x] References are included
