![do•doc logo](/client/public/images/i_logo.svg)

# do•doc

do•doc (or dodoc) is a documentation tool, first designed for use in classrooms with children. It is a platform connected to a physical device that operates a camera and a microphone, and enables one to capture traces from an on-going experience for later reflections, reconstructions and creation of narratives.<br>
do•doc is made by [l'atelier des chercheurs](http://latelier-des-chercheurs.fr/) (Sarah Garcin, Pauline Gourlet & Louis Eveillard).<br>

More information:

- in english: https://latelier-des-chercheurs.fr/en/tools/dodoc
- en Français : https://latelier-des-chercheurs.fr/outils/dodoc

And on the forum (mainly in French but you can post in English):

https://forum.latelier-des-chercheurs.fr/

# License

do•doc is free and open source.
The code is licensed under AGPLv3, and the graphic assets (icons, pictograms, user interface) are under a CC-BY-SA license.

The font [Luciole](http://www.luciole-vision.com/) is licensed under the Creative Commons Attribution 4.0 and embedded with permission from Laurent Bourcellier and Jonathan Fabreguettes.
The font [Belle Allure](https://www.jeanboyault.fr/belle-allure/) is used with permission from Jean Boyault.

# Install do•doc

### Method 1 — the easy way

Download the latest release from the [release page](https://github.com/l-atelier-des-chercheurs/dodoc/releases).

### Method 2 — the long way

_You need [node.js version 16.14.2](https://nodejs.org/download/release/v16.14.2/) and [python 2.7](https://www.python.org/) to install this app with this method. On Windows, you also need to install Microsoft’s Windows Build Tools by following the instructions [here](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#prerequisites)._

#### 1. Download this repository

Click on _Clone or Download_ in the top right corner of this page, then _Download ZIP_. Unpack this folder.

#### 2. Open a terminal window

Open a terminal window:

- Windows: (XP) use [this tutorial](http://wikistrea.fr/Comment_ouvrir_la_console_de_commande_Windows_en_mode_administrateur_%3F) to open a terminal on Windows or open Command Prompt in the start menu
- macOS: go to Applications -> Utilities -> Terminal
- Linux: use a terminal app such as Terminal or Konsole

In your terminal, navigate to the dodoc-master folder with your terminal using the `cd` command:

```
cd path/to/dodoc-master
```

#### 3. Install dependencies

If you haven’t already, install the tool that will enable native modules to be used. To do this, follow the instructions here: https://github.com/nodejs/node-gyp

Then, install _do•doc_’s dependencies (may take up to 5 minutes):

```
npm install
```

#### 4. Run do•doc

Start from the folder in a terminal window with the following command:

```
npm start
```

#### Troubleshooting

Most install errors (and especially the _Module version mismatch._) are due to native packages such as [sharp](https://github.com/lovell/sharp), a powerful image manipulation library.

**The first thing to check is whether you use the right version of node.js: it must be version 16.14.2.
To know the version you are running, write `node -v` in a terminal window.**

The reason you have to use this version of node.js is because this app uses Electron, a tool to package node.js and a webbrowser as native apps. The version of Electron this app is using is version 19.0.4, and it uses node version 16.14.2. However, when native modules are built, they are built using the local node version and not Electron’s. Hence, you have to run the exact same version as Electron to prevent this type of error to happen.

Because switching between node version is annoying, it is recommended to use [nvm](https://github.com/creationix/nvm) to do so ([nvm windows](https://github.com/coreybutler/nvm-windows) for Windows).

Here are a few other things you can try (but only after making sure you run the right node version):

1.  Sometimes, Electron is not installed when running `npm install` on the repo. It may help to run `npm install electron@2.0.5` just to be sure it is actually installed locally.

1.  Follow the instructions [here](https://github.com/electron/electron/blob/master/docs/tutorial/using-native-node-modules.md), and specifically:

```
# Electron's version.
export npm_config_target=19.0.4
# The architecture of Electron, can be ia32 or x64.
export npm_config_arch=arm64
export npm_config_target_arch=arm64
# Download headers for Electron.
export npm_config_disturl=https://atom.io/download/electron
# Tell node-pre-gyp that we are building for Electron.
export npm_config_runtime=electron
# Tell node-pre-gyp to build module from source code.
export npm_config_build_from_source=true
# Install all dependencies, and store cache to ~/.electron-gyp.
HOME=~/.electron-gyp npm install
```

3.  electron-builder (which builds electron to an app) embeds a script that rebuilds dependencies according to electron. To use it, write:

```
./node_modules/.bin/electron-builder install-app-deps
```

4. use electron-rebuilt as well

```
./node_modules/.bin/electron-rebuild
```

**sharp on ubuntu**

It seems the dependency sharp cannot be built easily on Ubuntu. Install an older version to fix this:

```
npm install sharp@0.17.3
```

# Tweak, fork and debug

### server-side

- Run `npm run debug` to start the server with a better debug in terminal

### client-side

The client-side code is in the `public` folder. To write some new CSS or client-side JS, you need to run the following tasks:

```
npm run install
```

and then, to start the dev tasks:

```
npm run dev
```

To build for production, use

```
npm run build
```

This will create minified JS files in the `public/dist` folder.

---

# How the core works

Everything is structured in folders/files, so as to mirror the content in the filesystem. No database is used, almost all the content are saved in the content folder (by default /Documents/dodoc_next).

Folders contain a meta.txt file and media files (images, videos, audios, 3D/stl, texts, or any other kind of files).

## Properties and values

### Folders

Default values are:

- $authors (Array) = list of authors paths, can be edited by users
- $cover (object) = if a meta_cover.jpeg is present in the root of the folder, can be edited by authors
- $date_created (date) = when the folder was created
- $date_modified (date) = when the folder was last edited
- $files (Array) = list of all the files in this folder (see Files below)
- $listed (Boolean) = if the folder is listed when getFolders is called by non-authors, can be edited by authors
- $password (string, stored as hash) = limit editing to users with password, can be edited by authors
- $path (string) = path to folder, matches filesystem structure and URL
- $infos (object) = data gathered from the folder itself
  - size (Number) = size in bytes

Custom values can be defined in the schema property in settings_base.json.

### Files

Each file has default values and custom values as well.
Default values are:

- $path (string) = path to meta text file, matches filesystem structure and URL, can’t be changed
- $date_created (date) = when the file was created
- $date_uploaded (date) = when the file was uploaded
- $date_modified (date) = when the file was last edited
- $media_filename (string) = name of the file
- $type (string) = type of media file among the following: _image, video, audio, stl, text, pdf, other_
- $authors (Array) = list of authors paths, can be edited by users
- $listed (Boolean) = if the file is listed when getFiles is called by non-authors, can be edited by authors
- $thumbs (object) = list of possible media image thumbs
- $content (string) = text content of a file
- $infos (object) = data gathered from the file itself
  - mtimems (date) = last modified time for media file
  - width (Number) = for images
  - height (Number) = for images
  - ratio (Number) = for images
  - size (Number) = size in bytes
  - gps (Object)

Custom values can be defined in the schema property in settings_base.json.

## Status and visibility

Each folder and each file have a "public" property, which defines who can see them:

- by default, it is set to **false** (if it doesnt exist it is considered false as well). In this situation, only authors of the ressource can see it.
- if set to true, anyone can see it

If a folder has a password, then it protects this ressource and its content in the following way:

- if public, only those with the password or corresponding token can edit it
- if not public, only those with the password or token can see and edit it

## Recursivity

Path to ressource is decomposed like this:

`/type-of-ressource/name-of-ressource/type-of-child-ressource/name-of-child-ressource`

For example, with the following schema:

```
{
  "schema": {
    "projects": {
      "$cover": {
        "width": 1200,
        "height": 1200,
        "thumbs": {
          "resolutions": [50, 320, 640, 1200]
        }
      },
      "fields": {
        "title": {
          "type": "string"
        }
      },
      "$files": {
        "thumbs": {
          "resolutions": [180, 360, 1600]
        },
        "fields": {
          "caption": {
            "type": "string"
          }
        }
      },
      "$folders": {
        "publications": {
          "$cover": {
            "width": 1200,
            "height": 1200,
            "thumbs": {
              "resolutions": [50, 320, 640, 1200]
            }
          },
          "fields": {
            "title": {
              "type": "string"
            }
          }
        }
      }
    }
  }
}
```

Then the following routes will redirect to:

- /projects
  --> returns a list of all folders in /projects with their metas

- /projects/bonjour
  --> returns the meta of a single "bonjour" folder with a list of all their files with their metas

- /projects/bonjour/publications
  --> returns a list of all folders in /projects/bonjour/publications with their metas

- /projects/bonjour/publications/first-tutorial
  --> return the meta of a single "first-tutorial" folder with a list of all their files with their metas
