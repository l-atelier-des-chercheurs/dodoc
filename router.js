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
  app.get("/:session/:projet/capture", getCapture);
  app.get("/:session/:projet/bibliotheque", getBibli);
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
    var folderPath = 'sessions/'+session;

    //fs.ensureDirSync(folderPath);
    res.render("projets", {
      title : "Projets",
      session: session,
      folder : convertToSlug(session)
    });
  };

  function getCapture(req, res) {
    var session = req.param('session');
    var projet = req.param('projet');
    res.render("capture", {
      title : "Prise de vue",
      session : session,
      projet : projet,
    });
  };

  function getBibli(req, res) {
    var session = req.param('session');
    var projet = req.param('projet');
    res.render("bibli", {
      title : "Bibliotheque de médias",
      session : session,
      projet : projet,
    });
  };

  function getPubli(req, res) {
    var session = req.param('session');
    var projet = req.param('projet');
    var publi = req.param('publi');
    res.render("publi", {
      title : "Publication",
      session : session,
      projet : projet,
      publi: publi
    });
  };

  // function getFlux(req, res) {
  //   var session = req.param('session');
  //   var projet = req.param('projet');
  //   var sessionPath = 'sessions/'+session;

  //   fs.ensureDirSync(sessionPath);

  //   res.render("flux", {
  //     title : "Dodoc Flux",
  //     session : session,
  //     sessionFormat : session.replace(/_/g," "),
  //     projet : projet,
  //     projetFormat : projet.replace(/_/g," "),
  //   });
  // };


  // function getPubli(req, res) {
  //   var session = req.param('session');
  //   var projet = req.param('projet');
  //   var sessionPath = 'sessions/'+session;

  //   res.render("publication", {
  //     title : "Publication",
  //     session : session,
  //     sessionFormat : session.replace(/_/g," "),
  //     projet : projet,
  //     projetFormat : projet.replace(/_/g," "),
  //   });
  // };

  //helpers
    function convertToSlug(Text){
    var noHyphen = Text.replace(/-/g," ")
    return noHyphen
    .charAt(0).toUpperCase()+ noHyphen.slice(1)
    ;
  }
};
