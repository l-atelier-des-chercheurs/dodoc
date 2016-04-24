var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');
var path = require("path");
var fs = require('fs-extra');
var ffmpeg = require('fluent-ffmpeg');
var dodoc  = require('./public/dodoc.js'),
	moment = require( "moment" ),
  merge = require('merge')
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
  app.get("/:folder/:project/publications/:publi", getPubli);


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

  function getPathToPubli( slugFolderName, slugProjectName, pslug) {
    var projectPath = getProjectPath( slugFolderName, slugProjectName);
    var pathToPubli = projectPath + '/' + getPubliPathOfProject();
    if( pslug !== undefined)
      pathToPubli = pathToPubli + '/' + pslug;
    return pathToPubli;
  }

  function makePathToPubliFull( publiPath) {
    return getFullPath( publiPath);
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

      pageDataJSON.slugFolderName = slugFolderName;
      pageDataJSON.folderName = folderData.name;
      pageDataJSON.statut = folderData.statut;

      var slugProjectName = req.param('project');
      if( slugProjectName !== undefined) {
        var projectPath = getProjectPath( slugFolderName, slugProjectName)
        var jsonFileOfProject = getJsonFileOfProject( projectPath);
        var projectData = readJsonFile( jsonFileOfProject);

        pageDataJSON.slugProjectName = slugProjectName;
        pageDataJSON.projectName = projectData.name;

        var slugPubliName = req.param('publi');
        if( slugPubliName !== undefined) {
          var jsonFileOfPubli = getPathToPubli( slugFolderName, slugProjectName, slugPubliName) + '.json';
          var fullPathToJsonFileOfPubli = makePathToPubliFull( jsonFileOfPubli);
          var publiData = readJsonFile( fullPathToJsonFileOfPubli);

          pageDataJSON.slugPubliName = slugPubliName;
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

  function readJsonFile( jsonFile){
    var jsonFileContent = fs.readFileSync(jsonFile, 'utf8');
    var jsonFileContentParsed = JSON.parse( jsonFileContent);
    return jsonFileContentParsed;
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
  function getPubliPathOfProject() {
    return dodoc.projectPublisFoldername;
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
