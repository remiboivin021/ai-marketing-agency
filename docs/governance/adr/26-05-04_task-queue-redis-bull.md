# ADR-001 — Task Queue System with Redis/Bull

## Status

Proposed

---

## Context

Le système actuel d'exécution des agents utilise un modèle séquentiel synchrone : chaque sous-agent (skill) est exécuté l'un après l'autre via `await`. Pour gérer une flotte d'agents IA opérationnelle, nous avons besoin :

- D'exécuter plusieurs agents en parallèle
- De gérer une file d'attente de tâches (pour éviter surcharge LLM/OpenRouter)
- De supporter les dépendances entre agents (Agent A doit finir avant Agent B)
- De persister l'état des tâches en cas de redémarrage serveur

Le système actuel lit/écrit dans `server/data/agents.json` de manière synchrone, sans file d'attente, sans parallélisation.

Contraintes :
- Invariant I-03 (AGENTS.md) : "State persisted - pas de in-memory only"
- Le serveur est un Node.js Express (monolithique pour MVP)
- OpenRouter est le seul LLM provider
- Les coûts API doivent être gérables (rate limiting au niveau queue)

---

## Decision

Nous introduisons **Bull** (library Node.js) avec **Redis** comme système de file d'attente de tâches pour l'orchestration des agents.

### Ce qui est maintenant autorisé :
- Utilisation de Redis pour la file d'attente Bull (jobs, états, délais)
- Parallélisation des agents indépendants (sans dépendances mutuelles)
- Workers Bull pour traiter les tâches LLM asynchrones
- Persistance via Redis (avec configuration persistence AOF/RDB)

### Ce qui est maintenant interdit :
- Exécution synchrone séquentielle pour les nouveaux agents créés via la queue
- Modification directe de `agents.json` sans passer par la queue (pour les tâches LLM)
- In-memory only (sans Redis) en production

### Frontières affectées :
- `server/queue/` - nouveau module de gestion de queue
- `server/llm/` - adaptation pour être appelé par les workers Bull
- `server/data/agents.js` - mise à jour via événements Bull (job complet, échec)
- API endpoints - potentiellement nouveaux endpoints pour gérer la queue

---

## Alternatives Considered

### Option A — File d'attente en mémoire (Array + setInterval)
- Benefits : Pas de dépendance externe, simple à implémenter
- Risks : Perte de toutes les tâches en cas de redémarrage serveur (viole I-03)
- Why not chosen : Viole l'invariant "State persisted - pas de in-memory only"

### Option B — PostgreSQL/PgBoss comme queue
- Benefits : Déjà une DB relationnelle, persistance forte, transactions ACID
- Risks : Pas de Postgres dans le stack actuel, ajoute une dépendance lourde
- Why not chosen : Stack actuel n'a pas de DB, Redis est plus léger pour une queue

### Option C — RabbitMQ comme message broker
- Benefits : Broker mature, excellent pour messaging complexe
- Risks : Infrastructure lourde, overkill pour MVP Node.js monolithique
- Why not chosen : Complexité injustifiée pour le besoin actuel

### Option D — Bull avec Redis (CHOISI)
- Benefits : Librairie Node.js native, Redis léger, persistance configurée, support délais/retries
- Risks : Nouvelle dépendance (Redis + Bull), nécessite Redis running
- Why chosen : Équilibre parfait entre persistance (respecte I-03) et simplicité d'intégration Node.js

---

## Affected Invariants

- `I-03` (AGENTS.md) : "State persisted - pas de in-memory only"
  - **Status** : Préservé
  - **Justification** : Redis avec AOF/RDB assure la persistance. Configuration documentée dans `STATE.orchestration-execution.md`.

- `I-06` (Constitution) : "Pipelines are defined in DOT graphs; no alternative execution paths"
  - **Status** : Étendu
  - **Justification** : Les pipelines exécutifs peuvent maintenant être séquentiels OU parallèles selon les dépendances. Le graphe DOT reste la source de vérité pour la topologie.

- `I-10` (Constitution) : "Operations are deterministic given the same inputs"
  - **Status** : Risque identifié
  - **Justification** : L'exécution parallèle introduit du non-déterminisme temporel. Les résultats LLM restent déterministes (mêmes inputs = même output), mais l'ordre de complétion peut varier.

---

## Contract / Surface Impact

### API REST
- **Impact** : Nouveaux endpoints potentiels pour gérer la queue
  - `GET /api/queue` - statut de la queue
  - `POST /api/agents/:id/stop` - arrêter un agent en cours
- **Compatibilité** : Additif seulement, les endpoints existants restent fonctionnels

### Runtime Behavior
- **Impact** : Exécution asynchrone via Bull workers
- **Qui est impacté** : Les agents créés via `POST /api/agents` avec un `task` utiliseront la queue
- **Compatibilité** : Mode fallback sur exécution synchrone si Redis indisponible (dégradé)

### Schema / File Format
- **Impact** : Nouveau champ `queueJobId` dans les sous-agents (pour tracking Bull)
- **Impact** : Nouveau statut possible `queued` pour les sous-agents
- **Compatibilité** : Additif, pas de migration breaking pour `agents.json`

---

## Migration Path

### Ajout de Redis
1. Installer Redis localement (Docker ou natif)
2. Configurer persistence AOF dans `redis.conf`
3. Variable d'environnement `REDIS_URL` dans `.env`

### Migration du code
1. Créer `server/queue/` avec Bull
2. Adapter `server/llm/openrouter.js` pour être callable par workers
3. Modifier `server/data/agents.js` pour supporter `queued` status
4. Ajouter `queueJobId` aux sous-agents lors de la création

### Compatibilité window
- Si Redis non disponible au démarrage → fallback en mode synchrone avec warning
- Les agents créés avant cette ADR continuent de fonctionner (exécution synchrone)

### Fallback behavior
```javascript
if (!redisConnected) {
  console.warn('Redis unavailable, falling back to sync execution');
  // Execute agents synchronously like before
}
```

---

## Rollback Plan

### Possibilité de rollback : YES

### Ce qui doit être reverté :
1. Supprimer les dépendances `bull` et `redis` du `package.json`
2. Supprimer le dossier `server/queue/`
3. Revenir à l'exécution synchrone dans `server/data/agents.js`
4. Retirer les nouveaux endpoints API liés à la queue

### Données pouvant rester :
- Les champs `queueJobId` dans `agents.json` (ignorés silencieusement)
- Les données Redis (peuvent être supprimées via `FLUSHDB`)

### Trigger de rollback :
- Redis instable en production (crashs répétés)
- Coûts infrastructure Redis trop élevés
- Complexité de debugging trop importante

### Monitoring post-rollback :
- Vérifier que tous les agents repassent en mode synchrone
- S'assurer qu'aucun job Bull n'est en attente

---

## Consequences

### Positive
- Parallélisation possible : exécution simultanée des agents sans dépendances
- Persistance des tâches : redémarrage serveur sans perte de progression
- Rate limiting naturel : Bull gère la concurrence max (évite surcharge OpenRouter)
- Observabilité : tableau de bord Bull UI possible pour monitoring
- Scalabilité : peut ajouter plusieurs workers Node.js plus tard

### Negative
- Nouvelle dépendance infrastructure : Redis doit être running (Docker ou service)
- Complexité accrue : async/event-based au lieu de synchronous straightforward
- Debugging plus difficile : il faut tracer à travers les jobs Bull
- Coût : Redis en production (mais léger, ~$10-20/mo sur services managés)

### Follow-up Debt
- Implémenter monitoring/metrics pour la queue (Bull Board ou Prometheus)
- Gérer les retries intelligents sur échecs OpenRouter (rate limits)
- Documenter la procédure de démarrage Redis en dev et prod
- Implémenter clean shutdown (attendre fin des jobs avant SIGTERM)

---

## Required Follow-Up

- [ ] Mettre à jour `AGENTS.md` avec les nouveaux endpoints API queue
- [ ] Créer `STATE.orchestration-execution.md` avec scope incluant Redis
- [ ] Documenter la procédure de setup Redis dans `docs/tooling/`
- [ ] Ajouter variable `REDIS_URL` dans `.env.example`
- [ ] Créer configuration Redis persistence recommandée
- [ ] Implémenter health check Redis dans `/health` endpoint

---

## References

- `server/data/agents.js` - où l'exécution synchrone actuelle réside
- `server/llm/openrouter.js` - sera appelé par les Bull workers
- `AGENTS.md` - invariants du projet
- `docs/governance/constitution.md` - I-03, I-06, I-10
- Bull documentation : https://github.com/OptimalBits/bull
- Redis persistence : https://redis.io/docs/management/persistence/

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
