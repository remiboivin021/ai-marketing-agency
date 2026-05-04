# ADR-004 — Docker Containerization & Deployment

## Status

Proposed

---

## Context

Le système actuel n'a pas de containerization (pas de Dockerfile, pas de docker-compose). Pour la production (P0), nous avons besoin :
- D'un container pour l'application Node.js
- D'un container Redis avec persistence
- D'un reverse proxy (nginx) avec HTTPS
- D'un réseau Docker isolé

Contraintes :
- Invariant I-03 : "State persisted" - volumes Docker requis pour Redis + agents.json
- Port 3001 actuel → doit être derrière nginx (port 80/443)
- Hot-reload en dev, production build en prod
- Multi-stage build pour minimiser image size

---

## Decision

Nous introduisons **Docker + docker-compose** avec 3 services : `app`, `redis`, `nginx`.

### Architecture Docker :
```
[docker-compose.yml]
├── app (Node.js + Express, port 3001 interne)
├── redis (Redis 7-alpine, volume pour AOF)
└── nginx (reverse proxy, ports 80/443, HTTPS)
```

### Ce qui est maintenant autorisé :
- Déploiement via `docker-compose up -d`
- Volumes Docker pour persistence (Redis AOF, agents.json backup)
- HTTPS via nginx (self-signed ou Let's Encrypt)
- Multi-stage Dockerfile (dev vs prod)

### Ce qui est maintenant interdit :
- Exposition directe port 3001 en production
- Pas de volumes pour Redis (violerait I-03)
- Stockage images Docker non optimisé (>500MB)

### Frontières affectées :
- `Dockerfile` - Nouveau (multi-stage)
- `docker-compose.yml` - Nouveau
- `nginx/default.conf` - Nouveau (reverse proxy + HTTPS)
- `.dockerignore` - Nouveau
- `server/index.js` - Légère modification (X-Forwarded-For, trust proxy)

---

## Alternatives Considered

### Option A — Docker + docker-compose (CHOISI)
- Benefits : Standard industrie, orchestration simple, volumes natifs
- Risks : Complexité initiale, nécessite Docker knowledge
- Why chosen : Standard pour P0, parfait pour MVP

### Option B — Kubernetes (K8s)
- Benefits : Scaling, self-healing, production-grade
- Risks : Overkill pour MVP, complexité énorme, courbe apprentissage
- Why not chosen : Pas nécessaire P0, trop complexe

### Option C — Heroku / Render / PaaS
- Benefits : Simple, git push to deploy, pas de Docker management
- Risks : Vendor lock-in, coût, moins de contrôle
- Why not chosen : Veut pas de dépendance externe pour MVP

### Option D — PM2 + systemd (no Docker)
- Benefits : Simple, direct sur VPS
- Risks : Pas d'isolation, gestion dépendances, pas standard
- Why not chosen : Docker est le standard moderne

---

## Affected Invariants

- `I-03` (AGENTS.md) : "State persisted" - **Status** : Préservé avec volumes Docker
  - Redis : volume `redis-data` (AOF)
  - agents.json : volume `app-data` ou backup cron
- `I-06` (Constitution) : "Pipelines in DOT" - **Status** : Non affecté

---

## Contract / Surface Impact

### Configuration
- **Impact** : Nouveaux fichiers (`Dockerfile`, `docker-compose.yml`, `nginx/default.conf`)
- **Variables** : `REDIS_URL` devient `redis://redis:6379` (internal Docker network)
- **Ports** : 80/443 externes (nginx), 3001 interne seulement

### Deployment
- **Impact** : Nouvelle procédure déploiement
- **Commande** : `docker-compose up -d --build`
- **Logs** : `docker-compose logs -f`

---

## Migration Path

### Séquence :
1. Créer `Dockerfile` (multi-stage : build + production)
2. Créer `docker-compose.yml` (app + redis + nginx)
3. Créer `nginx/default.conf` (reverse proxy + HTTPS)
4. Créer `.dockerignore` (node_modules, .git, etc.)
5. Mettre à jour `.env.example` avec `REDIS_URL=redis://redis:6379`
6. Modifier `server/index.js` pour trust proxy (nginx)
7. Tester en local : `docker-compose up -d`

### Compatibilité window :
- Dev local reste possible sans Docker (npm run dev)
- Docker est optionnel pour développement

### Fallback behavior :
- Si Docker non disponible → utiliser setup manuel (Node.js + Redis local)

---

## Rollback Plan

### Possibilité de rollback : YES

### Ce qui doit être reverté :
1. Supprimer `Dockerfile`, `docker-compose.yml`, `nginx/`
2. Restaurer `REDIS_URL` à `localhost:6379` dans `.env`
3. Retirer trust proxy de `server/index.js`

### Données pouvant rester :
- Images Docker (peuvent être supprimées avec `docker system prune`)
- Volumes Docker (préserver données Redis si rollback)

### Trigger de rollback :
- Problèmes de performance container
- Complexité Docker trop élevée pour l'équipe
- Passage à Kubernetes (future)

### Monitoring post-rollback :
- Vérifier que l'app fonctionne en mode manuel
- Nettoyer les containers/volumes orphelins

---

## Consequences

### Positive
- Standard industrie (Docker)
- Isolation (app, redis, nginx séparés)
- Persistence garantie (volumes)
- HTTPS facile (nginx)
- Scaling futur possible (K8s)

### Negative
- Complexité initiale (Docker knowledge requis)
- Multi-stage build à maintenir
- Gestion volumes (backup strategy requise)
- Taille images (même optimisée)

### Follow-up Debt
- Implémenter backup automatique agents.json (cron container)
- Monitoring containers (Prometheus + cAdvisor)
- CI/CD avec build + push Docker Hub/ECR
- Documenter déploiement dans `docs/tooling/docker-setup.md`

---

## Required Follow-Up

- [ ] Créer `Dockerfile` multi-stage (Node.js 18+)
- [ ] Créer `docker-compose.yml` avec app + redis + nginx
- [ ] Créer `nginx/default.conf` avec HTTPS + reverse proxy
- [ ] Créer `.dockerignore`
- [ ] Mettre à jour `server/index.js` pour trust proxy
- [ ] Ajouter `docs/tooling/docker-setup.md`
- [ ] Tester en local avec `docker-compose up -d`

---

## References

- `AGENTS.md` - Runtime contract
- `docs/governance/constitution.md` - I-03
- Docker documentation : https://docs.docker.com/
- docker-compose documentation : https://docs.docker.com/compose/
- nginx reverse proxy : https://nginx.org/en/docs/http/ngx_http_proxy_module.html

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
