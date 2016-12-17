DoDoc
==========
![dodoc](http://www.lopendoc.org/dodoc/wp-content/uploads/sites/23/2016/05/Capture-d%E2%80%99e%CC%81cran-2016-05-05-a%CC%80-18.29.52.png)

##Presentation

DoDoc is a documentation tool, first designed for use in classrooms with children. It is a platform connected to a physical device that operates a camera and a microphone, and enables one to capture traces from an on-going experience for later reflections, reconstructions and creation of narratives.<br> 
DoDoc is developed by [l'atelier des chercheurs](http://latelier-des-chercheurs.fr/) (Sarah Garcin, Pauline Gourlet & Louis Eveillard).<br>
You can find more documentation and contribute to the project [here](http://www.lopendoc.org/dodoc/).<br>
#### License CC BY-NC-SA <br>


![dodoc](http://www.lopendoc.org/dodoc/wp-content/uploads/sites/23/2016/05/Capture-d%E2%80%99e%CC%81cran-2016-05-05-a%CC%80-18.13.31.png)

![dodoc](http://www.lopendoc.org/dodoc/wp-content/uploads/sites/23/2016/05/Capture-d%E2%80%99e%CC%81cran-2016-05-05-a%CC%80-18.13.44.png) 


##Install DoDoc

# Method 1 - macOS only
### Download the app

Download the following app, unzip and launch _dodoc.app_ : https://github.com/l-atelier-des-chercheurs/dodoc/releases/download/4.0.0/dodoc.app.zip

# Method 2 - All OS

_You need [node.js](https://nodejs.org/) and [python 2.7](https://www.python.org/) to install DoDoc with this method. On Windows, you also need to install Microsoft’s Windows Build Tools by following the instructions [here](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#prerequisites)._

### 1. Download this repository

Click on *Clone or Download* in the top right corner of this page, then *Download ZIP*. Unpack this folder.

### 2. Open a terminal window

Open a terminal window to execute commands and install DoDoc.

- Windows: use [this tutorial](http://wikistrea.fr/Comment_ouvrir_la_console_de_commande_Windows_en_mode_administrateur_%3F) to open a terminal on Windows: 
- macOS: go to Applications->Utilities->Terminal
- Linux: use a terminal app such as Terminal or Konsole

In your terminal, navigate to the dodoc-master folder with your terminal using the `cd` command:
```
cd path/to/dodoc-master
```

### 3. Install dependencies

Install electron dependencies (may take up to 5 minutes):
```
npm install
```  

Then install dodoc dependencies that are in the app folder.
Go to app folder:
```
cd app
```
Install dependencies:
```
npm install
```

Finally run the following command to make sure native dependencies are installed (may take 1-2 minutes):		
 ```		
 ./node_modules/.bin/electron-rebuild		
 ```

### 4. Run dodoc

Go back to the dodoc folder with the following command:
```
cd ../
```

Then start dodoc:
```
npm start
```

## Update dodoc

### How to update DoDoc with the latest version  

As the content folder (medias, texts, etc.) is outside the app, just replace the dodoc.app or redownload this repository and reinstall dependencies. If you know how to use _git_ (which is not covered in this tutorial) you can also pull changes to your local copy.

### Contributing or forking dodoc

We welcome contributions and inputs. Use the Github issue tracker if you encounter a bug or want to suggest a new feature: https://github.com/l-atelier-des-chercheurs/dodoc/issues

Also, some not-so-up-to-date documentations on DoDoc:

-->  1 hackpad with spec (in french): https://hackpad.com/dodoc-5iYRCxUY8D5 <br>

-->  1 blog : http://www.lopendoc.org/dodoc/

## Debug and edit dodoc
To debug DoDoc, you can enable extra-logging with the following command:
```
npm run debug
```

To edit the SCSS (css) files, you’ll need to run a gulp task on the app folder.
```
cd app
gulp
```
