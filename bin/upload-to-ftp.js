var dodocAPI = require('dodoc-api');
var dev = require('devLog');

module.exports = exportPubliToFtp;

function exportPubliToFtp(socket, d){
  dev.logfunction( "EVENT - exportPubliToFtp");
  var currentDateString = dodocAPI.getCurrentDate();
  var projectPath = getProjectPath( d.slugFolderName, d.slugProjectName);

  var exportedPubliFolderName = currentDateString + "_" + d.slugPubliName;
  exportedPubliFolderName = findFirstFilenameNotTaken( exportedPubliFolderName, dodoc.exportedPubliDir, '');

  var exportedPubliPath = dodoc.exportedPubliDir + "/" + "exportedPubliFolderName";
  var exportedMediaFolderName = exportedPubliPath + "/" + "medias";

  // create publi directory with publi name
  fs.mkdir(exportedPubliPath, function(){
    // create medias directory in publi directory
    fs.mkdir(exportedMediaFolderName, function(){
      // copy css file
      copyFiles('public/css/style.css', exportedPubliPath + "/style.css", function(){
        // create html file
        fs.writeFile(exportedPubliPath + "/index.html", d.html, function(){
//             saveImagesLocal(projectPath, folderPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, socket);
        });
      });
    });
  });
}

function saveImagesLocal(projectPath, folderPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, socket){
  var arrayImages = [];
  listMediaAndMetaFromOnePubli( slugFolderName, slugProjectName, slugPubliName).then(function(publi) {
    for (var prop in publi) {
      var medias = publi[prop].medias;
      for(var index in medias){
        var media = medias[index];
        for(var fichiers in media){
          var eachFiles = media[fichiers].files;
          var mediaFolder = media[fichiers].mediaFolderPath;
          for(var fileToCopy in eachFiles){
            var fileName = eachFiles[fileToCopy];
            var oldPath = path.join( projectPath, mediaFolder, fileName);
            var newPath = path.join( mediasPath, fileName);
            arrayImages.push(fileName);
            try {
              fs.copySync(oldPath, newPath);
              console.log("success!");
            } catch (err) {
              console.error(err)
            }
          }
        }
      }
    }
    // check internet connection
    require('dns').resolve('www.google.com', function(err) {
      if (err) {
        console.log("No connection");
        socket.emit('noConnection');
      } else {
        sendFileToServer(arrayImages, folderPath, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, socket);
      }
    });
  }, function(error) {
    console.error("Failed to list one media! Error: ", error);
  });
}


function sendFileToServer(arrayImages, folderPath, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, socket){
  // config ftp in ftp-config.js
  if(exportConfig !== undefined) {
    var domain = exportConfig.domaineName;
    var domainFolder = exportConfig.subFolder
    // instance for FTP Client
    var c = new Client();

    c.on('ready', function() {
      c.mkdir( path.join( domainFolder, slugPubliName), function(err) {
        if (err) console.log(slugPubliName+ ' not transferred:' + err);
        else {
          console.log("Folder create on server transferred successfully!");
        }
        c.put(folderPath + '/index.html', domainFolder+'/'+ slugPubliName+'/index.html', function(err) {
          if (err) console.log('not transferred:' + err);
          else console.log("HTML File transferred successfully!");
        });
        c.put(folderPath + '/style.css', domainFolder+'/'+ slugPubliName+'/style.css', function(err) {
          if (err) console.log('not transferred:' + err);
          else console.log("CSS File transferred successfully!");
        });
        c.put(folderPath + '/script.min.js', domainFolder+'/'+ slugPubliName+'/script.min.jss', function(err) {
          if (err) console.log('not transferred:' + err);
          else console.log("JS File transferred successfully!");
        });

        c.mkdir(domainFolder+'/'+ slugPubliName+'/medias', function(err) {
          if (err) console.log('medias: not transferred:' + err);
          else console.log("File transferred successfully!");
          sendImageToServer(arrayImages, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, c, domainFolder, domain, socket);
        });
      });
    });


    c.connect({
      host: exportConfig.host,
      port: exportConfig.port,
      user: exportConfig.user,
      password: exportConfig.password
    });
    console.log("Connected");

  } else {
    console.error("Couldn't find a ftp-config.js with FTP information to use.");
  }
}

function sendImageToServer(arrayImages, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, c, domainFolder, domain, socket){
  for(var fileName in arrayImages){
    c.append(mediasPath + '/' + arrayImages[fileName], domainFolder+'/'+ slugPubliName+'/medias/'+arrayImages[fileName], function(err) {
      if (err) console.log('not transferred:' + err);
      else {
        console.log("media transferred");
      }
    });
  }
  console.log("Publication was transferred at: "+domain+domainFolder+'/'+slugPubliName);
  socket.emit('pubiTransferred', domain+domainFolder+'/'+slugPubliName);
  c.end();
}
