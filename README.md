DoDoc
==========
![dodoc](http://www.lopendoc.org/dodoc/wp-content/uploads/sites/23/2016/05/Capture-d%E2%80%99e%CC%81cran-2016-05-05-a%CC%80-18.29.52.png)

##Presentation

DoDoc is a documentation tool, first designed for a children use in classrooms.  It is is a documentation platform connected to a physical device that operates a camera and a microphone. It enables one to capture traces from an on-going experience for later reflections, reconstructions and creations of narratives. <br> 
DoDoc is a research project developed by [l'atelier des chercheurs](http://latelier-des-chercheurs.fr/) (Sarah Garcin, Pauline Gourlet & Louis Eveillard).<br>
License CC BY-NC <br>
You can find more documentation and contribute to the project [here](http://www.lopendoc.org/dodoc/).

![dodoc](http://www.lopendoc.org/dodoc/wp-content/uploads/sites/23/2016/05/Capture-d%E2%80%99e%CC%81cran-2016-05-05-a%CC%80-18.13.31.png)

![dodoc](http://www.lopendoc.org/dodoc/wp-content/uploads/sites/23/2016/05/Capture-d%E2%80%99e%CC%81cran-2016-05-05-a%CC%80-18.13.44.png)  

##TO INSTALL THE PROGRAM

### Using the terminal
#### Windows
Follow this tutorial: http://wikistrea.fr/Comment_ouvrir_la_console_de_commande_Windows_en_mode_administrateur_%3F
#### Mac OSX
Go to Applications->Utilitaries->Terminal
#### Linux
If you have Linux you know how to use the terminal

###Open a folder to install DoDoc
Select where you want DoDoc to be copied on your computer. 
To open this folder, type ```cd path/of/the/folder``` 
Example : in your folder "Documents", which is on your C:/ harddrive.
Type ```cd C:/Documents``` 


##How to install Dodoc

### Clone the repo or download it
To download the repository, click on the "Download zip" button on the dodoc Github page  

(Recommended - easier for Updates) 
To clone the repository open the terminal, open the directory where you want to place dodoc (for example > cd C:/Documents),
and type this command  
```git clone https://github.com/sarahgarcin/dodoc.git```
then open the dodoc directory by typing ```cd dodoc```

###Install nodejs on your computer

You can install nodejs from this page [https://nodejs.org/](https://nodejs.org/)     
Then, verify that it is correctly installed  by typing in the terminal    
```node -v```

###Install dependencies

In terminal go to the dodoc directory you have just cloned or downloaded:  
```cd path/of/the/dodoc/directory```  
example:  
```cd Pauline/sites/dodoc```     

Once you are in the right directory   
(the terminal says for example ```MacBook-Pro-de-Pauline-3:dodoc Pauline$``` )   
Enter the command:    
```npm install```  

On Windows XP, if you get the following error : 
```Error: Failed to replace env in config: ${APPDATA}```
you have to first set the right path to a writable folder for node. Go to C:\Program Files\nodejs\node_modules\npm and open npmrc.
Replace the line 
'prefix=${APPDATA}\npm'
with
```prefix=C:\Program Files\nodejs\node_modules\npm```

###Install ffmpeg
Official page [https://www.ffmpeg.org/](https://www.ffmpeg.org/)

####On Linux
Install ffmpeg from your package manager.

####On windows (it works on every version of windows)
Follow this tutorial: [http://adaptivesamples.com/how-to-install-ffmpeg-on-windows/](http://adaptivesamples.com/how-to-install-ffmpeg-on-windows/)

####On Mac OSX
Follow this tutorial: [http://www.renevolution.com/how-to-install-ffmpeg-on-mac-os-x/](http://www.renevolution.com/how-to-install-ffmpeg-on-mac-os-x/)

###Run DoDoc
In the right directory  (```cd path/of/the/dodoc/directory```  )
(the terminal says for example ```MacBook-de-Toto:dodoc Pauline$``` )  
Run the server in the terminal (enter the following command:)  
```node server.js```

Go to browser and go to the url (For now dodoc works only on Google Chrome or Chromium)   
[https://localhost:8080](https://localhost:8080)  
Your browser is going to tell that the website is unsafe, go on.   

###To update DoDoc with the latest vesrion  
There are two options:  
1) If you have cloned the repository, pull the modifications with the terminal:  
- Go to your folder directory:   
Example: ```cd dodoc```   
- Pull the modifications:   
```git pull```   

2) If you have downloaded the zip file and you want the updated version:
- Click on the "Download zip" button to download the new version
- Copy your old version directory.
- Change the name of the old version directory (example: "Dodoc" > "DoDoc_01")
- Paste all files and directories of the freshly-downloaded docdoc directory into your copy directory and replace all existed files

### Contributing or forking dodoc
-->  1 hackpad with spec (in french): https://hackpad.com/dodoc-5iYRCxUY8D5 <br>
-->  1 blog : http://www.lopendoc.org/dodoc/


To debug dodoc, you can enable extra-logging with the flag --debug:
```node server.js --debug```
