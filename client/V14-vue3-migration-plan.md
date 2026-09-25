# do•doc v14 — Plan de migration Vue 3

## Objectif

Préparer une migration contrôlée de l’application `client` de Vue 2.7 vers Vue 3 pour la version majeure 14, avec un risque produit minimal et une stratégie de déploiement progressive.

## Contexte confirmé

- Le client est actuellement en Vue 2.7 (`[client/package.json](/Users/louis/Documents/REPO/dodoc/client/package.json)`).
- Le bootstrap applicatif est Vue 2 (`[client/src/main.js](/Users/louis/Documents/REPO/dodoc/client/src/main.js)`).
- Le routeur est en v3 (`[client/src/router/index.js](/Users/louis/Documents/REPO/dodoc/client/src/router/index.js)`).
- `bootstrap-vue` est présent, mais l’usage principal identifié est `b-icon` (pas de dépendance forte à des composants complexes BootstrapVue dans le flux discuté).

## Principes de migration

- Avancer par phases courtes, validées, sans “big bang”.
- Garder le comportement fonctionnel identique tant que possible.
- Prioriser la migration de l’infrastructure (boot + routeur + plugins) avant les composants métiers.
- Réduire la dette Vue 2 au fur et à mesure (`$listeners`, `.native`, hooks lifecycle legacy, event bus global).

## Plan par phases

## Phase 0 — Cadrage et préparation (1 à 2 jours)

- Geler le périmètre v14 côté frontend (features non critiques reportées si besoin).
- Créer une branche dédiée migration.
- Établir une baseline QA:
  - parcours critiques (édition, publication, capture, auth, médias),
  - smoke tests manuels minimum,
  - scripts de build/dev stables.
- Dresser une matrice dépendances “Vue 3 readiness” à partir de `[client/package.json](/Users/louis/Documents/REPO/dodoc/client/package.json)`.

Livrable:
- checklist de compat validée,
- stratégie de remplacement `b-icon` choisie.

## Phase 1 — Infrastructure Vue 3 (2 à 4 jours)

- Migrer l’entrée app:
  - `new Vue(...)` -> `createApp(...)` dans `[client/src/main.js](/Users/louis/Documents/REPO/dodoc/client/src/main.js)`.
  - `Vue.prototype` -> `app.config.globalProperties`.
  - enregistrement global composants/directives/mixins via API Vue 3.
- Migrer routeur:
  - `vue-router@3` -> `vue-router@4`,
  - adaptation de `[client/src/router/index.js](/Users/louis/Documents/REPO/dodoc/client/src/router/index.js)`.
- Mettre à jour la config build:
  - plugin Vite Vue 3 (`@vitejs/plugin-vue`) en remplacement du plugin Vue 2 dans `[client/vite.config.js](/Users/louis/Documents/REPO/dodoc/client/vite.config.js)`.

Livrable:
- app démarre en local sous Vue 3,
- routing principal opérationnel,
- build prod généré sans erreur bloquante.

## Phase 2 — UI system et icônes (2 à 4 jours)

- Retirer la dépendance `bootstrap-vue` utilisée pour `b-icon`.
- Remplacer `b-icon` par une solution Vue 3-compatible:
  - soit composant interne d’icônes (mapping nom -> SVG),
  - soit librairie d’icônes standard avec couche de compat (`<AppIcon :name="...">`).
- Adapter les attributs/props spécifiques des usages existants.

Livrable:
- aucune référence runtime à BootstrapVue,
- rendu icônes cohérent sur les écrans critiques.

## Phase 3 — Compatibilité composants Vue 3 (5 à 10 jours)

Traiter les patterns Vue 2 détectés à grande échelle:

- `beforeDestroy` -> `beforeUnmount`,
- suppression/remplacement de `.native`,
- migration des usages `$listeners`,
- revue des patterns d’event bus global (`$eventHub`) pour compat Vue 3.

Cibles prioritaires:
- `[client/src/adc-core/fields/collaborative-editor/CollaborativeEditor3.vue](/Users/louis/Documents/REPO/dodoc/client/src/adc-core/fields/collaborative-editor/CollaborativeEditor3.vue)`,
- `[client/src/components/publications/page_by_page/PageMenu.vue](/Users/louis/Documents/REPO/dodoc/client/src/components/publications/page_by_page/PageMenu.vue)`,
- `[client/src/components/publications/page_by_page/MoveableItem.vue](/Users/louis/Documents/REPO/dodoc/client/src/components/publications/page_by_page/MoveableItem.vue)`,
- `[client/src/adc-core/capture/CaptureView.vue](/Users/louis/Documents/REPO/dodoc/client/src/adc-core/capture/CaptureView.vue)`.

Livrable:
- parcours critiques validés en dev et build,
- plus d’erreurs de compat Vue 3 sur les zones prioritaires.

## Phase 4 — Stabilisation, QA et release prep (3 à 6 jours)

- Campagne de non-régression fonctionnelle.
- Correction des régressions UI/UX.
- Vérification perf perçue sur écrans lourds (éditeur, capture, publication).
- Rédaction notes de migration v14.

Livrable:
- candidate release v14 “merge-ready”.

## Estimation globale

- Effort total: environ 3 à 5 semaines-homme selon le niveau de QA exigé.
- Risque principal: régressions transverses liées aux patterns Vue 2 historiques.

## Risques et mitigations

- Risque: dépendance cachée à BootstrapVue hors `b-icon`.
  - Mitigation: scanner complet et suppression progressive avec fallback.
- Risque: comportement implicite via `$eventHub`.
  - Mitigation: cartographier les événements critiques et ajouter une couche de compat temporaire.
- Risque: régressions silencieuses dans composants volumineux.
  - Mitigation: prioriser tests manuels ciblés sur flux métier à fort impact.

## Définition de terminé (DoD) v14 migration

- Vue 3 en production sur l’app `client`.
- Aucun import/runtime `bootstrap-vue` restant.
- Routeur v4 en place.
- Flux critiques validés:
  - navigation globale,
  - édition de contenu,
  - capture média,
  - publication/export.
- Build dev/prod stable et reproductible.

## Backlog post-v14 (optionnel mais recommandé)

- Réduire les mixins globaux et passer progressivement à des composables.
- Renforcer la couverture de tests sur les parcours critiques.
- Nettoyer les API legacy conservées pour la transition.
