var fs = require('fs-extra');
var os = require('os');
var flags = require('flags');

var dodoc  = require('./dodoc');
var devLog = require('./bin/dev-log');
var dodocAPI = require('./bin/dodoc-api');
var dodocFolder = require('./bin/dodoc-folder');
var dodocProject = require('./bin/dodoc-project');
var dodocMedia = require('./bin/dodoc-media');
var dodocPubli = require('./bin/dodoc-publi');


module.exports = function(app,io,m){

  if(typeof global.dev === "undefined") {
    flags.defineBoolean('debug');
    flags.defineBoolean('verbose');
    flags.parse();
    var isDebugMode = flags.get('debug');
    var isVerbose = flags.get('verbose');
    global.dev = devLog( isDebugMode, isVerbose);
  }

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
  app.get("/:folder/:project/publications/:publi/print", getPrint);

  /**
  * routing functions
  */
  function generatePageData( req, pageTitle) {
    return new Promise(function(resolve, reject) {

      var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      console.log('—> the following page has been requested : ' + fullUrl);

      var pageDataJSON = [];
      pageDataJSON.contentDir = dodocAPI.getFolderPath();
      pageDataJSON.currentUserDirPath = dodocAPI.getFolderPath();

      var slugFolderName = req.param('folder');
      if( slugFolderName !== undefined) {
        var jsonFileOfFolder = dodocFolder.getMetaFileOfFolder( slugFolderName);
        var folderData = dodocAPI.readMetaFile(jsonFileOfFolder);

        pageDataJSON.slugFolderName = slugFolderName;
        pageDataJSON.folderName = folderData.name;
        pageDataJSON.statut = folderData.statut;
        pageDataJSON.currentUserDirPath = dodocAPI.getFolderPath(slugFolderName);

        var slugProjectName = req.param('project');
        if( slugProjectName !== undefined) {
          var jsonFileOfProject = dodocProject.getMetaFileOfProject(slugFolderName, slugProjectName);
          var projectData = dodocAPI.readMetaFile( jsonFileOfProject);

          pageDataJSON.slugProjectName = slugProjectName;
          pageDataJSON.projectName = projectData.name;
          pageDataJSON.currentUserDirPath = dodocAPI.getProjectPath(slugFolderName, slugProjectName);

          var slugPubliName = req.param('publi');
          if( slugPubliName !== undefined) {
            var jsonFileOfPubli = dodocPubli.getPubliPath( slugFolderName, slugProjectName, slugPubliName) + dodoc.metaFileext;
            var publiData = dodocAPI.readMetaFile( jsonFileOfPubli);

            pageDataJSON.slugPubliName = slugPubliName;
            pageDataJSON.publiName = publiData.name;
            pageDataJSON.publiTemplateName = publiData.template;
            pageDataJSON.currentUserDirPath = jsonFileOfPubli;
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
      pageDataJSON.isHttps = req.connection.encrypted;
      pageDataJSON.dodoc = dodoc;

      getLocalIP().then(function(localNetworkInfos) {
        pageDataJSON.localNetworkInfos = localNetworkInfos;
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
    }, function(err) {
      console.log('Err ' + err);
    });
  };

  function getFolder(req, res) {
    var pageTitle = dodoc.lang.folder;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      res.render("folder", generatePageDataJSON);
    }, function(err) {
      console.log('Err while getting folder data : ' + err);
    });
  };

  function getProject(req, res) {
    var pageTitle = dodoc.lang.project;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      res.render("project", generatePageDataJSON);
    }, function(err) {
      console.log('err ' + err);
    });
  };

  function getCapture(req, res) {
    var pageTitle = dodoc.lang.capture;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      res.render("capture", generatePageDataJSON);
    }, function(err) {
      console.log('err ' + err);
    });
  };

  function getBibli(req, res) {
    var pageTitle = dodoc.lang.bibli;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      dodocAPI.listAllTemplates().then(function(allTemplates) {
        generatePageDataJSON["templates"] = allTemplates;
        res.render("bibli", generatePageDataJSON);
      }, function(err) {
        console.log('err ' + err);
      });
    }, function(err) {
      console.log('err ' + err);
    });
  };

  function getBibliPubli(req, res) {
    getBibli(req, res);
  };

  function getPubli(req, res) {
    var pageTitle = dodoc.lang.publi;
    generatePageData(req, pageTitle).then(function(generatePageDataJSON) {
      dodocAPI.listAllTemplates().then(function(allTemplates) {
        generatePageDataJSON["templates"] = allTemplates;
        res.render("publi", generatePageDataJSON);
      }, function(err) {
        console.log('err ' + err);
      });
    }, function(err) {
      console.log('err ' + err);
    });
  };

  function getPrint(req, res){
    var htmlPrint = fs.readFileSync('app/index.html');
    res.render("print", {title: 'Print', htmlp: htmlPrint});
  };

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
