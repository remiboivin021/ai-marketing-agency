# PROJECT.md

Ce document sert de source de vérité courte pour présenter le projet, son périmètre, ses contraintes et ses règles d'exécution. Il est conçu pour être lisible rapidement par un humain comme par un agent IA.

## 1. Identité du projet

- Nom du projet : `<nom-du-projet>`
- Type : `<web-app | api | cli | library | autre>`
- Statut : `<idea | active | maintenance | deprecated>`
- Propriétaire : `<équipe | personne>`
- Référent technique : `<nom>`

## 2. Résumé

`<Décrire en 2 à 4 phrases le problème traité, la valeur apportée et le résultat attendu.>`

## 3. Objectif principal

`<Définir le but concret du projet en une phrase testable.>`

## 4. Objectifs secondaires

- `<objectif secondaire 1>`
- `<objectif secondaire 2>`
- `<objectif secondaire 3>`

## 5. Hors périmètre

- `<ce que le projet ne fait pas>`
- `<ce qui ne doit pas être implémenté sans validation>`

## 6. Utilisateurs cibles

- Utilisateur principal : `<profil>`
- Utilisateur secondaire : `<profil>`
- Parties prenantes : `<équipe | métier | ops | sécurité>`

## 7. Besoin à couvrir

### Contexte

`<Décrire la situation de départ, l'environnement, l'usage cible ou l'opportunité identifiée.>`

### Problème ou manque

`<Décrire ce qui n'existe pas encore, ce qui est insuffisant aujourd'hui, ou ce que les utilisateurs ne peuvent pas faire.>`

### Impact attendu

`<Décrire ce que ce projet doit débloquer, améliorer ou sécuriser.>`

## 8. Proposition de solution

`<Décrire l'approche retenue à haut niveau, sans détailler l'implémentation.>`

## 9. Contraintes non négociables

- Fonctionnelles : `<règles métier obligatoires>`
- Techniques : `<stack, compatibilité, performance, dépendances>`
- Sécurité : `<auth, secrets, données sensibles, réseau>`
- Gouvernance : `<ADR requis, invariants, règles de changement>`

## 10. Hypothèses

- `<hypothèse 1>`
- `<hypothèse 2>`
- `<hypothèse 3>`

## 11. Risques connus

- Risque : `<description>`
  Impact : `<faible | moyen | élevé>`
  Mitigation : `<action prévue>`

- Risque : `<description>`
  Impact : `<faible | moyen | élevé>`
  Mitigation : `<action prévue>`

## 12. Contrats publics et interfaces exposées

`<Lister ici ce que le projet expose déjà, ou ce qu'il prévoit d'exposer à court terme. Si aucun contrat n'existe encore, indiquer explicitement "Aucun contrat public stable à ce stade".>`

| Contrat | Emplacement | Politique de compatibilité |
|---------|-------------|----------------------------|
| `<API | CLI | config | format>` | `<chemin>` | `<additive-only | versionné | ADR requis>` |

## 13. Architecture en une vue

`<Décrire la forme cible la plus simple du système. Pour un produit naissant, cette section peut refléter l'architecture initiale prévue plutôt qu'un système déjà en production.>`

- Entrée : `<comment une requête / commande / donnée arrive>`
- Traitement : `<validation puis logique principale>`
- Sortie : `<réponse, artefact, effet de bord>`
- Persistance : `<base, fichiers, cache, ou aucune à ce stade>`
- Intégrations externes : `<services, APIs, brokers, ou aucune à ce stade>`

## 14. Stack et environnement

- Langage principal : `<langage>`
- Framework principal : `<framework>`
- Outils de build : `<outil>`
- Outils de test : `<outil>`
- Déploiement : `<local | ci | cloud | on-prem>`

## 15. Organisation du dépôt

| Zone | Rôle |
|------|------|
| `<src/>` | `<code applicatif>` |
| `<docs/>` | `<documentation durable>` |
| `<tests/>` | `<validation automatisée>` |
| `<scripts/>` | `<automatisation>` |

## 16. Flux de travail attendu

1. `<Décrire le point d'entrée>`
2. `<Décrire la validation>`
3. `<Décrire le traitement>`
4. `<Décrire la persistance ou la sortie>`
5. `<Décrire la vérification finale>`

## 17. Critères de réussite

- `<critère mesurable 1>`
- `<critère mesurable 2>`
- `<critère mesurable 3>`

## 18. Critères d'acceptation minimum

- `<comportement observable attendu>`
- `<contrainte de non-régression>`
- `<preuve de validation requise>`

## 19. Documentation liée

- README : `<chemin>`
- Docs architecture : `<chemin>`
- ADR : `<chemin>`
- Roadmap : `<chemin>`

## 20. Instructions pour agents IA

- Lire `AGENTS.md` avant toute action.
- Vérifier les invariants et le périmètre avant de modifier du code.
- Ne pas inventer de comportement absent du dépôt.
- Documenter tout changement de contrat public dans le même flux de travail.
- Signaler explicitement les inconnues au lieu de supposer.

---
Maintainer/Author: <MAINTAINER_AUTHOR>
Version: 0.1.0
Last modified: 2026-03-01
---
