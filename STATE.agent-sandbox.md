# STATE.agent-sandbox

> Feature contract: Agent Sandbox with whitelist commands only

---

## Mission

Implémenter un système de sandbox pour les agents IA permettant d'exécuter uniquement des commandes prédéfinies (whitelist). Les tools possibles: search_web, scrape_url, analyze_text. AUCUNE exécution de code arbitraire.

---

## Feature Type

- **security**

---

## Change Level

- **L2** - Borné à un module whitelist

---

## Classification Confirmation

- Feature type: security
- Change level: L2
- Selected flow: security-sensitive → preflight → coder → security → qa → review
- Reclassification from triage: yes (scope réduite à whitelist uniquement)

---

## Acceptance Criteria

1. ToolRegistry expose seulement les commands whitelist
2. Pas de exec(), eval(), ou shell command
3. Chaque tool validé avant exécution
4. Timeout configurable
5. Les tools retournent un résultat JSON

---

## Allowed Areas

- `server/llm/tools.js` (nouveau fichier)
- `server/index.js` (ajouter endpoint tools)

---

## Forbidden Areas

- `.opencode/` - ne pas modifier
- `server/llm/openrouter.js` - pas de modification pour cette feature
- Toute commande système (exec, bash, shell)

---

## Public Contract Impact

- **non** - API interne uniquement

---

## Required Gates

| Gate | Required |
|------|----------|
| governance | no (ADR fait) |
| architect | no |
| security | no (scope whitelist) |
| adr | yes (déjà fait) |
| doc | no |
| qa | yes |
| review | yes |
| release | no |

---

## Blast Radius

- **localized** - Un seul module server/llm/

---

## Parallel / Collision Risk

- **none** - Pas de worktree actif

---

## Execution Plan

1. Créer server/llm/tools.js avec ToolRegistry whitelist
2. Implémenter tools: search_web, scrape_url, analyze_text
3. Ajouter endpoint /api/tools pour lister les tools
4. Tester manuellement
5. Commit

---

## Drift Conditions

Retour à planner si:
- Scope expand pour inclure exec/shell
- Nouveau fichier hors de server/llm/

---

**Créé: 2026-04-28**