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
  app.get("/:session", getFolder);
  app.get("/:session/:projet", getProject);
  app.get("/:session/:projet/capture", getCapture);
  app.get("/:session/:projet/bibliotheque/medias", getBibli);
  app.get("/:session/:projet/bibliotheque/panneau-de-publications", getBibliPubli);
  app.get("/:session/:projet/publication/:publi", getPubli);

  app.post("/:session/:projet/bibliotheque/medias/file-upload", multipartMiddleware, postFile);


  /**
  * routing functions
  */

  // GET
  function getIndex(req, res) {
    res.render("index", {title : "Do.Doc"});
  };

  function getFolder(req, res) {
    var session = req.param('session');
    var json = readJsonFile('sessions/'+ session + '/' + session + '.json');
    res.render("projets", {
      title : "Projets",
      session: session,
      folder: json.name,
      statut : json.statut,
      url: req.path
    });
  };

  function getProject(req, res) {
    var session = req.param('session');
    var projet = req.param('projet');
    var jsonDossier= readJsonFile('sessions/'+ session + '/' + session + '.json');
    var jsonProjet = readJsonFile('sessions/'+ session + '/' + projet + '/' + projet + '.json');
    res.render("projet", {
      title : "Projet",
      session: session,
      folder: jsonDossier.name,
      statut : jsonDossier.statut,
      projet : projet,
      projectName: jsonProjet.name,
      url: req.path
    });
  };

  function getCapture(req, res) {
    var session = req.param('session');
    var projet = req.param('projet');
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
    var projet = req.param('projet');
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
    var projet = req.param('projet');
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
    var projet = req.param('projet');
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
    var projet = req.param('projet');
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


  function readJsonFile(file){
    var jsonObj = JSON.parse(fs.readFileSync(file, 'utf8'));
    return jsonObj;
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
