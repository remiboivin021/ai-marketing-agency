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
Slug    : backend-integration
Branche : feature/backend-api
Worktree: ../wt-backend-api
Tâche courante : Initialization - fixing blockers
Démarrée le : 2026-04-22
```

---

## Statut des Portes

| Porte | Statut | Note |
|-------|--------|------|
| `$triage` | EN ATTENTE | New request - not classified yet |
| `$planner` | EN ATTENTE | Waiting for triage |
| `$preflight` | EN ATTENTE | Waiting for planner |
| `$architect` | N/A | Not required |
| `$security` | N/A | Not required |
| `$adr` | N/A | Not required |
| `$coder` | EN ATTENTE | Waiting for preflight |
| `$qa` | EN ATTENTE | Waiting for coder |
| `$review` | EN ATTENTE | Waiting for QA |
| `$doc` | EN ATTENTE | Will be required after coder |
| `$release` | EN ATTENTE | Waiting for review |

---

## Blockers Actifs

```
<!-- No blockers currently -->
```

---

## Gotchas du Dépôt

```
- Backend non implémenté - données mockées dans le frontend uniquement
- Stackbackend à implémenter : Node/Express avec persistance JSON
```

---

## Nettoyage

Ce fichier doit être **vidé ou archivé** quand :
- La feature est mergée → supprimer ou archiver
- Un nouveau slug de feature démarre → réinitialiser les sections Feature Active et Statut des Portes
- Un gotcha est corrigé dans le dépôt → supprimer l'entrée GOTCHA

**Ce fichier ne doit jamais devenir un historique.**