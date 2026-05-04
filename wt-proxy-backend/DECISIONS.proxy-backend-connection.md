# DECISIONS - proxy-backend-connection

## Decision: T-001 - Analyse du bug ECONNREFUSED

### Constat initial

L'erreur `ECONNREFUSED` signifie que le proxy Vite (/api/gateway, /api/agents) ne peut pas se connecter au serveur backend sur localhost:3001.

### Options évaluées

1. **Documentation** - S'assurer que les utilisateurs savent comment démarrer le backend
   - Déjà documenté dans MEMORY.md (lignes 54-57)
   - package.json a `npm run dev:all` pour démarrer les deux services

2. **Amélioration du proxy Vite** - Ajouter une meilleure gestion d'erreur
   - Vite permet de configurer un `onError` callback pour le proxy
   - Cela nécessiterait modifier vite.config.js

3. **Script de convenience** - Créer un script de démarrage
   - `npm run dev:all` existe déjà et fonctionne

### Décision prise

**Option 1 + 2 combinées:**

1. La documentation principale est dans MEMORY.md - c'est suffisant pour les utilisateurs avancés
2. Améliorer vite.config.js pour afficher une erreur plus claire quand le backend n'est pas disponible

### Justification

- L'erreur actuelle est technique et confuse pour les nouveaux utilisateurs
- Ajouter un message d'erreur explicite dans la configuration proxy aide au debug
- Cela reste dans les Allowed Areas (vite.config.js)
- Risque mínimo - juste une amélioration de UX