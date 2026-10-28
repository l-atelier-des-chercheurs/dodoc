# do•doc — Plan de migration Vue 3 (+ TypeScript)

> Mis à jour le 2026-10-11.

## Objectif

Migrer le client de Vue 2.7 vers Vue 3 sans réécriture, en faisant de `adc-core` un **socle partagé Vue 3 + TypeScript**, utilisé par do•doc et par la nouvelle version des [Cahiers du Studio](https://github.com/l-atelier-des-chercheurs/Les-Cahiers-du-Studio) (voir [Cahiers-du-Studio-pense-bete.md](Cahiers-du-Studio-pense-bete.md)).

## Stratégie

- **Les Cahiers sont le pilote** : un client neuf en Vue 3 + TS, branché sur `core2` (déjà agnostique, comme le montrent Slashdoc et livingarchive).
- **`adc-core` est extrait en package** (workspace npm) et porté **à la demande**, au fil des besoins des Cahiers.
- **do•doc migre ensuite sur place**, en réutilisant le socle déjà porté et le codemod.
- **Pas de réécriture** : on adapte les composants (Options API conservée) et on passe par `@vue/compat` le temps de la transition.
- **TypeScript** : `<script setup lang="ts">` pour le code neuf, `defineComponent` pour le code porté. Types du contrat API (schémas dossiers/fichiers, réponses `api2.js`, événements socket) dans [shared/](../shared/), et `// @ts-check` + JSDoc côté `core2`, sans le réécrire. `vue-tsc` en CI dès le départ.

## Inventaire (2026-10-11, `adc-core` + `components/publications`)

### Socle : à traiter avant tout composant

| Point | Volume | Correctif |
|---|---|---|
| `$api` = `new Vue({...})` servant de store ([adc-core/api.js](../client/src/adc-core/api.js)) | 1 fichier, ~25 `$set`/`$delete` | `reactive()` (ou Pinia) ; `$set(o, k, v)` devient `o[k] = v`. Au passage, supprimer le code mort de [api.js:521-523](../client/src/adc-core/api.js#L521-L523) (la clé vient d'être supprimée ligne 518, la condition est toujours fausse). |
| `$eventHub = new Vue()` | 210 occurrences, 42 fichiers, ~75 événements | `mitt` (API `on`/`off`/`emit` quasi identique). Tous les `$on`/`$off` passent par le bus, aucun événement d'instance. |
| `$root.*` | 117 occurrences, 49 fichiers | Store « app » injecté et typé (`app_infos`, `debug_mode`, `is_mobile_view`, `publicPath`, `settings`, `opened_modals`…). C'est le **contrat que l'app hôte fournit à `adc-core`**. |
| 15 mixins globaux (`Vue.mixin` dans [main.js](../client/src/main.js)) | `FormatDates`, `FormatBytes`, `Props`, `Cache`, `Medias`, `Authors`, `Capture`, `Publications`, `Paths`, `Strings`, `Queries`, `Tags`, `Electron`, `DodocIcon`, `Folders` | `app.mixin()` fonctionne toujours en Vue 3 pour la transition. Cible : des composables/utilitaires importés explicitement. Certains (`Publications`, `Capture`) sont propres à do•doc et ne doivent pas suivre dans le socle. |
| ~20 composants globaux (`Vue.component` dans [main.js](../client/src/main.js)) | `TitleField`, `DropDown`, `DetailsPane`… | Le package `adc-core` exporte un plugin `install(app)`. |
| `Vue.prototype.$sanitize`, `$alertify`, `$axios`… | — | `app.config.globalProperties`, ou mieux, des imports directs. |

### Mécanique : codemod

| Pattern | Volume | Remplacement |
|---|---|---|
| `<b-icon>` | 340 occurrences, 122 fichiers | `<AppIcon>` avec la même prop `icon` |
| `beforeDestroy` / `destroyed` | ~200 | `beforeUnmount` / `unmounted` |
| `:prop.sync` | 80 occurrences, 43 fichiers | `v-model:prop` |
| `slot="x"` | 41 | `#x` / `v-slot:x` |
| `v-model` maison (`value`/`input`) | ~5 fichiers | `modelValue`/`update:modelValue` |
| `$listeners`, `.native` | ~10 fichiers | `$attrs` / suppression |
| `portal-vue` | 4 fichiers | `<Teleport>` |
| JSX | [ddr/index.vue](../client/src/ddr/index.vue) | `@vitejs/plugin-vue-jsx` |

Le codemod (un script, pas des remplacements à la main) sert deux fois : pour les Cahiers, puis pour do•doc.

### Dépendances

| Paquet | Action |
|---|---|
| `vue` 2.7, `@vitejs/plugin-vue2(-jsx)` | `vue` 3, `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx` |
| `vue-router` 3 | 4 |
| `vue-i18n` 8 | 9 en mode legacy : les 358 `$t` restent inchangés |
| `bootstrap-vue` (icônes uniquement) | Supprimer, remplacer par `AppIcon` |
| `portal-vue` | `<Teleport>` natif |
| `@vue/test-utils` 1 | 2 |
| `splitpanes`, `vue-slicksort`, `vue-advanced-cropper`, `@chenfengyuan/vue-qrcode` | Montée vers leur version Vue 3 |
| `vue-plyr`, `vue-3d-model`, `emoji-mart-vue-fast`, `vue-toastification` | À vérifier, sinon wrapper maison autour de la lib non-Vue (plyr, three.js…) |

### Taille des imports transitifs

Importer un composant entraîne tout son graphe de dépendances :

- `TitleField` : 18 fichiers, ~4 500 lignes.
- `PublicationOpen` : **205 fichiers, ~56 500 lignes**, soit plus de la moitié du client.

Il faut donc porter de bas en haut (`ui` et `inputs`, puis `fields`, puis `modals`, puis `capture`, puis les publications) plutôt que de tirer un gros composant d'un coup.

## Phases

### Phase 0 — Préparation
- Workspace npm avec `adc-core` en package.
- Matrice de compatibilité des dépendances (tableau ci-dessus) à compléter.
- Parcours critiques de référence pour la QA : édition, publication, capture, auth, médias.

### Phase 1 — Socle (dans le client des Cahiers)
- `createApp`, `vue-router` 4, `vue-i18n` 9, `@vitejs/plugin-vue`, `@vue/compat`.
- `api.js` en `reactive()`, `$eventHub` sur `mitt`, contrat `$root` typé, `AppIcon`, plugin `install(app)`.
- Types partagés du contrat API dans `shared/`.

### Phase 2 — Codemod et portage progressif
- Écrire le codemod (patterns ci-dessus).
- Porter `adc-core` de bas en haut, selon les besoins des Cahiers ; corriger les warnings de `@vue/compat` à chaque import.

### Phase 3 — Migration de do•doc
- Brancher do•doc sur le package `adc-core`.
- Passer le codemod sur `components/` et `views/`.
- Mixins propres à do•doc : à garder en `app.mixin()` dans un premier temps.

### Phase 4 — Stabilisation
- Retirer `@vue/compat`.
- Non-régression sur les parcours critiques ; vérifier la perf sur les écrans lourds (éditeur, capture, page par page).

## Définition de terminé

- Vue 3 en production sur do•doc et les Cahiers, avec le même package `adc-core`.
- Plus de `bootstrap-vue`, `portal-vue` ni `@vue/compat`.
- `vue-tsc` passe en CI.
- Parcours critiques validés : navigation, édition, capture, publication/export.

## Backlog post-migration

- Remplacer les mixins globaux par des composables.
- Passer progressivement les composants portés en `<script setup lang="ts">`.
- Renforcer les tests sur les parcours critiques.
