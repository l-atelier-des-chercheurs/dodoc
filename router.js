var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');
var path = require("path");
var fs = require('fs-extra');
var ffmpeg = require('fluent-ffmpeg');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var dodoc  = require('./dodoc');

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





  // GET
  function getIndex(req, res) {
    res.render("index", {
      "pageTitle" : "Do.Doc",
    });
  };

  function getFolder(req, res) {
    var slugFolderName = req.param('folder');
    var jsonFileOfFolder = getJsonFileOfFolder( slugFolderName);
    var folderData = readJsonFile( jsonFileOfFolder);

    res.render("folder", {
      "pageTitle" : dodoc.nameOfFolder + " | " + folderData.name,
      "folder" : slugFolderName,
      "folderName" : folderData.name,
      "statut" : folderData.statut,
      "url" : req.path
    });
  };

  function getProject(req, res) {
    var slugFolderName = req.param('folder');
    var jsonFileOfFolder = getJsonFileOfFolder( slugFolderName);
    var folderData = readJsonFile( jsonFileOfFolder);

    var slugProjectName = req.param('project');
    var projectPath = getProjectPath( slugFolderName, slugProjectName)
    var jsonFileOfProject = getJsonFileOfProject( projectPath);
    var projectData = readJsonFile( jsonFileOfProject);

    res.render("project", {
      "pageTitle" : dodoc.nameOfProject + " | " + projectData.name,
      "folder" : slugFolderName,
      "folderName" : folderData.name,
      "statut" : folderData.statut,
      "project" : slugProjectName,
      "projectName" : projectData.name,
      "url" : req.path
    });
  };

  function getCapture(req, res) {
    var session = req.param('session');
    var projet = req.param('project');
    var jsonDossier= readJsonFile('sessions/'+ session + '/' + session + '.json');
    var jsonProjet = readJsonFile('sessions/'+ session + '/' + projet + '/' + projet + '.json');
    res.render("capture", {
      title : "Prise de vue",
      session: session,
      folder: jsonDossier.name,
      statut : jsonDossier.statut,
      projet : projet,
      projectName: jsonProjet.name,
      url: req.path
    });
  };

  function getBibli(req, res) {
    var session = req.param('session');
    var projet = req.param('project');
    var jsonDossier= readJsonFile('sessions/'+ session + '/' + session + '.json');
    var jsonProjet = readJsonFile('sessions/'+ session + '/' + projet + '/' + projet + '.json');
    res.render("bibli", {
      title : "Bibliotheque de médias",
      session: session,
      folder: jsonDossier.name,
      statut : jsonDossier.statut,
      projet : projet,
      projectName: jsonProjet.name,
      url: req.path,
    });
  };

  function getBibliPubli(req, res) {
    var session = req.param('session');
    var projet = req.param('project');
    var jsonDossier= readJsonFile('sessions/'+ session + '/' + session + '.json');
    var jsonProjet = readJsonFile('sessions/'+ session + '/' + projet + '/' + projet + '.json');
    res.render("bibli", {
      title : "Bibliotheque de médias",
      session: session,
      folder: jsonDossier.name,
      statut : jsonDossier.statut,
      projet : projet,
      projectName: jsonProjet.name,
      url: req.path,
    });
  };

  function getPubli(req, res) {
    var session = req.param('session');
    var projet = req.param('project');
    var publi = req.param('publi');
    var jsonDossier= readJsonFile('sessions/'+ session + '/' + session + '.json');
    var jsonProjet = readJsonFile('sessions/'+ session + '/' + projet + '/' + projet + '.json');
    var jsonPubli = readJsonFile('sessions/'+ session + '/' + projet + '/montage/'+publi+'.json');
    res.render("publi", {
      title : "Publication",
      session : session,
      folder: jsonDossier.name,
      projet : projet,
      projectName: jsonProjet.name,
      publi: publi,
      publiName: jsonPubli.name,
      url: req.path
    });
  };

  function postFile(req, res) {
    var date = Date.now();
    var ext = path.extname(req.files.file.name);
    var session = req.param('session');
    var projet = req.param('project');
    var dir =  'sessions/'+ session + '/' + projet;
    fs.readFile(req.files.file.path, function (err, data) {
      var newPath = 'sessions/'+ session + '/' + projet + '/' + date + ext;
      if(ext == ".webm" || ext == ".ogg" || ext == ".mov" || ext == ".mp4"){
        createThumnails(newPath, date, dir)
      }
      fs.writeFile(newPath, data, function (err) {
        res.redirect("back");
        io.sockets.emit("newMediaUpload", {path: newPath, fileName: date+ext, ext:ext, id: date});
      });
    });
  };


  function readJsonFile( jsonFile){
    var jsonFileContent = fs.readFileSync(jsonFile, 'utf8');
    var jsonFileContentParsed = JSON.parse( jsonFileContent);
    return jsonFileContentParsed;
  }

  function createThumnails(path, fileName, dir){
    var proc = ffmpeg(path)
    // setup event handlers
    .on('end', function(files) {
      console.log('screenshots were saved as ' + fileName + "-thumb.png");
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message);
    })
    // take 2 screenshots at predefined timemarks
    .takeScreenshots({ count: 1, timemarks: [ '00:00:01'], filename: fileName + "-thumb.png"}, dir);
  }





};
