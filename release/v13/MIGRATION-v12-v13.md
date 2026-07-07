# Migration do•doc 12 → 13

Guide pour les administrateurs et développeurs qui passent de do•doc **12** à **13** (version stable sur la branche **main**).

**Page officielle de téléchargement :** [dodoc.fr/installer](https://dodoc.fr/installer) — dernière version stable **13.0.41** au moment de la rédaction.

## En bref

- **Contenus existants** : compatibles. Le dossier de données (`contentPath`, par défaut `dodoc` dans Documents) est lu tel quel — pas de migration de fichiers nécessaire.
- **Branche Git** : **main** est la branche stable unifiée (Electron + serveur) depuis la v13.
- **Node.js** : v13 requiert **Node 24.14.0** (v12 utilisait Node 22).
- **Interface** : refonte majeure autour de panneaux projet (Capter, Collecter, Fabriquer, Publier, Tâches, Discussions).

---

## Application de bureau (Electron)

### Mise à jour simple

1. Télécharger la dernière release stable v13 depuis [dodoc.fr/installer](https://dodoc.fr/installer) (détection automatique du système) ou choisir manuellement la plateforme ci-dessous.
2. Installer par-dessus ou à côté de v12.
3. Au premier lancement, do•doc retrouve automatiquement le dossier de contenu existant.

Les fichiers sont aussi disponibles sur [GitHub Releases](https://github.com/l-atelier-des-chercheurs/dodoc/releases/latest).

| Plateforme                | Fichier (ex. v13.0.41)          |
| ------------------------- | ------------------------------- |
| Windows                   | `dodoc-13.0.41-windows.exe`     |
| macOS Intel (x64)         | `dodoc-13.0.41-macos-intel.dmg` |
| macOS Apple Silicon (ARM) | `dodoc-13.0.41-macos-arm.dmg`   |
| Linux (AppImage x64)      | `dodoc-13.0.41-x86_64.AppImage` |
| Linux (AppImage arm64)    | `dodoc-13.0.41-arm64.AppImage`  |
| Primtux / Debian amd64    | `dodoc-13.0.41-amd64.deb`       |
| Debian ARM64              | `dodoc-13.0.41-arm64.deb`       |
| Raspberry Pi (armv7l)     | `dodoc-13.0.41-armv7l.AppImage` |

Des tutoriels pas à pas par système (Windows, Mac, Linux…) sont disponibles sur la même page [dodoc.fr/installer](https://dodoc.fr/installer).

### Windows

Si Windows bloque l’installation (SmartScreen) :

1. Ouvrir le fichier `.exe` téléchargé.
2. Cliquer sur **Informations complémentaires**.
3. Cliquer sur **Exécuter quand même** pour terminer l’installation.

### macOS

Deux installateurs sont publiés — choisir celui qui correspond à votre Mac :

| Fichier                   | Pour                                                     |
| ------------------------- | -------------------------------------------------------- |
| `dodoc-*-macos-arm.dmg`   | **Apple Silicon** (puce M1, M2, M3, M4, …)               |
| `dodoc-*-macos-intel.dmg` | Mac **Intel** (x86_64, en général antérieurs à fin 2020) |

Pas sûr ? **Pomme → À propos de ce Mac** : une ligne **Puce** indique Apple Silicon (`arm`) ; une ligne **Processeur** (ex. « Intel Core i5 ») indique Intel. Sur Apple Silicon, le build ARM est recommandé (natif) ; le build Intel peut tourner via Rosetta mais est plus lent. Un Mac Intel **ne peut pas** exécuter le build ARM.

Si l’application ne s’ouvre pas à cause de la quarantaine, voir le sujet forum dédié ou : clic droit → Ouvrir.

### Linux

**AppImage** (x64, arm64, Raspberry Pi armv7l) : rendre le fichier exécutable, puis le lancer.

Sur Ubuntu 24.04+, si l’AppImage ne démarre pas :

```bash
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

**Paquets `.deb`** (Primtux, Debian amd64 / ARM64) : double-clic ou `sudo dpkg -i dodoc-*.deb`.

Les processeurs très anciens (ex. Core2Duo, sans microarchitecture v2) ne sont plus supportés par Electron/sharp.

---

## Serveur / VPS / développement

### Installation serveur (recommandé)

Pour rendre do•doc accessible depuis le web (VPS, serveur dédié…), suivre le tutoriel pas à pas maintenu par la communauté :

**→ [Installer do•doc en ligne sur le forum](https://forum.latelier-des-chercheurs.fr/t/installer-do-doc-en-ligne/210)**

Cette procédure couvre l’installation manuelle (git, nvm, npm, pm2, NGINX, certificat SSL…). Elle demande des manipulations techniques. Si vous souhaitez uniquement mettre des contenus en ligne pour consultation, des solutions plus simples existent — voir le forum pour les alternatives.

### Depuis une install Git v12 (`main-node` ou ancienne `main`)

```bash
git fetch
git checkout main
git pull
nvm install              # lit .nvmrc → 24.14.0
nvm use
npm install
npm start
```

Pour Electron en dev :

```bash
npm install
cd electron && npm install && npm start
```

Tutoriel développement : [Installer do•doc en mode développement](https://forum.latelier-des-chercheurs.fr/t/installer-do-doc-en-mode-developpement/426).

### Docker

Nouveau en v13 :

```bash
docker compose up -d
# puis https://localhost:8080
```

Image : `ghcr.io/l-atelier-des-chercheurs/dodoc:latest` (ou un tag de version précis, ex. `13.0.41`).

### YunoHost

do•doc est disponible dans le catalogue YunoHost : [apps.yunohost.org/app/dodoc](https://apps.yunohost.org/app/dodoc).

- **Première installation** : via l’interface admin YunoHost (rechercher « dodoc ») ou en CLI.
- **Mise à jour depuis v12** : `sudo yunohost app upgrade dodoc` (ou `-u https://github.com/YunoHost-Apps/dodoc_ynh/tree/testing` si la version stable du paquet n’est pas encore publiée).
- Préférer un sous-domaine dédié (ex. `dodoc.mondomaine.fr`).
- Tutoriel pas à pas : [Installer dodoc avec YunoHost](https://forum.latelier-des-chercheurs.fr/t/intastaller-dodoc-avec-yunohost-methode-la-moins-geek/561).

En cas de souci après mise à jour, vérifier que `settings.json` et le chemin `contentPath` sont inchangés.

---

## Fichier `settings.json`

Vos réglages personnalisés sont conservés. Quelques valeurs par défaut ont changé dans `settings_base.json` :

| Paramètre              | v12                  | v13                    |
| ---------------------- | -------------------- | ---------------------- |
| `tokenIsValidForXDays` | 60                   | 30                     |
| Branches Git           | `main` / `main-node` | branche unifiée `main` |

Nouveaux types / champs dans le schéma (ajoutés automatiquement pour les nouveaux contenus) :

- Panneau **Tâches** (`notes_todo`) dans les projets
- **Discussions** (`chats`) liées aux projets
- Champs publication : `blur`, `row_count`, `grid_areas`, `number_of_book_pages`, etc.
- Métadonnée fichier `$processing` remplace `$optimized`

Aucune action requise si vous n’utilisez pas ces fonctionnalités.

---

## HTTPS en développement local

v13 s’appuie davantage sur HTTPS (WebSockets, caméra, géolocalisation). Pour un certificat de confiance locale :

```bash
brew install mkcert   # macOS
mkcert -install
npm run setup-https
```

Puis redémarrer et ouvrir `https://localhost:8080`.

---

## Ce qui change côté utilisateur

- **Accueil** : projets récents, événements, vue médias.
- **Projet** : barre de panneaux (Capter → Collecter → Fabriquer → Publier, plus Tâches et Discussions).
- **Publications** : édition multisupport enrichie, cartographie, export PDF/page web améliorés.
- **Fabriquer** : nouvelles recettes (flou, import ressources, etc.).
- **API** : téléchargement par type de dossier (`/_api2/spaces.zip`, etc.) — voir README.

---

## Retour arrière

- **Desktop** : sur [dodoc.fr/installer](https://dodoc.fr/installer), cliquer sur **Récupérer une version plus ancienne** pour télécharger do•doc 12, ou depuis [GitHub Releases v12.0.27](https://github.com/l-atelier-des-chercheurs/dodoc/releases/tag/v12.0.27) (dernière release v12).
- **Serveur** : `git checkout main-node` (ou le tag `v12.0.27`) + Node 22 + `npm install`.
- Les contenus créés en v13 restent lisibles en v12 (format fichiers identique).

---

## Signaler un problème

- Forum (installation, configuration, mise en ligne) : https://forum.latelier-des-chercheurs.fr/
- GitHub (bugs, contributions) : https://github.com/l-atelier-des-chercheurs/dodoc/issues
