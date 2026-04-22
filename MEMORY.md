# MEMORY.md

> Mémoire opérationnelle courante pour Claude Code.
> Périmètre strict : état inter-sessions uniquement.
> Ce fichier n'est PAS de la gouvernance. Ce n'est PAS un journal.
> Les décisions vont dans DECISIONS.<slug>.md ou dans un ADR.
> Les règles vont dans CLAUDE.md ou _constitution.md.

---

## Règles de ce fichier

- **Lire en début de session** avant toute action.
- **Mettre à jour en fin de session** ou quand l'état change.
- **Supprimer une entrée** dès qu'elle n'est plus vraie.
- **Ne pas laisser grossir** : si une section dépasse 10 lignes, c'est un signal que l'information appartient ailleurs.

---

## Feature Active

```
<!-- empty — feature merged -->
```

---

## Statut des Portes

| Porte | Statut | Note |
|-------|--------|------|
| `$triage` | DONE | ROUTED - L3 structural change |
| `$planner` | DONE | STATE.backend-api.md created |
| `$preflight` | DONE | PASS |
| `$coder` | DONE | 5 commits merged to main |
| `$qa` | DONE | PASS |
| `$review` | DONE | APPROVED |
| `$doc` | DONE | UPDATED |
| `$release` | DONE | MERGE_READY — merged to main |

---

## Blockers Actifs

```
<!-- none -->
```

---

## Gotchas du Dépôt

```
- Backend: server/ Express sur port 3001, npm run dev:server
- Dev concurrent: npm run dev:all
- Frontend accède via proxy Vite /api/* → localhost:3001
- 3 endpoints REST: GET /api/gateway, /api/agents, /api/projects
```

---

## Nettoyage

Ce fichier doit être **vidé ou archivé** quand :
- Toutes les features sont mergées → réinitialiser Feature Active
- Un gotcha est corrigé → supprimer l'entrée GOTCHA

**Ce fichier ne doit jamais devenir un historique.**
**Dernière mise à jour: 2026-04-22 — backend-api merged to main**