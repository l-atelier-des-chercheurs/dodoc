DoDoc
==========

##Presentation

DoDoc is a documentation tool for children in classrooms.   
DoDoc is a research project of [l'atelier des chercheurs](http://latelier-des-chercheurs.fr/).  
Dodoc is both a web documentation platform and a physical device.  
![dodoc](http://www.lopendoc.org/lopendocresearch/wp-content/uploads/sites/5/2015/06/schema-dodoc-02.png)
![dodoc](http://latelier-des-chercheurs.fr/img/img-dodoc-fes0.jpg)  

### Using the terminal
#### Windows
Follow this tutorial: http://wikistrea.fr/Comment_ouvrir_la_console_de_commande_Windows_en_mode_administrateur_%3F
#### Mac OSX
Go to Applications->Utilitaries->Terminal
#### Linux
If you have Linux you know how to use the terminal

##How to install Dodoc

### Clone the repo or download it
To download the repository, click on the "Download zip" button on the dodoc Github page  

To clone the repository open the terminal and type this command  
```git clone https://github.com/sarahgarcin/dodoc-fes.git```

###Install nodejs on your computer

You can install nodejs from this page [https://nodejs.org/](https://nodejs.org/)     
Then, verify that it is correctly installed  by typing in the terminal    
```node -v```

###Install dependencies

In terminal go to the dodoc directory you have just cloned or downloaded:  
```cd path/of/the/dodoc/directory```  
example:  
```cd Pauline/sites/dodoc-fes```     

Once you are in the right directory   
(the terminal says for example ```MacBook-Pro-de-Pauline-3:dodoc-fes Pauline$``` )   
Enter the command:    
```npm install```  

###Install ffmpeg
Official page [https://www.ffmpeg.org/](https://www.ffmpeg.org/)

####On Linux
Install ffmpeg from your package manager.

####On windows (it works on every version of windows)
Follow this tutorial: [http://adaptivesamples.com/how-to-install-ffmpeg-on-windows/](http://adaptivesamples.com/how-to-install-ffmpeg-on-windows/)

####On Mac OSX
Follow this tutorial: [http://www.renevolution.com/how-to-install-ffmpeg-on-mac-os-x/](http://www.renevolution.com/how-to-install-ffmpeg-on-mac-os-x/)

###Add the missing files
- Create a new folder named "sessions" into your dodoc directory (right click in the folder "dodoc-fes", then "new folder" and you rename it "sessions").  
- Add the 3 certificates files for using https. (To get these files, send us an email)  

###Run DoDoc
In the right directory    
(the terminal says for example ```MacBook-Pro-de-Pauline-3:dodoc-fes Pauline$``` )  
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
- Change the name of the old version directory (example: "Dodoc-fes" > "DoDoc-fes_01")
- Paste all files and directories of your newly downlaod docdoc directory into your copy directory and replace all existed files

