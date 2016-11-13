var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');
var path = require("path");
var fs = require('fs-extra');
var ffmpeg = require('fluent-ffmpeg');
var dodoc  = require('./public/dodoc.js');
var moment = require('moment');
var merge = require('merge');
var parsedown = require('dodoc-parsedown');
var os = require('os');
var devLog = require('./bin/dev-log.js');
var flags = require('flags');


module.exports = function(app,io,m){

  flags.defineBoolean('debug');
  flags.defineBoolean('verbose');
  flags.parse();
  var isDebugMode = flags.get('debug');
  var isVerbose = flags.get('verbose');
  global.dev = devLog( isDebugMode, isVerbose);

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
  function getContentPath(thisPath) {
    return path.join( getRootPath(), dodoc.contentDir, thisPath);
  }
  function getRootPath() {
    return __dirname;
  }
  function getRootFolder(thisPath) {
    return path.join( getRootPath(), thisPath);
  }

  function getMetaFileOfFolder( slugFolderName) {
    return path.join( getContentPath( slugFolderName), dodoc.folderMetafilename + dodoc.metaFileext);
  }
  function getProjectPath( slugFolderName, slugProjectName) {
    return path.join( getContentPath( slugFolderName), slugProjectName);
  }
  function getMetaFileOfProject( slugFolderName, slugProjectName) {
    return path.join( getProjectPath( slugFolderName, slugProjectName), dodoc.projectMetafilename + dodoc.metaFileext);
  }

  function getPathToPubli( slugFolderName, slugProjectName, pslug) {
    var projectPath = getProjectPath( slugFolderName, slugProjectName);
    var pathToPubli = path.join( projectPath, getPubliPathOfProject());
    if( pslug !== undefined)
      pathToPubli = path.join( pathToPubli, pslug);
    return pathToPubli;
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
    return new Promise(function(resolve, reject) {

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
          var jsonFileOfProject = getMetaFileOfProject( slugFolderName, slugProjectName);
          var projectData = readMetaFile( jsonFileOfProject);

          pageDataJSON.slugProjectName = slugProjectName;
          pageDataJSON.projectName = projectData.name;

          var slugPubliName = req.param('publi');
          if( slugPubliName !== undefined) {
            var jsonFileOfPubli = getPathToPubli( slugFolderName, slugProjectName, slugPubliName) + dodoc.metaFileext;
            var publiData = readMetaFile( jsonFileOfPubli);

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

      getLocalIP().then(function(localNetworkInfos) {
        pageDataJSON.localNetworkInfos = localNetworkInfos;

//         console.log('pageDataJSON');
//         console.log(pageDataJSON);

        resolve(pageDataJSON);
      }, function(err) {
        console.log('err ' + err);
        reject(err);
      });
    });
  }


  // GET
  function getIndex(req, res) {
    var pageTitle = "Do.Doc";
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      res.render("index", generatePageDataJSON);
    });
  };

  function getFolder(req, res) {
    var pageTitle = dodoc.lang.folder;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      res.render("folder", generatePageDataJSON);
    });
  };

  function getProject(req, res) {
    var pageTitle = dodoc.lang.project;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      res.render("project", generatePageDataJSON);
    });
  };

  function getCapture(req, res) {
    var pageTitle = dodoc.lang.capture;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      res.render("capture", generatePageDataJSON);
    });
  };

  function getBibli(req, res) {
    var pageTitle = dodoc.lang.bibli;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      getAllTemplates().then(function(allTemplates) {
        generatePageDataJSON["templates"] = allTemplates;
        res.render("bibli", generatePageDataJSON);
      }, function(err) {
        console.log('err ' + err);
      });
    });
  };

  function getBibliPubli(req, res) {
    var pageTitle = dodoc.lang.bibli;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      getAllTemplates().then(function(allTemplates) {
        generatePageDataJSON["templates"] = allTemplates;
        res.render("bibli", generatePageDataJSON);
      }, function(err) {
        console.log('err ' + err);
      });
    });
  };

  function getPubli(req, res) {
    var pageTitle = dodoc.lang.publi;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      getAllTemplates().then(function(allTemplates) {
        generatePageDataJSON["templates"] = allTemplates;
        res.render("publi", generatePageDataJSON);
      }, function(err) {
        console.log('err ' + err);
      });
    }, function(err) {
      console.log('err ' + err);
    });
  };

  function readMetaFile( metaFile){
    var metaFileContent = fs.readFileSync( metaFile, 'utf8');
    var metaFileContentParsed = dodocAPI.parseData( metaFileContent);
    return metaFileContentParsed;
  }

  function getAllTemplates() {
    return new Promise(function(resolve, reject) {
      var templateFolderPath = getRootFolder( dodoc.publicationTemplateDir);
      fs.readdir( templateFolderPath, function (err, filenames) {
        if (err) reject( console.log( 'Couldn\'t read content dir : ' + err));
        var folders = filenames.filter( function(slugFolderName){ return new RegExp( dodoc.regexpMatchFolderNames, 'i').test( slugFolderName); });
        resolve(folders);
      });
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
  function getPubliPathOfProject() {
    return dodoc.projectPublisFoldername;
  }

  // from http://stackoverflow.com/a/8440736
  function getLocalIP() {
    return new Promise(function(resolve, reject) {
      var ifaces = os.networkInterfaces();
      var networkInfo = {};
      Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
          if ('IPv4' === iface.family && iface.internal === false) {
            networkInfo[ifname] = iface.address;
          }
        });
      });
      resolve(networkInfo);
    });
  }

};
