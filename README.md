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

# Method 1 - OSX only
### Download the app (simplest way, MacOS only for now)

Check out the latest releases: https://github.com/l-atelier-des-chercheurs/dodoc/releases

# Method 2 - All OS
### With a terminal (a little more complicated)

_You need both [git](https://git-scm.com/downloads) and [node.js](https://nodejs.org/) to install DoDoc._

#### Windows
Follow [this tutorial](http://wikistrea.fr/Comment_ouvrir_la_console_de_commande_Windows_en_mode_administrateur_%3F): 
#### Mac OSX
Go to Applications->Utilities->Terminal
#### Linux
You should already be able to open a terminal

### 1. Open/create a folder to install DoDoc
Select where you want DoDoc to be copied on your computer with the following command
```cd path/to/a/folder``` 

### 2. Clone the repo or download it
Clone dodoc to a `dodoc` folder:
```git clone https://github.com/l-atelier-des-chercheurs/dodoc.git```
then open that folder with ```cd dodoc```

### 3. Install dependencies

Install electron dependencies
```npm install```  

Then install dodoc dependencies
```cd app```
```npm install```

### 4. Run dodoc

Go back to the dodoc folder
```cd ../```

Then start dodoc
```npm start```



## Third-party packages

### Install ffmpeg to make stopmotions
Official page [https://www.ffmpeg.org/](https://www.ffmpeg.org/)

####On Linux
Install ffmpeg from your package manager.

####On windows (it works on every version of windows)
Follow this tutorial: [http://adaptivesamples.com/how-to-install-ffmpeg-on-windows/](http://adaptivesamples.com/how-to-install-ffmpeg-on-windows/)

####On Mac OSX
Follow this tutorial: [http://www.renevolution.com/how-to-install-ffmpeg-on-mac-os-x/](http://www.renevolution.com/how-to-install-ffmpeg-on-mac-os-x/)


## Update dodoc

###To update DoDoc with the latest version  

As the content folder (medias, texts, etc.) is outside the app, just replace the dodoc.app or redownload the repository. 

### Contributing or forking dodoc
-->  1 hackpad with spec (in french): https://hackpad.com/dodoc-5iYRCxUY8D5 <br>
-->  1 blog : http://www.lopendoc.org/dodoc/

### Debug and edit dodoc
To debug DoDoc, you can enable extra-logging with the following command:
```npm run debug```
