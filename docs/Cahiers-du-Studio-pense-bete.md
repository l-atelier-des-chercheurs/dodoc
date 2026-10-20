# Cahiers du Studio — pense-bête

Nouvelle version des [Cahiers du Studio](https://github.com/l-atelier-des-chercheurs/Les-Cahiers-du-Studio) sur le core de do•doc. Plan détaillé : [V14-vue3-migration-plan.md](V14-vue3-migration-plan.md).

## Principes

- [ ] **Core** : `core2` tel quel. Ne pas le forker : si un besoin des Cahiers manque, l'ajouter de façon générique dans do•doc.
- [ ] **Client** : neuf, Vue 3 + TypeScript + Vite.
- [ ] **`adc-core`** : un package partagé avec do•doc, jamais une copie. Deux copies divergent en quelques mois.
- [ ] **Périmètre v1 serré** : se méfier de l'effet « deuxième système ».

## Mise en place

- [ ] Workspace npm : `adc-core` en package, le client des Cahiers comme consommateur.
- [ ] `vue` 3, `vue-router` 4, `vue-i18n` 9 (legacy), `@vitejs/plugin-vue`, `vue-tsc` en CI.
- [ ] `@vue/compat` pendant la transition, à retirer à la fin.
- [ ] Types du contrat API dans `shared/` (schémas dossiers/fichiers, réponses API, événements socket).
- [ ] Déclarer les schémas de dossiers propres aux Cahiers côté core.

## Socle, avant le premier composant importé

- [ ] `adc-core/api.js` : passer de `new Vue()` à `reactive()`, `$set`/`$delete` deviennent des assignations (supprimer au passage le code mort des lignes 521-523).
- [ ] `$eventHub` : passer sur `mitt`.
- [ ] Contrat « app hôte » typé, qui remplace `$root.*` : `app_infos`, `debug_mode`, `is_mobile_view`, `publicPath`, `settings`, `opened_modals`…
- [ ] `<AppIcon>` à la place de `<b-icon>` (garder la même prop `icon`).
- [ ] Plugin `install(app)` qui enregistre les composants globaux d'`adc-core`.
- [ ] Trier les 15 mixins globaux : utiles au socle (`FormatDates`, `FormatBytes`, `Paths`, `Strings`…) ou propres à do•doc (`Publications`, `Capture`…).

## Codemod (réutilisable pour do•doc)

- [ ] `beforeDestroy` / `destroyed` → `beforeUnmount` / `unmounted`
- [ ] `:prop.sync` → `v-model:prop`
- [ ] `slot="x"` → `#x`
- [ ] `<b-icon` → `<AppIcon`
- [ ] `$eventHub.$on/$off/$emit` → `on/off/emit`
- [ ] `$listeners` → `$attrs` ; supprimer `.native`
- [ ] `<portal>` → `<Teleport>`

## Ordre d'import des composants

Porter de bas en haut, chaque import tirant tout son graphe :

1. [ ] `adc-core/ui`, `adc-core/inputs`
2. [ ] `adc-core/fields` (`TitleField` = 18 fichiers)
3. [ ] `adc-core/modals`, `adc-core/author` (auth)
4. [ ] `adc-core/capture` (stop-motion : cœur des Cahiers)
5. [ ] Publications uniquement si nécessaire : `PublicationOpen` = 205 fichiers, plus de la moitié du client.

## Dépendances à vérifier

- [ ] `vue-plyr` : sinon wrapper maison autour de `plyr`
- [ ] `vue-3d-model` : sinon wrapper autour de three.js (probablement inutile pour les Cahiers)
- [ ] `emoji-mart-vue-fast`, `vue-toastification`
- [ ] Monter vers leur version Vue 3 : `splitpanes`, `vue-slicksort`, `vue-advanced-cropper`, `vue-qrcode`

## Nouveau code

- `<script setup lang="ts">`, composables plutôt que mixins.
- Pas de nouvel usage de `$root` ni du bus global : props, emits, provide/inject ou store.
