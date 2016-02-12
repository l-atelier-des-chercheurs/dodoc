var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');
var i18n = require('i18n');

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

  function readJsonFile(file){
    var jsonObj = JSON.parse(fs.readFileSync(file, 'utf8'));
    return jsonObj;
  }

};
