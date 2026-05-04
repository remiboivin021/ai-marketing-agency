# ADR-004: Agent Sandbox - Whitelist Commands Only

> **Status**: Accepted
> **Date**: 2026-04-28
> **Author**: Claude

## Contexte

Les agents IA doivent pouvoir exécuter des actions concrètes (recherche web, scrape, analyse) pour accomplir des tâches. Mais exécuter du code arbitraire présente des risques sécurité majeurs.

## Décision

**Restriction à une whitelist de commandes prédéfinies uniquement**.

###-commandes Autorisées

| Commande | Description | Isolation |
|---------|------------|------------|
| `search_web` | Recherche web via API | API externe |
| `scrape_url` | Scraping de page web | Lecture seule |
| `analyze_text` | Analyse de texte local | N/A - no execution |
| `generate_text` | Génération de texte via LLM | N/A |

### Commandes Explicitement Interdites

- ❌ `exec` / `eval` - Exécution de code arbitraire
- ❌ `shell` / `bash` - Commandes système
- ❌ `file_write` - Écriture fichier
- ❌ `file_delete` - Suppression fichier
- ❌ `network` - Connexions réseau arbitraires

## Architecture

```
Agent → ToolRegistry (whitelist) → API/LLM
         ↑
    Validation: commande dans whitelist?
```

## Implémentation

1. `server/llm/tools.js` - ToolRegistry avec whitelist
2. Chaque tool validé avant exécution
3. Pas de `eval()` ou `exec()`
4. Timeout configurable

## Risques Résiduels

| Risque | Mitigation |
|-------|------------|
| API abuse | Rate limiting par agent |
| Web scrape abuse | whitelist domains optional |
| Resource exhaustion | Timeout + max results |

## Alternatives Écartées

| Alternative | Raison |
|------------|--------|
| Docker sandbox | Trop lourd pour MVP |
| VM isolation | Pas nécessaire avec whitelist |
| Arbitrary code | Risk RCE trop élevé |

---

**Decision**:-whitelist-only approved for MVP