# STATE.agent-typing-indicator

> Feature contract: Typing indicator animation for agent responses

---

## Mission

Implémenter un indicateur visuel de "typing" (3 points animés) qui s'affiche pendant que l'agent traite la requête, puis afficher la réponse de l'agent une fois le traitement terminé.

---

## Feature Type

- **new feature**

---

## Change Level

- **L2** - Changement borné à un composant React

---

## Classification Confirmation

- Feature type: new feature
- Change level: L2
- Selected flow: standard feature
- Reclassification from triage needed: no

---

## Acceptance Criteria

1. Lorsque l'utilisateur envoie un message, le composant affiche une zone de typing avec 3 points animés (CSS animation)
2. La zone de typing reste visible pendant le chargement de la réponse
3. Une fois la réponse reçue, la zone de typing disparaît et la réponse s'affiche
4. L'animation des 3 points est fluide (1 cycle ~1.5s, ease-in-out)

---

## Allowed Areas

- `src/components/AgentInteraction.jsx` (composant principal)
- `src/components/AgentTypingIndicator.jsx` (nouveau composant optionnel)
- `src/index.css` si nécessaires animations CSS

---

## Forbidden Areas

- `.opencode/` - ne pas modifier
- `server/` - pas de modification backend pour cette feature

---

## Public Contract Impact

- **non** - Pas de changement d'API publique

---

## Required Gates

| Gate | Required |
|------|----------|
| governance | no |
| architect | no |
| security | no |
| adr | no |
| doc | no |
| qa | yes |
| review | yes |
| release | no |

---

## Blast Radius

- **localized** - Composant React unique

---

## Parallel / Collision Risk

- **none** - Pas de worktree actif sur cette feature

---

## Execution Plan

1. Créer état local `isTyping` dans AgentInteraction
2. Afficher le typing indicator pendant le fetch
3. Masquer et afficher la réponse après reception
4. Tester manuellement
5. Commit

---

## Drift Conditions

Retour à planner si:
- Le composant AgentInteraction n'existe pas
- Besoin de modifier l'API backend

---

**Créé: 2026-04-28**