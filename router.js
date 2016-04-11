var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');
var path = require("path");
var fs = require('fs-extra');
var ffmpeg = require('fluent-ffmpeg');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var dodoc  = require('./public/dodoc.js'),
	moment = require( "moment" )
;

module.exports = function(app,io,m){


  /**
  * routing event
  */
  app.get("/", getIndex);
  app.get("/:folder", getFolder);
  app.get("/:folder/:project", getProject);
  app.get("/:folder/:project/capture", getCapture);
  app.get("/:folder/:project/bibliotheque/medias", getBibli);
  app.get("/:folder/:project/bibliotheque/panneau-de-publications", getBibliPubli);
  app.get("/:folder/:project/publication/:publi", getPubli);

  app.post("/:folder/:project/bibliotheque/medias/file-upload", multipartMiddleware, postFile);


  /**
  * routing functions
  */
  function getFullPath( path) {
    return dodoc.contentDir + "/" + path;
  }

  function getJsonFileOfFolder( slugFolderName) {
    return getFullPath( slugFolderName) + '/' + dodoc.folderJSONfilename;
  }

  function getProjectPath( slugFolderName, slugProjectName) {
    return slugFolderName + '/' + slugProjectName;
  }
  function getJsonFileOfProject( projectPath) {
    return getFullPath( projectPath) + '/' + dodoc.projectJSONfilename;
  }

  function getPubliPath( slugFolderName, slugProjectName, slugPubliName) {
    return slugFolderName + '/' + slugProjectName + '/montage/' + slugPubliName;
  }
  function getJsonFileOfPubli( publiPath) {
    return getFullPath( publiPath) + '/' + dodoc.publiJSONfilename;
  }
  function getCurrentDate() {
    return moment().format( dodoc.jsonDateFormat);
  }
  function eventAndContent( sendEvent, objectJson) {
    var eventContentJSON =
    {
      "socketevent" : sendEvent,
      "content" : objectJson
    };
    return eventContentJSON;
  }


  function generatePageData( req, pageTitle) {

    var pageDataJSON = [];

    var slugFolderName = req.param('folder');
    if( slugFolderName !== undefined) {
      var jsonFileOfFolder = getJsonFileOfFolder( slugFolderName);
      var folderData = readJsonFile( jsonFileOfFolder);

      pageDataJSON.folder = slugFolderName;
      pageDataJSON.folderName = folderData.name;
      pageDataJSON.statut = folderData.statut;

      var slugProjectName = req.param('project');
      if( slugProjectName !== undefined) {
        var projectPath = getProjectPath( slugFolderName, slugProjectName)
        var jsonFileOfProject = getJsonFileOfProject( projectPath);
        var projectData = readJsonFile( jsonFileOfProject);

        pageDataJSON.project = slugProjectName;
        pageDataJSON.projectName = projectData.name;

        var slugPubliName = req.param('publi');
        if( slugPubliName !== undefined) {
          var publiPath = getPubliPath( slugFolderName, slugProjectName, slugPubliName);
          var jsonFileOfPubli = getJsonFileOfPubli( publiPath);
          var publiData = readJsonFile( jsonFileOfPubli);

          pageDataJSON.publi = publiData.publi;
          pageDataJSON.publiName = publiData.name;
        }
      }
    }

    if( publiData !== undefined)
      pageTitle += " | " + publiData.name;
    else if( projectData !== undefined)
      pageTitle += " | " + projectData.name;
    else if( folderData !== undefined)
      pageTitle += " | " + folderData.name;

    if( pageTitle !== undefined)
      pageDataJSON.pageTitle = pageTitle;

    pageDataJSON.url = req.path;

    return pageDataJSON;
  }


  // GET
  function getIndex(req, res) {
    var pageTitle = "Do.Doc";
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("index", generatePageDataJSON);
  };

  function getFolder(req, res) {
    var pageTitle = dodoc.nameOfFolder;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("folder", generatePageDataJSON);
  };

  function getProject(req, res) {
    var pageTitle = dodoc.nameOfProject;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("project", generatePageDataJSON);
  };

  function getCapture(req, res) {
    var pageTitle = dodoc.nameOfCapture;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("capture", generatePageDataJSON);
  };

  function getBibli(req, res) {
    var pageTitle = dodoc.nameOfBibli;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("bibli", generatePageDataJSON);
  };

  function getBibliPubli(req, res) {
    var pageTitle = dodoc.nameOfBibli;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("bibli", generatePageDataJSON);
  };

  function getPubli(req, res) {
    var pageTitle = dodoc.nameOfPubli;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("publi", generatePageDataJSON);
  };

  function postFile(req, res) {

    var fileExtension = path.extname( req.files.file.name);
    var newFileName = getCurrentDate();
    var generatePageDataJSON = generatePageData(req);

    var slugFolderName = generatePageDataJSON.folder;
    var slugProjectName = generatePageDataJSON.project;

    console.log( "generatePageDataJSON = " + JSON.stringify( generatePageDataJSON, null, 4));
//     var pathToFolder = pageDataJSON.folder

    // should send to createNewMedia
    // for now this will do
    fs.readFile( req.files.file.path, function (err, data) {
      var projectPath = getProjectPath( slugFolderName, slugProjectName);
      var fullPath = getFullPath( projectPath);


      var newMediaType = '';
      if( fileExtension == ".webm" || fileExtension == ".ogg" || fileExtension == ".mov" || fileExtension == ".mp4") {
        newMediaType = 'video';
      }
      else if( fileExtension == ".jpg" || fileExtension == ".jpeg" || fileExtension == ".png" || fileExtension == ".tiff") {
        newMediaType = 'photo';
      }

    	var mediaFolder = getMediaFolderPathByType( newMediaType);
			var mediaPath = fullPath + '/' + mediaFolder;
      var pathToFile = mediaPath + '/' + newFileName;

      fs.writeFileSync( pathToFile + fileExtension, data);
      mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension, newFileName);

      if( newMediaType == 'video') {
        createThumnails( pathToFile + fileExtension, newFileName, mediaPath)
          .then(function( mediaFolderContent) {
            console.error("Video thumbs have been made.");
            sendMediaMetaData( mediaMetaData);
            res.redirect("back");
          }, function(error) {
            console.error("Failed to make a thumbnail one media! Error: ", error);
            sendMediaMetaData( mediaMetaData);
            res.redirect("back");
          });
      } else {
        sendMediaMetaData( mediaMetaData);
        res.redirect("back");
      }

    });
  };

  function sendMediaMetaData( mediaMetaData) {
    var eventAndContentJson = eventAndContent( "mediaCreated", mediaMetaData);
    console.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
    // for other clients connected
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
  }

  function readJsonFile( jsonFile){
    var jsonFileContent = fs.readFileSync(jsonFile, 'utf8');
    var jsonFileContentParsed = JSON.parse( jsonFileContent);
    return jsonFileContentParsed;
  }

	function createThumnails( videoPath, videoFilename, pathToMediaFolder){
    return new Promise(function(resolve, reject) {
  		var proc = ffmpeg( videoPath)
  		// setup event handlers
  		.on('end', function(files) {
  			console.log('screenshot was saved');
  			resolve();
  		})
  		.on('error', function(err) {
  			console.log('an error happened: ' + err.message);
  			reject();
  		})
  		// take 2 screenshots at predefined timemarks
  		.takeScreenshots({ count: 1, timemarks: [ '00:00:01'], "filename" : videoFilename + ".png"}, pathToMediaFolder);
    });
	}

  function getMediaFolderPathByType( mediaType) {
    if( mediaType == 'photo')
      return getPhotoPathOfProject();
    if( mediaType == 'video')
      return getVideoPathOfProject();
    if( mediaType == 'animation')
      return getAnimationPathOfProject();
    if( mediaType == 'audio')
      return getAudioPathOfProject();
    if( mediaType == 'text')
      return getTextPathOfProject();
  }

  function getPhotoPathOfProject() {
    return dodoc.projectPhotosFoldername;
  }
  function getAnimationPathOfProject() {
    return dodoc.projectAnimationsFoldername;
  }
  function getVideoPathOfProject() {
    return dodoc.projectVideosFoldername;
  }
  function getAudioPathOfProject() {
    return dodoc.projectAudiosFoldername;
  }
  function getTextPathOfProject() {
    return dodoc.projectTextsFoldername;
  }

  // copie de celui de main.js
  function createMediaJSON( newMediaType, pathToFile, fileExtension, fileName) {
    var mediaMetaData = {};
    mediaMetaData['created'] = getCurrentDate();
    mediaMetaData['modified'] = getCurrentDate();
    mediaMetaData['informations'] = '';
    mediaMetaData['type'] = newMediaType;
    mediaMetaData['fav'] = false;

    // generate a json file next to the file
    var pathToJSONFile = pathToFile + '.json';
		var status = jsonWriteToFile( pathToJSONFile, mediaMetaData, "update");

    // only add to the response JSON
    // no need for this in the JSON file since it is recreated on send
    mediaMetaData['mediaName'] = fileName;

		return mediaMetaData;
  }

  // new write json function that writes in json and returns true or false depending on success
  function jsonWriteToFile( jsonFile, objectJson, sendEvent) {
		var jsonString = JSON.stringify( objectJson, null, 4);
		if( sendEvent === "create") {
  		try {
  			fs.appendFileSync( jsonFile, jsonString);
        console.log("Success for event : " + sendEvent);
        return true;
  		} catch(err) {
        console.log(err);
        return false;
      }
    }
    else if( sendEvent === "update") {
      console.log("Success for event : " + sendEvent);
      fs.writeFileSync(jsonFile, jsonString);
      return true;
	  }
  }

};
