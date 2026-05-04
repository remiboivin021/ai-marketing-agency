# MEMORY.md

> Mémoire opérationnelle courante pour Claude Code.

---

## Feature Active

```
Feature: orchestration-execution
Branch: feature/orchestration-execution
Worktree: /home/remi-boivin/workspace/wt-orchestration-execution
```

---

## Requête

Implémente le système d'orchestration & exécution pour gérer une flotte d'agents IA avec OpenRouter comme LLM provider.

**Besoins identifiés:**
- File d'attente de tâches (Redis/Bull) - ADR-001 ✅
- Exécution parallèle des agents - ADR-002 ✅
- Gestion des dépendances entre agents (DAG) ✅
- Monitoring des coûts OpenRouter ✅
- Tracking coûts dans `cost` field ✅

---

## Statut des Portes

| Porte | Statut | Note |
|-------|--------|------|
| `$governance` | PASS | ADR-001 et ADR-002 créés |
| `$triage` | PASS | L3, structural change |
| `$planner` | PASS | STATE, TODO, DECISIONS créés |
| `$architect` | PASS | Architecture approuvée |
| `$adr` | PASS | ADR-001 et ADR-002 créés |
| `$preflight` | PASS | Ready to code ✅ |
| `$coder` | PASS | T-001 à T-011 complétés |
| `$qa` | PASS | 12/12 critères satisfaits |
| `$review` | PASS | Approved ✅ |
| `$doc` | PASS | AGENTS.md + redis-setup.md |
| `$release` | READY | Peut merger |

---

## Tâche Courante

**T-001** - Install Bull and Redis dependencies (bull, ioredis) in package.json

**Status** : IN_PROGRESS

---

## Gotchas du Dépôt

```
- Server: Express sur port 3001
- LLM: Integration OpenRouter existante (server/llm/openrouter.js)
- Queue: Bull + Redis (ADR-001)
- Orchestration: DAG avec dépendances (ADR-002)
- Nouveaux champs: dependsOn, pipelineDot, queueJobId, cost
- Frontend: React 19 + TailwindCSS v4 + Canvas API
- Worktree: /home/remi-boivin/workspace/wt-orchestration-execution
- Tâches dans TODO.orchestration-execution.md
```

---

## Contexte de Reprise

```
Preflight: PASS ✅
Prêt pour coder: T-001 à T-012
Worktree: /home/remi-boivin/workspace/wt-orchestration-execution
TODO: TODO.orchestration-execution.md (T-001 à T-012)
État: Coder boucle - une tâche à la fois, 1 commit par tâche
```

---

**Dernière mise à jour: 2026-05-04 — Preflight PASS, Coder IN_PROGRESS (T-001)**
