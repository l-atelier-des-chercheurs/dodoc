# Migration do•doc 12 → 13

Guide pour les administrateurs et développeurs qui passent de la branche **main** (v12) à **next** / future **main** (v13).

## En bref

- **Contenus existants** : compatibles. Le dossier de données (`contentPath`, par défaut `dodoc` dans Documents) est lu tel quel — pas de migration de fichiers nécessaire.
- **Branche Git** : une seule branche unifiée (`next`, puis `main`) remplace `main` + `main-node`.
- **Node.js** : v13 requiert **Node 24.14.0** (v12 utilisait Node 22).
- **Interface** : refonte majeure autour de panneaux projet (Capter, Collecter, Fabriquer, Publier, Tâches, Discussions).

---

## Application de bureau (Electron)

### Mise à jour simple

1. Télécharger la dernière bêta v13 depuis [GitHub Releases](https://github.com/l-atelier-des-chercheurs/dodoc/releases) (pre-release).
2. Installer par-dessus ou à côté de v12.
3. Au premier lancement, do•doc retrouve automatiquement le dossier de contenu existant.

Fichiers publiés par CI (noms réels, version **13.0.35** ou tag bêta courant) :

| Plateforme | Fichier |
|------------|---------|
| macOS | `dodoc-13.0.35-macos.dmg` |
| Windows | `dodoc-13.0.35-windows.exe` |
| Linux (AppImage x64) | `dodoc-13.0.35-x86_64.AppImage` |
| Linux (AppImage arm64) | `dodoc-13.0.35-arm64.AppImage` |

### macOS

Si l’application ne s’ouvre pas à cause de la quarantaine, voir le sujet forum dédié ou : clic droit → Ouvrir.

### Linux (AppImage)

Sur Ubuntu 24.04+, si l’AppImage ne démarre pas :

```bash
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

Les processeurs très anciens (ex. Core2Duo, sans microarchitecture v2) ne sont plus supportés par Electron/sharp.

---

## Serveur / VPS / développement

### Depuis une install Git v12 (`main-node` ou `main`)

```bash
git fetch
git checkout next        # bêta v13 — deviendra main à la sortie officielle
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

### Docker

Nouveau en v13 :

```bash
docker compose up -d
# puis https://localhost:8080
```

Image : `ghcr.io/l-atelier-des-chercheurs/dodoc:13.0.35` (ou le tag de la bêta courante ; `:latest` une fois la release stable publiée).

### YunoHost / hébergement packagé

- Mettre à jour la version de Node vers **24.14.0**.
- Suivre la procédure du package YunoHost une fois la version 13 publiée.
- En cas de souci après mise à jour, vérifier que `settings.json` et le chemin `contentPath` sont inchangés.

---

## Fichier `settings.json`

Vos réglages personnalisés sont conservés. Quelques valeurs par défaut ont changé dans `settings_base.json` :

| Paramètre | v12 | v13 |
|-----------|-----|-----|
| `tokenIsValidForXDays` | 60 | 30 |
| Branches Git | `main` / `main-node` | branche unifiée |

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

- **Desktop** : réinstaller do•doc 12 depuis [GitHub Releases](https://github.com/l-atelier-des-chercheurs/dodoc/releases/latest).
- **Serveur** : `git checkout main-node` (ou `main`) + Node 22 + `npm install`.
- Les contenus créés en v13 restent lisibles en v12 (format fichiers identique).

---

## Signaler un problème

- GitHub : https://github.com/l-atelier-des-chercheurs/dodoc/issues
- Forum : https://forum.latelier-des-chercheurs.fr/
