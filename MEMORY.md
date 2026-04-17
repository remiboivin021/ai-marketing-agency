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
Slug    : <!-- ex: auth-refresh-token -->
Branche : <!-- ex: feature/auth-refresh-token -->
Worktree: <!-- ex: ../wt-auth-refresh-token -->
Tâche courante : <!-- ex: T-003 - Ajouter le test de régression -->
Démarrée le : <!-- ex: 2026-03-06 -->
```

---

## Statut des Portes

| Porte | Statut | Note |
|-------|--------|------|
| `$triage` | <!-- DONE / EN ATTENTE / BLOQUÉ --> | |
| `$planner` | <!-- DONE / EN ATTENTE / BLOQUÉ --> | |
| `$preflight` | <!-- PASS / BLOQUÉ --> | |
| `$architect` | <!-- DONE / N/A --> | |
| `$security` | <!-- DONE / N/A --> | |
| `$adr` | <!-- DONE / N/A --> | |
| `$coder` | <!-- EN COURS / DONE --> | |
| `$qa` | <!-- EN ATTENTE / PASS / FAIL --> | |
| `$review` | <!-- EN ATTENTE / APPROVED --> | |
| `$doc` | <!-- EN ATTENTE / DONE / N/A --> | |
| `$release` | <!-- EN ATTENTE / MERGE_READY --> | |

---

## Blockers Actifs

> Lister uniquement les blockers réels qui empêchent d'avancer.
> Supprimer quand résolu.

```
BLOCKER-001 :
  Quoi    : <!-- description courte du blocage -->
  Depuis  : <!-- date -->
  En attente de : <!-- qui/quoi débloque -->
  Route   : <!-- $skill à invoquer quand débloqué -->
```

---

## Gotchas du Dépôt

> Comportements non-évidents découverts en chemin.
> À lire avant de toucher les zones concernées.
> Ce ne sont PAS des décisions — juste des faits opérationnels.

```
GOTCHA-001 :
  Zone    : <!-- ex: src/auth/ -->
  Quoi    : <!-- ex: les tests plantent si on lance npm test sans DB locale -->
  Fix     : <!-- ex: lancer docker-compose up -d avant -->
  Découvert : <!-- date -->
```

---

## Contexte de Reprise

> À remplir en fin de session pour la prochaine reprise.
> Une phrase ou deux maximum. Pas un résumé complet.

```
Dernière session : <!-- date -->
Arrêté sur      : <!-- ex: en train d'écrire le test T-003, validation pas encore lancée -->
Prochain geste  : <!-- ex: lancer npm test -- --testPathPattern="auth" puis commiter -->
```

---

## Nettoyage

Ce fichier doit être **vidé ou archivé** quand :
- La feature est mergée → supprimer ou archiver
- Un nouveau slug de feature démarre → réinitialiser les sections Feature Active et Statut des Portes
- Un gotcha est corrigé dans le dépôt → supprimer l'entrée GOTCHA

**Ce fichier ne doit jamais devenir un historique.**
