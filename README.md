![DoDoc logo](http://latelier-des-chercheurs.fr/github/i_logo.svg)

# Presentation

DoDoc is a documentation tool, first designed for use in classrooms with children. It is a platform connected to a physical device that operates a camera and a microphone, and enables one to capture traces from an on-going experience for later reflections, reconstructions and creation of narratives.<br> 
DoDoc is made by [l'atelier des chercheurs](http://latelier-des-chercheurs.fr/) (Sarah Garcin, Pauline Gourlet & Louis Eveillard).<br>
You can find more documentation and contribute to the project [here](http://www.lopendoc.org/dodoc/).<br>

#### License [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## DoDoc design principles

![DoDoc](http://latelier-des-chercheurs.fr/github/schema_recap_dodoc-04.png)

## Screenshots of the app

![DoDoc](http://latelier-des-chercheurs.fr/github/interfaceecran-accueil.jpg)

![DoDoc](http://latelier-des-chercheurs.fr/github/interfaceecran-projet.jpg)

![DoDoc](http://latelier-des-chercheurs.fr/github/interfaceecran-capture.jpg)

![DoDoc](http://latelier-des-chercheurs.fr/github/interfaceecran-publication.jpg)

## Two examples of stations made for the app

![DoDoc](http://latelier-des-chercheurs.fr/github/dodoctei.jpg)

![DoDoc](http://latelier-des-chercheurs.fr/github/IMG_9332.jpg)

## App and stations being used with children 

![DoDoc](http://latelier-des-chercheurs.fr/github/_1040646.jpg)

![DoDoc](http://latelier-des-chercheurs.fr/github/_1040649.jpg)

![DoDoc](http://latelier-des-chercheurs.fr/github/_1040651.jpg)

### The app running on a smartphone

![DoDoc](http://latelier-des-chercheurs.fr/github/_1060226.jpg)

### A station made for teaching the principles of stop-motion animation
 
![DoDoc](http://latelier-des-chercheurs.fr/github/_1060285.jpg)

---

# Install DoDoc

### Method 1 - the easy way

#### Download the app

Download the app from the release page: https://github.com/l-atelier-des-chercheurs/dodoc/releases

### Method 2 - the long way (for development and editing the source code)

_You need [node.js](https://nodejs.org/) and [python 2.7](https://www.python.org/) to install DoDoc with this method. On Windows, you also need to install Microsoft’s Windows Build Tools by following the instructions [here](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#prerequisites)._

#### 1. Download this repository

Click on *Clone or Download* in the top right corner of this page, then *Download ZIP*. Unpack this folder.

#### 2. Open a terminal window

Open a terminal window to execute commands and install DoDoc.

- Windows: (XP) use [this tutorial](http://wikistrea.fr/Comment_ouvrir_la_console_de_commande_Windows_en_mode_administrateur_%3F) to open a terminal on Windows or open Command Prompt in the start menu 
- macOS: go to Applications -> Utilities -> Terminal
- Linux: use a terminal app such as Terminal or Konsole

In your terminal, navigate to the dodoc-master folder with your terminal using the `cd` command:
```
cd path/to/dodoc-master
```

#### 3. Install dependencies

If you haven’t already, install the tool that will enable native modules to be used (DoDoc requires [sharp](https://github.com/lovell/sharp), a very fast native library to generate images). 
To do this, follow the instructions here: https://github.com/nodejs/node-gyp

Then, install DoDoc’s dependencies (may take up to 5 minutes):
```
npm install
```  

Before running dodoc, make sure to build native dependencies by running:

```
npm run rebuild
```
 
On ARM devices (such as a Raspberry Pi, or an Orange Pi), the PDF creation library (Phantom) is not available so it can't be installed. For those devices, run the following command instead:
```
npm install --no-optional
``` 
 
#### 4. Run DoDoc

Start DoDoc folder with the following command:
```
npm start
```

# Update and manage dododc

## Update DoDoc with the latest version  

As the `/dodoc` content folder (medias, texts, etc.) is outside the app, just replace the app or redownload this repository and reinstall dependencies. If you know how to use _git_ (which is not covered in this tutorial) you can also pull changes to your local copy.

## Moving the content folder  

By default, all contents are stored in the user's "My Documents" folder in a `/dodoc` folder. You can ask DoDoc to create or use a `/dodoc` folder anywhere else on your computer by clicking on the link in the footer when using DoDoc directly on a computer (and not from a browser on a tablet connected to DoDoc, for example). Clicking this link will open a pop-up window with instructions.

The path to the `/dodoc` folder is saved in the app so if you reinstall or update it you will need to set it up again. 

## Creating publication's templates

You can create you own publication's templates for PDF and website export by following the instructions in the `readme.txt` file at `/dodoc/templates/_exemple`. You need at least an `icone.svg` and a `style.css` file to make a new template.

## Contributing or forking DoDoc

We welcome contributions and inputs. Use the Github issue tracker if you encounter a bug or want to suggest a new feature: https://github.com/l-atelier-des-chercheurs/dodoc/issues

Also, some documentations on DoDoc:

-->  1 hackpad with spec (in french): https://hackpad.com/dodoc-5iYRCxUY8D5 <br>

-->  1 blog : http://www.lopendoc.org/dodoc/

## Debug and edit DoDoc
If submitting bugs, please enable "debug" mode in the footer and restart the app. Navigate to the place with the bug, close the app and go to the following path to get a log text file:

- on Linux: `~/.config/dodoc/log.log`
- on OS X: `~/Library/Logs/dodoc/log.log`
- on Windows: `%USERPROFILE%/AppData/Roaming/dodoc/log.log`

To debug DoDoc when it is installed with method 2, you can enable extra-logging with the following command:
```
npm run debug
```

To edit the SCSS (css) files, you’ll need to run gulp:
```
gulp
```
