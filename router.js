var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');
var path = require("path");
var fs = require('fs-extra');
var ffmpeg = require('fluent-ffmpeg');
var dodoc  = require('./public/dodoc.js'),
	moment = require( "moment" ),
  merge = require('merge'),
  parsedown = require('woods-parsedown')
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

  function getMetaFileOfFolder( slugFolderName) {
    return getFullPath( slugFolderName) + '/' + dodoc.folderMetafilename + dodoc.metaFileext;
  }

  function getProjectPath( slugFolderName, slugProjectName) {
    return slugFolderName + '/' + slugProjectName;
  }
  function getMetaFileOfProject( projectPath) {
    return getFullPath( projectPath) + '/' + dodoc.projectMetafilename + dodoc.metaFileext;
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
    return moment().format( dodoc.metaDateFormat);
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
      var jsonFileOfFolder = getMetaFileOfFolder( slugFolderName);
      var folderData = readMetaFile( jsonFileOfFolder);

      pageDataJSON.slugFolderName = slugFolderName;
      pageDataJSON.folderName = folderData.name;
      pageDataJSON.statut = folderData.statut;

      var slugProjectName = req.param('project');
      if( slugProjectName !== undefined) {
        var projectPath = getProjectPath( slugFolderName, slugProjectName)
        var jsonFileOfProject = getMetaFileOfProject( projectPath);
        var projectData = readMetaFile( jsonFileOfProject);

        pageDataJSON.slugProjectName = slugProjectName;
        pageDataJSON.projectName = projectData.name;

        var slugPubliName = req.param('publi');
        if( slugPubliName !== undefined) {
          var jsonFileOfPubli = getPathToPubli( slugFolderName, slugProjectName, slugPubliName) + dodoc.metaFileext;
          var fullPathToJsonFileOfPubli = makePathToPubliFull( jsonFileOfPubli);
          var publiData = readMetaFile( fullPathToJsonFileOfPubli);

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

    pageDataJSON.dodoc = dodoc;

    return pageDataJSON;
  }


  // GET
  function getIndex(req, res) {
    var pageTitle = "Do.Doc";
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("index", generatePageDataJSON);
  };

  function getFolder(req, res) {
    var pageTitle = dodoc.lang.folder;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("folder", generatePageDataJSON);
  };

  function getProject(req, res) {
    var pageTitle = dodoc.lang.project;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("project", generatePageDataJSON);
  };

  function getCapture(req, res) {
    var pageTitle = dodoc.lang.capture;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("capture", generatePageDataJSON);
  };

  function getBibli(req, res) {
    var pageTitle = dodoc.lang.bibli;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("bibli", generatePageDataJSON);
  };

  function getBibliPubli(req, res) {
    var pageTitle = dodoc.lang.bibli;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("bibli", generatePageDataJSON);
  };

  function getPubli(req, res) {
    var pageTitle = dodoc.lang.publi;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("publi", generatePageDataJSON);
  };

  function readMetaFile( metaFile){
    var metaFileContent = fs.readFileSync( metaFile, 'utf8');
    var metaFileContentParsed = parseData( metaFileContent);
    return metaFileContentParsed;
  }

	function parseData(d) {
  	var parsed = parsedown(d);
  	// if there is a field called medias, this one has to be made into an array
  	if( parsed.hasOwnProperty('medias'))
  	  parsed.medias = parsed.medias.split(',');
    // the fav field is a boolean, so let's convert it
  	if( parsed.hasOwnProperty('fav'))
  	  parsed.fav = (parsed.fav === 'true');
		return parsed;
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

};
