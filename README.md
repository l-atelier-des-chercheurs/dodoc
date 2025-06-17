![do•doc logo](/dodoc_logo.svg)

# do•doc

do•doc (or dodoc) is a free and open-source documentation tool, initially designed for use in classrooms with children. It enables one to capture traces from an on-going experience for later reflections, reconstructions and creation of narratives. A physical device can be associated with the software to simplify usage, especially with young people. Two versions are available: the local app that can be installed for offline use, and the online webapp that can be accessed from any device connected to the Internet.<br><br>

do•doc is created by a variety of people: pupils, teachers, trainers, makers, artists, etc. Anyone is welcome to contribute to its development, on Github or via the forum (contributions can be in English or French): https://forum.latelier-des-chercheurs.fr/<br>
<br>

do•doc was initially created by [l'Atelier des chercheurs](http://latelier-des-chercheurs.fr/) (Sarah Garcin, Pauline Gourlet & Louis Eveillard).<br><br>

More information:

- in English: https://latelier-des-chercheurs.fr/en/tools/dodoc
- en Français : https://latelier-des-chercheurs.fr/outils/dodoc

And on the forum (mainly in French but you can post in English):

https://forum.latelier-des-chercheurs.fr/

# License

do•doc is free and open source.
The code is licensed under AGPLv3, and the graphic assets (icons, pictograms, user interface) are under a CC-BY-SA license.

The font [Luciole](http://www.luciole-vision.com/) is licensed under the Creative Commons Attribution 4.0 and embedded with permission from Laurent Bourcellier and Jonathan Fabreguettes.
The font [Belle Allure](https://www.jeanboyault.fr/belle-allure/) is used with permission from Jean Boyault.

# Branches

- **main** --> default branch, latest stable version (currently v11), in Electron (offline app). See release page for Linux/Mac/Windows installers.
- **main-node** --> latest stable version without Electron, to use on online servers.

- **main-dev** --> fixes and small improvements on top of the current version, in Electron. Used for testing before merging changes to **main**.
- **main-dev-node** --> fixes and small improvements on top of the current version, for servers. Used for testing before merging changes to - **main-node**.

- **next** --> code for the next major version (v11), in Electron. Use at your own risks.
- **next-node** --> code for the next major version, without Electron. Use at your own risks.

Note 1: on Ubuntu up to 24.04, you may need to install the dependency sharp 0.31.3 as the most recent version (0.33.5) is not compatible.

`npm install sharp@0.31.3`

Note 2: bufferutil seems to be necessary specifically for intel macOS.

# Install do•doc

## Method 1 — the easy way

Download the latest release from the [release page](https://github.com/l-atelier-des-chercheurs/dodoc/releases).

## Method 2 — the long way

See https://forum.latelier-des-chercheurs.fr/t/installer-do-doc-en-mode-developpement/426

## Method 3 — the dev way

To install do•doc in dev mode, you need to have Node.js and npm installed. Clone this repository and run the following commands:

```
npm install
```

Available scripts:

- run the app with minimal logging, as fast as possible:

```
npm run start
```

- run the app to debug locally:

```
npm run debug
```

- run the app in debug mode, with client code and vite/hot-module-replacement:

```
npm run debug-lr
```

You need to open a second terminal to run the vite/livereload server:

```
cd client
npm i
npm run dev
```

# After installation

When starting the app for the first time, a message will tell you about an admin account that is created by default. Its password is "dodoc". Connect to this account and change the password by opening that account's page and clicking Options, and editing the password field. It is recommended to open the admin settings afterwards (the gear icon in the top bar) and read/adapt all settings.

More advanced settings are available to all by duplicating the settings.example.json file and renaming it to settings.json. You can override the default settings_base.json values with ones you need:

- set the url where dodoc will be accessed (used for emails sent to users) (for example, https://test.dodoc.fr)

- adapt the port used on startup, useful when hosting multiple dodoc on the same server (possible values: any port not already used, for example 443 or 8000)

- indicate a bonjour domain for local discovery, like dodoc.local

- change the folder used for storing all the user-generated contents by editing the contentPath field.

  - if the value is just a string without any slashes (like "dodoc"), then this will be the name of the folder used in the /Documents subfolder.
  - if the value contains any forward slashes (/) or system path separators, it will be treated as a full path (like /mnt/storage/dodoc-custom)
  - if the specified path is not writable, do•doc will automatically fall back to using a "dodoc" folder in the Documents directory

- if you'd like for dodoc to be able to send email to help users recover their password, fill in the information to a mail server and account with the "mailer" property.

# How the core works

Everything is structured in folders/files, so as to mirror the content in the filesystem. No database is used, almost all the content are saved in the content folder (by default /Documents/dodoc_next).

Folders contain a meta.txt file and media files (images, videos, audios, 3D/stl, texts, or any other kind of files).

## Properties and values

### Folders

Default values are:

```
- $admins           (Array, editable)                     list of admins paths
- $contributors     (Array, editable)                     list of contributors paths
- $cover            (Object, editable)                    if a meta_cover.jpeg is present in the root of the folder
- $preview          (String, editable)                    if set, search for a meta filename in this folder and read it when reading folder (useful for advanced cover of this folder)
- $date_created     (Date)                                when the folder was created
- $date_modified    (Date)                                when the folder was last edited
- $files_count      (Number)                              number of files in that folder
- $date_last_file   (Date)                                when the last file was uploaded
- $files            (Array)                               list of all the files in this folder (see Files below) (bypass with no_files=true to improve performance where files are not needed)
- $status           (String, editable)                    determines whether the folder gets listed
- $public           (Boolean, editable)                   if true, return that folder, its files, and its source medias even when request is not auth
- $password         (String, editable, stored as hash)    limit editing to users with password
- $path             (String)                              path to folder, matches filesystem structure and URL
- $infos            (Object)                              data gathered from the folder itself (only available when url is appended with ?detailed=true)
  - size            (Number)                              size in bytes
```

Custom values can be defined in the schema property in settings_base.json.
Editable default values and all custom values can only be edited by an $admins.

### Files

Each file has default values and custom values as well.
Default values are:

```
- $admins           (Array, editable)                     list of admins paths (will be used to set file permissions in the future)
- $contributors     (Array, editable)                     list of contributors paths (will be used to set file permissions in the future)
- $authors          (Array, editable)                     list of authors paths (information only, not actually used server-side)
- $path             (String)                              path to meta text file, matches filesystem structure and URL
- $date_created     (Date)                                when the file was created
- $date_uploaded    (Date)                                when the file was uploaded
- $date_modified    (Date)                                when the file was last edited
- $media_filename   (String, editable)                    name of the file
- $type             (String, editable)                    type of media file among the following: _image, video, audio, stl, text, pdf, other_
- $status           (String, editable)                    determines whether the file gets listed when getFiles is called by non-authors
- $origin           (String, editable)                    used to indicate the origin of the media (capture page, upload, etc.)
- $optimized        (Boolean, editable)                   used to indicate whether the media has been optimized or not
- $thumbs           (object)                              list of possible media image thumbs
- $content          (String, editable)                    text content of a file
- $credits          (String, editable)                    Credits for media
- $location         (Object, editable)                    GPS location for file
- $infos            (object)                              data gathered from the file itself
  - mtimems         (Date)                                last modified time for media file
  - duration        (Number)                              for videos and audios
  - width           (Number)                              for images and videos
  - height          (Number)                              for images and videos
  - ratio           (Number)                              for images and videos
  - size            (Number)                              size in bytes
  - gps             (Object)
  - hash            (String)                              file hash (to find duplicates)
```
