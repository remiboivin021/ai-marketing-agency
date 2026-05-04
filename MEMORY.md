# MEMORY.md

> Mémoire opérationnelle courante pour Claude Code.

---

## Feature Active

```
Feature: agent-sandbox (commandes prédéfinies)
Branche: feature/agent-sandbox
```

---

## Requête

J'ai bien une interaction avec le llm. Maintenant je veux qu'on s'occupe de la partie sandboxing qui permet aux agents IA de run du code/commande iso-lé.

**Scope modifiée pour sécurité:**
- PAS d'exécution de code arbitraire
- SEULEMENT commandes prédéfinies (whitelist)
- Exemples: search_web, scrape_url, analyze_text

---

## Statut des Portes

| Porte | Statut | Note |
|-------|--------|------|
| `$governance` | BLOCK | ADR requis |
| Scope | Modifiée | Whitelist uniquement |

---

## Gotchas du Dépôt

```
- Server: Express sur port 3001
- LLM: Integration openrouter
- Sandbox: Commandes prédéfinies uniquement
```

---

**Dernière mise à jour: 2026-04-28 — Scope modifiée: whitelist only**