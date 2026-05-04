# ADR-005 — CI/CD Pipeline with GitHub Actions

## Status

Proposed

---

## Context

Le projet n'a actuellement aucune CI/CD (pas de GitHub Actions, pas de tests automatisés). Pour la production (P0), nous avons besoin :
- De linting automatique (ESLint)
- De tests automatisés (Jest pour backend, tests frontend)
- De build verification (frontend + backend)
- De déploiement automatisé (optionnel pour P0)

Contraintes :
- Repository GitHub (implique GitHub Actions)
- Node.js 18+ (pour fetch natif, Bull queue)
- Frontend React 19 avec Vite
- Les tests Jest viennent d'être ajoutés (T-010)

---

## Decision

Nous introduisons **GitHub Actions** avec un workflow de base : `lint` → `test` → `build`.

### Workflow GitHub Actions (`.github/workflows/ci.yml`) :
```yaml
on: [push, pull_request]
jobs:
  lint: ESLint (backend + frontend)
  test: Jest (backend server/)
  build: Vite build (frontend) + Node.js start check
```

### Ce qui est maintenant autorisé :
- Workflow automatique à chaque push/PR
- Échec CI bloque le merge (branch protection)
- Linting backend + frontend
- Tests Jest backend (minimum)
- Build verification (frontend + backend)

### Ce qui est maintenant interdit :
- Merge avec CI rouge (branch protection)
- Pas de tests pour nouveau code critique
- Skip CI avec `- [skip ci]` sans validation

### Frontières affectées :
- `.github/workflows/ci.yml` - Nouveau
- `package.json` - Scripts `lint`, `test`, `build` vérifiés
- `server/queue/dag.test.js` - Déjà créé (T-010), doit passer
- `.eslintrc.json` - Vérifier compatibilité

---

## Alternatives Considered

### Option A — GitHub Actions (CHOISI)
- Benefits : Natif GitHub, intégration parfaite, gratuit pour public repos
- Risks : Vendor lock-in GitHub, limité à 2000 min/month
- Why chosen : Repository est sur GitHub, standard pour MVP

### Option B — GitLab CI/CD
- Benefits : Auto-hébergeable, très configurable
- Risks : Repository est sur GitHub (migration nécessaire)
- Why not chosen : Repository déjà sur GitHub

### Option C — Jenkins
- Benefits : Ultra configurable, self-hosted
- Risks : Complexité énorme, maintenance lourde, overkill P0
- Why not chosen : Pas nécessaire pour MVP

### Option D — Pas de CI/CD (manual only)
- Benefits : Simple, pas de configuration
- Risks : Pas de vérification automatique, erreurs humaines
- Why not chosen : Inacceptable pour production (P0)

---

## Affected Invariants

- `I-03` (AGENTS.md) : "State persisted" - **Status** : Non affecté (CI ne change pas persistence)
- `I-06` (Constitution) : "Pipelines in DOT" - **Status** : Non affecté

---

## Contract / Surface Impact

### Configuration
- **Impact** : Nouveau dossier `.github/workflows/`
- **Fichier** : `ci.yml` (ou `main.yml`)
- **Secrets** : Aucun requis pour P0 (tests locaux)

### Developer Workflow
- **Impact** : Push/PR déclenche automatiquement lint + test + build
- **Branch Protection** : Recommandé (block merge si CI rouge)
- **Notifications** : GitHub UI + emails

---

## Migration Path

### Séquence :
1. Créer `.github/workflows/ci.yml`
2. Vérifier scripts `package.json` : `lint`, `test`, `build`
3. Activer branch protection sur `main` (optional P0)
4. Pousser vers `main` ou créer PR pour tester
5. Vérifier que tous les checks passent

### Compatibilité window :
- Dev local : `npm run lint`, `npm test`, `npm run build` fonctionnent
- CI fait la même chose (garantit reproductibilité)

### Fallback behavior :
- Si CI échoue → corriger localement, pusher de nouveau
- Si GitHub Actions down → merge manuel possible (désactiver branch protection temporairement)

---

## Rollback Plan

### Possibilité de rollback : YES

### Ce qui doit être reverté :
1. Supprimer `.github/workflows/ci.yml`
2. Désactiver branch protection sur `main`
3. Supprimer secrets GitHub Actions (si ajoutés)

### Données pouvant rester :
- Aucune (CI ne stocke pas de données)

### Trigger de rollback :
- Complexité trop élevée
- Minutes GitHub épuisées (limite atteinte)
- Passage à GitLab CI ou Jenkins (future)

### Monitoring post-rollback :
- Vérifier que les merges sont toujours possibles
- Nettoyer les workflows GitHub Actions orphelins

---

## Consequences

### Positive
- Vérification automatique (lint, tests, build)
- Prévient les régressions
- Standard industrie (GitHub Actions)
- Feedback rapide sur PRs

### Negative
- Configuration initiale (yaml à créer)
- Minutes limitées (2000/min par mois, gratuit)
- Nécessite que les tests soient écrits (sinon CI inutile)

### Follow-up Debt
- Augmenter coverage tests (backend + frontend)
- Ajouter déploiement automatisé (CD) dans future
- Configurer notifications Slack/Discord sur échec
- Documenter CI/CD dans `docs/tooling/ci-setup.md`

---

## Required Follow-Up

- [ ] Créer `.github/workflows/ci.yml` avec lint + test + build
- [ ] Vérifier scripts `package.json` (lint, test, build existent)
- [ ] Tester en poussant une branche de test
- [ ] Activer branch protection sur `main` (recommandé)
- [ ] Ajouter `docs/tooling/ci-setup.md`
- [ ] S'assurer que `npm test` passe (Jest config)

---

## References

- `AGENTS.md` - Runtime contract
- `docs/governance/constitution.md` - Invariants
- GitHub Actions documentation : https://docs.github.com/en/actions
- Jest documentation : https://jestjs.io/docs/getting-started
- ESLint documentation : https://eslint.org/docs/latest/

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
