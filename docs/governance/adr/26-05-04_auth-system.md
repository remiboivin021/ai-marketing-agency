# ADR-003 — Authentication System for API Endpoints

## Status

Proposed

---

## Context

Le système actuel a tous ses endpoints API ouverts (AGENTS.md : "Frontend accessible seulement après connexion (future)"). Pour la production, nous devons protéger les APIs avec une authentification.

Contraintes :
- Invariant I-03 : Pas de changement de persistence
- Pas de JWT complexe pour MVP (P0)
- Compatibilité avec Express.js actuel
- Frontend React doit pouvoir s'authentifier

---

## Decision

Nous introduisons **Basic Authentication** pour P0 (production-readiness), avec possibilité d'évolution future vers JWT.

### Ce qui est maintenant autorisé :
- Protection Basic Auth sur tous les endpoints `/api/*`
- Utilisateurs définis dans `.env` (ADMIN_USER, ADMIN_PASSWORD)
- Header `Authorization: Basic <base64>` requis
- Frontend doit s'authentifier avant d'accéder au dashboard

### Ce qui est maintenant interdit :
- Accès anonyme aux APIs
- Stockage de mots de passe en clair dans le code
- Pas de rate limiting sur les tentatives d'auth

### Frontières affectées :
- `server/index.js` - Middleware d'authentification
- `server/middleware/auth.js` - Nouveau fichier (Basic Auth)
- `src/components/Login.jsx` - Nouveau composant React
- `.env.example` - Ajout creds
- `AGENTS.md` - Mise à jour contrats API

---

## Alternatives Considered

### Option A — JWT (JSON Web Tokens)
- Benefits : Standard, scalable, pas de session state
- Risks : Complexité pour P0, gestion refresh tokens
- Why not chosen : Overkill pour MVP, préférer Basic Auth simple

### Option B — Basic Auth (CHOISI)
- Benefits : Simple à implémenter, support natif navigateur, Express middleware facile
- Risks : Creds transitent à chaque requête (HTTPS requis!), pas de granularité
- Why chosen : P0 rapide, compatibile avec curl/tests, évolutif vers JWT plus tard

### Option C — API Keys (header X-API-Key)
- Benefits : Simple, peut être rotated, pas de browser popup
- Risks : Gestion keys, pas standard pour frontend
- Why not chosen : Basic Auth est plus standard, navigateur gère popup

### Option D — OAuth2 (GitHub/Google)
- Benefits : Sécurité max, SSO possible
- Risks : Très complexe, dépendance externe, overkill P0
- Why not chosen : Pas nécessaire pour MVP interne

---

## Affected Invariants

- `I-03` (AGENTS.md) : "State persisted" - **Status** : Préservé (auth n'affecte pas persistence)
- `I-06` (Constitution) : "Pipelines in DOT" - **Status** : Non affecté
- Nouveau : Tous les endpoints `/api/*` maintenant protégés (contret public change)

---

## Contract / Surface Impact

### API REST
- **Impact** : Tous les endpoints `/api/*` maintenant requièrent `Authorization: Basic <base64>`
- **Compatibilité** : Breaking change (frontend doit s'adapter)
- **Nouveau endpoint** : `POST /api/auth/login` (optionnel, pour frontend)

### Frontend
- **Impact** : Login page requise avant dashboard
- **Composant** : `Login.jsx` ou `Login.tsx`
- **Storage** : `sessionStorage` pour creds (Base64)

---

## Migration Path

### Séquence :
1. Ajouter `ADMIN_USER`, `ADMIN_PASSWORD` dans `.env`
2. Activer middleware Basic Auth dans `server/index.js`
3. Créer `server/middleware/auth.js`
4. Mettre à jour frontend avec Login component
5. Tester avec `curl -u user:pass http://localhost:3001/api/agents`

### Compatibilité window :
- Frontend actuel cassera (401 Unauthorized) - normal pour P0
- Utilisateurs doivent être créés dans `.env`

### Fallback behavior :
- Si `ADMIN_USER` non défini → Auth désactivée avec warning (mode dev)

---

## Rollback Plan

### Possibilité de rollback : YES

### Ce qui doit être reverté :
1. Supprimer `server/middleware/auth.js`
2. Retirer middleware dans `server/index.js`
3. Supprimer `src/components/Login.jsx`
4. Retirer creds de `.env`

### Données pouvant rester :
- Aucune (auth n'affecte pas les données)

### Trigger de rollback :
- Complexité trop élevée
- Problèmes de compatibilité frontend
- Besoin d'une solution plus robuste (JWT)

### Monitoring post-rollback :
- Vérifier que les APIs sont de nouveau ouvertes
- Nettoyer les creds `.env` si rollback

---

## Consequences

### Positive
- APIs protégées (P0 requirement)
- Simple à implémenter (Basic Auth)
- Compatible avec tous les clients HTTP
- Peut évoluer vers JWT plus tard

### Negative
- Breaking change : frontend doit s'adapter
- Creds transitent à chaque requête (HTTPS requis en prod!)
- Pas de granularité (tout ou rien)
- Gestion users limitée à `.env`

### Follow-up Debt
- Implémenter HTTPS en production (nginx Docker)
- Ajouter rate limiting sur échecs auth
- Documenter format Authorization header dans AGENTS.md
- Créer `docs/security/auth-setup.md`
- Consider JWT pour P1 (future)

---

## Required Follow-Up

- [ ] Créer `server/middleware/auth.js` avec Basic Auth
- [ ] Protéger tous les `/api/*` endpoints
- [ ] Ajouter `ADMIN_USER`, `ADMIN_PASSWORD` à `.env.example`
- [ ] Créer `src/components/Login.jsx` (frontend)
- [ ] Mettre à jour `AGENTS.md` avec nouveaux contrats
- [ ] Documenter auth dans `docs/security/auth-setup.md`
- [ ] Tester avec curl et navigateur

---

## References

- `AGENTS.md` - Runtime contract (actuellement "Frontend accessible après connexion (future)")
- `docs/governance/constitution.md` - I-03, I-06
- RFC 7617 - HTTP Basic Authentication
- Express.js middleware documentation

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
