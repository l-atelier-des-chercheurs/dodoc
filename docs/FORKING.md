# Faire un autre outil à partir de do•doc

> État : en cours de développement sur la branche `next-adc_core_pkg`. Cette note décrit les choix déjà faits et ce qui reste à faire. Elle sera mise à jour au fil du chantier.

Jusqu'ici, slashdoc, SoftGems, Living Archive et les autres outils dérivés sont des **forks complets** de do•doc. Chaque correctif du serveur doit être reporté à la main dans chaque fork. L'objectif de la branche est de sortir le cœur commun dans un package, **adc-core**. Une app (do•doc, slashdoc, Les Cahiers du Studio v3…) n'est plus alors qu'une couche fine : son schéma, ses réglages, son contenu par défaut, son client et son emballage Electron.

**Règle : on ne modifie pas adc-core depuis un fork.** Si une app a besoin d'un comportement différent, on ajoute une option ou un point d'extension dans adc-core. Un composant n'entre dans le package que lorsqu'une deuxième app en a besoin.

## Organisation

adc-core a son propre repo, [l-atelier-des-chercheurs/adc-core](https://github.com/l-atelier-des-chercheurs/adc-core). Les apps l'installent depuis ses tags git (voir « Distribution d'adc-core »).

```
dodoc/
├── .nvmrc                    version exacte de Node pour l'app (24.22.0)
├── .npmrc                    engine-strict=true
├── package.json              dépend de adc-core (tag git)
├── index.js                  appelle require("adc-core").start({...})
├── settings_base.json        réglages et schéma de l'app
├── content/                  contenu par défaut, copié à la création d'un dossier de contenu
│   └── meta.txt              déclare le format de contenu de l'app (voir plus bas)
├── client/                   package séparé : client Vue, Vite ; build → client/dist (livré dans les releases)
├── electron/                 emballage desktop propre à l'app (pas un package npm)
│   ├── electron-builder.yml  identité : appId, productName, icônes, cibles ; extends la base d'adc-core
│   └── build/                icônes, entitlements macOS
└── node_modules/adc-core/    installé depuis le repo adc-core
    ├── package.json          dépendances du serveur, engines ; bin adc-electron
    ├── server/               ancien core2 ; server/index.js = point d'entrée start()
    ├── electron/             processus principal Electron (main.js, preload.js…), CLI adc-electron,
    │   │                     config electron-builder de base
    │   └── package.json      electron (version exacte), electron-builder, @electron/rebuild, electronmon
    └── shared/               code partagé entre le serveur et le client
```

## Démarrer une app : `start(options)`

```js
require("adc-core").start({
  appRoot: path.resolve(__dirname),
  clientDist: path.join(__dirname, "client", "dist"),
  defaultContent: path.join(__dirname, "content"),
  electron: { about: "…" },                  // optionnel : texte « À propos », backgroundColor
  content: { acceptLegacyDodocVersion: "10" },    // optionnel, voir « Format du contenu »
  // views: path.join(__dirname, "views"),        // optionnel, surcharge index.pug / perf.pug
});
```

- Les templates `index.pug` et `perf.pug` sont dans adc-core (`server/views`). Une app peut en fournir sa propre version dans un dossier passé en `views`, qui est consulté en premier. `index.pug` suppose que le build du client produit `build.js` (module ES) et `bundle.js` (script unique, inclus dans l'export HTML autonome), qui se montent sur `#app` et lisent `window.app_infos`. Le reste (polices, icônes…) est chargé par le client lui-même.

- Le core lit lui-même dans `appRoot` : `appInfos` (`name`, `productName`, `version`) depuis `package.json`, et les settings depuis `settings_base.json`, surchargé par `settings.json` s'il existe. Un `settings.json` au JSON invalide arrête l'app avec un message d'erreur. On peut passer `appInfos` ou `settings` à `start()` pour remplacer ces valeurs.
- `appInfos.name` sert d'identifiant technique : dossier de contenu par défaut, identifiant de format. `appInfos.productName` est le nom montré aux utilisateurs : messages, e-mails, Bonjour.
- `start()` vérifie d'abord la version de Node ou d'Electron, puis la présence des options obligatoires. Il pose ensuite les globals (`global.settings`, `global.appInfos`…), qui restent internes au core pour l'instant.
- Il n'y a **qu'un seul point d'entrée** pour les deux modes, le `main` du `package.json` (`index.js`). C'est le binaire qui lance l'app qui choisit le mode : `node .` ou `electron .` (via `adc-electron start`). adc-core le détecte grâce à `process.versions.electron`, et charge alors son propre processus principal (`electron/main.js`).

## Installer : la racine ne contient que l'exécution

Le `package.json` racine d'une app ne déclare **que ce qui sert à faire tourner le serveur** : adc-core, et rien d'autre pour do•doc. Les outils de build (Vite, Vitest, plugins…) sont dans `client/package.json`, et Electron dans le `electron/package.json` d'adc-core.

Comme les releases livrent le client déjà buildé (`client/dist`), un utilisateur qui veut seulement utiliser l'app fait, comme il en a l'habitude :

```sh
npm install
npm start
```

- **Règle : les `devDependencies` racine restent vides.** Les outils de développement vont là où ils servent : `client/package.json` (Vite, tests), `adc-core/electron/package.json` (Electron), ou un futur `tools/`. Un `npm install` à la racine équivaut alors à `npm install --omit=dev`, et la doc diffusée aux utilisateurs n'a jamais à changer. Le workflow Headless install le vérifie.
- **Si une devDependency doit un jour aller à la racine** : ajouter `omit=dev` dans le `.npmrc` du repo. Un `npm install` tout court la saute alors, et les développeurs font `npm install --include=dev`.
- **Docker et la CI** font `npm ci --omit=dev`. `npm ci` installe exactement le lockfile, sans jamais le modifier, et échoue s'il ne correspond pas au `package.json`. Les builds sont ainsi reproductibles. Ce n'est pas utile aux utilisateurs : `npm ci` réinstalle tout `node_modules` à chaque fois, ce qui est lent sur un Pi, alors que `npm install` suit déjà le lockfile.

## Client : libre, avec une voie recommandée

Le contrat entre une app et adc-core, c'est **l'API du serveur** : routes REST, sockets, sharedb pour l'édition collaborative, fichiers servis. Le client est libre :
- une app peut avoir un client en n'importe quel framework (React, Svelte…), ou une simple page HTML, et ne parler qu'à l'API ;
- ou elle suit le framework recommandé, **Vue 3**, et importe les composants partagés dont elle a besoin.

Direction envisagée, pas encore décidée : séparer le côté client en packages optionnels, distincts du serveur.

```
adc-core      serveur — obligatoire           installé par le package.json racine
adc-client    JS sans framework — optionnel   API REST, sockets, auth, sharedb, présence
adc-vue       composants Vue 3 — optionnel    champs, médias, capture, éditeur, modales… ; dépend de adc-client
```

- `client/package.json` installe `adc-client` et/ou `adc-vue`, ainsi que Vite. La racine installe `adc-core`. Aucune des deux n'installe les dépendances de l'autre : pas de sharp, puppeteer ni ffmpeg côté client, pas de Vite côté serveur.
- npm ne sait pas installer un sous-dossier d'un repo git. Tant qu'on n'est pas sur npm, il faut donc un repo par package, ou un repo commun pour `adc-client` et `adc-vue`. Une fois sur npm, un seul monorepo pourra publier chaque package séparément.
- Le code partagé entre le serveur et le client (`adc-core/shared`, par exemple l'imposition de livret) devra être accessible aux deux, soit par copie, soit dans `adc-client`. C'est à trancher au moment du découpage.

## Electron : géré par adc-core, installé seulement quand on en a besoin

Toute la logique Electron est dans adc-core : processus principal (fenêtres, menus, dialogues du dossier de contenu, captures et PDF), version d'Electron, installation, lancement et packaging. L'app ne garde que son identité desktop : `electron/electron-builder.yml` et `electron/build/`.

Un serveur (VPS, Raspberry Pi, Docker) ne doit **jamais** télécharger Electron.

**Une app sans `electron/electron-builder.yml` n'a pas de version desktop.** Le job `electron` du workflow Build/release ne tourne pas, `adc-electron` refuse de s'exécuter et `check-versions.js` saute la vérification de ce fichier. Attention : c'est electron-builder qui crée la release GitHub. Sans version desktop, un tag ne publie que l'image Docker, sans release GitHub.

- `electron`, `electron-builder`, `@electron/rebuild` et `electronmon` sont déclarés **uniquement** dans le `electron/package.json` d'adc-core. Ce n'est ni une dépendance ni un workspace : npm ne l'installe jamais tout seul.
- `adc-electron install` l'installe à sa place, dans `node_modules/adc-core/electron/node_modules`, puis recompile les modules natifs de l'app pour cet Electron. Le packaging exclut ce dossier. Comme il est dans `node_modules/adc-core`, un `npm ci` ou une mise à jour d'adc-core l'efface : il faut relancer `npm run install:electron`.
- adc-core ne dépend pas du package `electron` à l'exécution. Dans le processus principal d'Electron, `require("electron")` est un module intégré, qui fonctionne depuis n'importe quel fichier sans package npm. Tout appel à `require("electron")` dans le core se fait derrière `if (global.is_electron)`, jamais au chargement d'un module.
- `electron-store` est dans les dépendances d'adc-core. C'est du JS pur. Son nom de stockage est `appInfos.name`, pour que les installations existantes gardent leur dossier de contenu personnalisé.

### La commande `adc-electron`

Un `bin` d'adc-core, lancé depuis la racine de l'app par ses scripts npm :

| Script de l'app | Commande | Rôle |
|---|---|---|
| `install:electron` | `adc-electron install` | installe Electron et ses outils, recompile les modules natifs |
| `electron`, `electron:debug`… | `adc-electron start [flags] [-- args]` | lance l'app, par ex. `start --inspect=5858 -- --debug` |
| `electron:debug-lr` | `adc-electron watch [flags] [-- args]` | idem, relancé à chaque modification (electronmon, sauf `client/`) |
| `electron:pack`, `electron:dist`… | `adc-electron dist [args electron-builder]` | package avec `electron/electron-builder.yml`, sortie dans `electron/dist` |

`dist` passe à electron-builder `--projectDir` (la racine de l'app), `--config electron/electron-builder.yml` et la version d'Electron d'adc-core. Le fichier de l'app commence par `extends: node_modules/adc-core/electron/builder.base.yml`, qui apporte `asar`, `asarUnpack`, `files` et les dossiers. Les listes `files` sont fusionnées, les autres clés de l'app remplacent celles de la base. Les chemins sont relatifs à la racine de l'app. La version de l'app vient de son `package.json` : il n'y a plus de version à synchroniser.

| Contexte | Installation | Lancement |
|---|---|---|
| Utilisation, serveur (VPS, Pi) | `npm install` | `npm start` |
| Docker, CI | `npm ci --omit=dev` | `npm start` |
| Développement web | `npm install`, puis `npm install --prefix client` | `npm run debug`, et `npm run dev --prefix client` |
| App desktop | `npm install` puis `npm run install:electron` | `npm run electron` |

À ne jamais faire :
- ajouter `electron` aux `dependencies`, `devDependencies` ou `optionalDependencies` de l'app ou d'adc-core (npm installe les optionnelles par défaut) ;
- l'ajouter aux `peerDependencies` d'adc-core (npm ≥ 7 installe les peers automatiquement) ;
- déclarer `node_modules/adc-core/electron` comme workspace ;
- lancer `adc-electron install` depuis un `postinstall`.

Ce qui le vérifie :
- le workflow [Headless install](../.github/workflows/headless-install.yml) installe avec `--omit=dev`, échoue si `node_modules/electron` ou `node_modules/adc-core/electron/node_modules` existe, et charge tout le serveur sans Electron ;
- le `Dockerfile` vérifie la même chose pendant le build.

Puppeteer ne sert qu'en mode Node : sous Electron, les captures et les PDF passent par des fenêtres Electron, et le packaging exclut puppeteer. `require("./puppeteer")` se fait donc toujours derrière `!global.is_electron`. Sur un serveur qui a déjà Chromium, on pose `PUPPETEER_SKIP_DOWNLOAD=true` **avant** l'installation et `PUPPETEER_EXECUTABLE_PATH` au lancement, comme dans le `Dockerfile`.

## Versions de Node et d'Electron

- **adc-core** fixe :
  - une **plage** pour Node, `engines.node` (`>=24.22.0 <25`) ;
  - la **version exacte** d'Electron, dans `electron/package.json` (`"electron": "44.9.0"`, sans `^`). C'est la seule source : `adc-electron install` l'installe, `adc-electron dist` la passe à electron-builder. Une app ne choisit pas sa version d'Electron.
- **L'app** fixe Node exactement : `.nvmrc` et l'image Docker. Les `engines` de l'app restent une plage (`^24.22.0`), pour qu'un serveur puisse installer un correctif de sécurité de Node sans attendre une release.
- **`scripts/check-versions.js`** vérifie que tout concorde : `.nvmrc`, Dockerfile, plages d'adc-core et de l'app, version exacte d'Electron dans adc-core, absence d'`electronVersion` dans le `electron-builder.yml` de l'app. Si Electron est installé, il vérifie aussi que le Node qu'il embarque est celui du `.nvmrc`. Il tourne dans les workflows Headless install et Build/release.
- **Règle d'alignement** : la version majeure de Node de l'app est celle du Node embarqué dans l'Electron d'adc-core. On les monte ensemble : d'abord adc-core, ensuite chaque app.
- **Vérification au démarrage** (`server/runtime-check.js`, sans dépendance) : en mode Node, elle compare `process.versions.node` à `engines.node`. Sous Electron, elle compare `process.versions.electron` à la version d'adc-core et affiche une fenêtre d'erreur en cas d'écart.
- Les modules natifs (sharp, bufferutil) utilisent N-API. Le même binaire fonctionne sous Node et sous Electron. `adc-electron install` les recompile quand même avec `@electron/rebuild`, comme le faisait `electron-builder install-app-deps`.

## Format du contenu : `$content_app` et `$content_version`

Chaque dossier de contenu déclare, dans le `meta.txt` à sa racine, quelle app l'a créé et dans quel format :

```toml
"$content_app" = "dodoc"
"$content_version" = "10"
```

- **Une seule source de vérité.** La valeur attendue est lue dans le `content/meta.txt` de l'app, celui qui est copié dans chaque nouveau dossier. Si `$content_app` n'y est pas, le core utilise `appInfos.name`. Pour changer de format, on modifie ce fichier.
- **Au démarrage**, le dossier est classé dans l'un de ces trois cas (`server/content-folder.js`) :
  - **vide** : on y copie le contenu par défaut, puis on marque le dossier ;
  - **valide** : même app et même version ;
  - **incompatible** : tout le reste. On n'y écrit **jamais**. Le refus indique ce qui a été trouvé, par exemple « ce dossier a été créé par slashdoc (format 10) ». Sous Electron, l'utilisateur peut choisir un autre dossier ou revenir au dossier par défaut. En mode Node, l'app s'arrête avec un message qui explique comment corriger `contentPath`.
- **Le préfixe `$`** signale une clé système. Ces clés ne sont pas dans le schéma, donc `updateFolder` (les réglages admin) ne peut pas les modifier : il ne fusionne que les champs du schéma et conserve les autres.

### Dossiers créés avant `$content_app`

do•doc et tous ses forks actuels écrivaient seulement `dodoc_version="10"`, et on ne peut donc pas savoir de quelle app vient un tel dossier.

- Une app accepte ces anciens dossiers seulement si elle le déclare : `start({ content: { acceptLegacyDodocVersion: "10" } })`.
- Un dossier adopté de cette façon reçoit `$content_app` et `$content_version` au premier démarrage. `dodoc_version` y est conservé, pour que les versions déjà publiées puissent encore l'ouvrir. À partir de là, il appartient à cette app, et les autres le refusent.
- Le `content/meta.txt` de do•doc et de ses forks **garde `dodoc_version="10"`**, avec un commentaire qui explique pourquoi. Le core ne le lit plus pour les nouveaux dossiers, mais la clé les protège des versions déjà publiées. Sans elle, un do•doc ≤ 14.0.7 (le comportement d'avant `d112c22dc`) croirait le dossier inexistant et copierait le contenu par défaut par-dessus, en écrasant entre autres le `meta.txt` racine. On pourra la retirer à une version majeure, quand plus personne n'ouvrira de dossier avec une 14.0.x.
- Un ancien dossier appartient à la première app qui l'adopte. Si slashdoc est configuré sur `Documents/dodoc`, il prend ce dossier, et do•doc le refusera ensuite. Ce cas reste rare, puisque chaque app a son propre `contentPath` par défaut.

### Pour chaque app

| App | `contentPath` actuel | `content/meta.txt` | `acceptLegacyDodocVersion` |
|---|---|---|---|
| do•doc | `dodoc` | `$content_app = "dodoc"`, `$content_version = "10"`, en gardant `dodoc_version = "10"` | `"10"` |
| slashdoc | `slashdoc` | ajouter `$content_app = "slashdoc"`, `$content_version = "10"`, en gardant `dodoc_version = "10"` | `"10"` |
| SoftGems | `softgems_content` | ajouter `$content_app = "softgems"`, `$content_version = "10"`, en gardant `dodoc_version = "10"` | `"10"` |
| Living Archive | `SLASH` | ajouter `$content_app = "living-archive"`, `$content_version = "10"`, en gardant `dodoc_version = "10"` | `"10"` |
| Les Cahiers v3 | à choisir, **différent** de `les-cahiers` (v2) | `$content_app = "cahiers"`, `$content_version = "3"`, sans `dodoc_version` | aucun |

- Écrire `$content_app` explicitement dans le `meta.txt` par défaut, sans compter sur `appInfos.name` : sinon, renommer un jour le `package.json` rendrait tous les dossiers existants incompatibles.
- Les Cahiers v2 stockent leur contenu dans `~/Documents/les-cahiers`, sans `meta.txt` racine. Les v3 le refusent, ce qui le protège. La reprise des contenus v2 passera par un outil d'import.
- Pour changer de format (par exemple 10 → 11), on incrémente `$content_version`. Tant qu'il n'existe pas de point de migration (`accept` ou `migrate`, voir « À faire »), les dossiers à l'ancien format sont refusés.

## Distribution d'adc-core

- adc-core **n'est pas publié sur npm** pendant la phase 0.x. Les apps l'installent depuis GitHub, avec des plages semver sur les tags git :
  ```json
  "adc-core": "git+https://github.com/l-atelier-des-chercheurs/adc-core.git#semver:^0.2.0"
  ```
- npm écrit quand même une URL `git+ssh://` dans le lockfile. Ce n'est pas gênant tant que le repo est public : `npm ci` télécharge le tarball du commit en HTTPS, sans clé SSH ni `git` (vérifié). `git` sert seulement à résoudre la plage (`npm install` sans lockfile, `npm update`). Le `Dockerfile` l'installe quand même dans l'étape de build, par précaution ;
- le lockfile de l'app fixe le commit exact : `npm install` ne passe à un tag plus récent de la plage que si on le demande (`npm update adc-core`) ;
- pour publier une version : changer `version` dans le `package.json` d'adc-core, compléter le CHANGELOG, taguer (`v0.2.0`) et pousser avec `--follow-tags`. Dans chaque app, ensuite :
  - pour un correctif (`0.2.0` → `0.2.1`) : `npm update adc-core`, la plage `^0.2.0` le couvre ;
  - pour une nouvelle version mineure (`0.2.x` → `0.3.0`) : en 0.x, `^0.2.0` veut dire `>=0.2.0 <0.3.0`, et `npm update` ne la prend donc pas. Il faut changer la plage : `npm install "adc-core@git+https://github.com/l-atelier-des-chercheurs/adc-core.git#semver:^0.3.0"`. npm réécrit alors la dépendance en `github:…` dans le `package.json` : remettre la forme `git+https://` ci-dessus, puis relancer `npm install` ;
  - commiter le `package.json` et le lockfile ;
- **pas d'étape de build, ni de `postinstall` ou `prepare`** dans le package : le serveur est en JS Node, et les futurs packages client seront livrés en sources `.vue` et `.js`, compilées par le Vite de chaque app. Les apps n'ont pas non plus de `postinstall` : depuis adc-core 0.2.0, ffprobe ne télécharge que le binaire de la plateforme courante ;
- **on ne déplace jamais un tag publié** ;
- un CHANGELOG est obligatoire ;
- en développement, on utilise `npm link` ou `file:../adc-core`, et la CI refuse les dépendances `file:` ;
- on passera à npm à la 1.0, ou si quelqu'un d'extérieur veut s'en servir. Le nom scopé est à fixer avant (le repo local `adc-core` de 2022 s'appelle `@adc-core/adc-core`).

## Créer une nouvelle app, ou migrer un fork existant

1. Partir de la structure ci-dessus. `electron/` ne contient que `electron-builder.yml` (copié de do•doc, en changeant l'identité) et `build/`.
2. Renseigner `name` et `productName` dans `package.json`, et `contentPath` dans `settings_base.json`. Ce dernier doit être différent des autres apps.
3. Dans `content/meta.txt` : `$content_app` et `$content_version`. Un fork de do•doc garde aussi `dodoc_version="10"` ; une app nouvelle, comme les Cahiers, ne le met pas.
4. Dans `index.js` : appeler `start()`. Ajouter `content.acceptLegacyDodocVersion` seulement s'il existe des dossiers d'avant `$content_app` à reprendre.
5. Fixer Node dans `.nvmrc`, dans la plage d'adc-core et sur le Node embarqué par son Electron. Reprendre les scripts `install:electron` et `electron*` de do•doc, et passer le texte « À propos » dans `start({ electron: { about } })`.
6. Supprimer tout le code serveur copié de dodoc : il vient maintenant d'adc-core.
7. Vérifier `npm install && npm start` sur un clone propre, puis le desktop avec `npm run install:electron && npm run electron`.

## À faire

- **Client** : `client/src/adc-core` est encore dans dodoc, et en Vue 2. On le découpera **après** la migration Vue 3 (voir `docs/V14-vue3-migration-plan.md`), en suivant la direction `adc-client` / `adc-vue` décrite plus haut, et en appliquant la règle de la deuxième app. `client/package.json` reste un package séparé de la racine.
- **Prototype jetable des Cahiers v3** branché sur adc-core, pour trouver les points d'extension qui manquent avant de figer la 1.0 : dates de médias modifiables, routes en plus, composants à remplacer.
- **Électron par app** : le menu est encore en français uniquement, et l'icône de fenêtre est cherchée dans `electron/build/icon.png`. Ajouter des options quand une deuxième app en aura besoin.
- **Migration de format** : option `accept` (liste de versions) ou fonction `migrate` dans `content`, le jour où on en aura besoin.
- **npm et les scripts d'installation** : npm 11.19 avertit que les scripts d'installation de six dépendances ne sont pas encore approuvés (`allowScripts`) : @derhuerst/ffprobe-static, bufferutil, fast-folder-size, ffmpeg-static, puppeteer, sharp. Pour l'instant, les scripts s'exécutent quand même (vérifié avec ffmpeg-static et @derhuerst/ffprobe-static). Si une future version de npm les bloque par défaut, ffmpeg, ffprobe et Chrome ne seront plus téléchargés. Il faudra alors les approuver dans le repo, sans demander d'étape en plus aux utilisateurs.
- Le mot de passe admin par défaut est encore `"dodoc"` pour toutes les apps (`DEFAULT_ADMIN_PASSWORD` dans `server/api2.js`). Il faudrait qu'il vienne des settings ou de `appInfos.name`.
