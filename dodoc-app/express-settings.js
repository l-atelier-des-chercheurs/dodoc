var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var dodoc  = require('./public/dodoc');
var path = require('path');
var config = require('./config.json');

module.exports = function(app, express) {
  app.set("port", config.port); //Server's port number
  app.set("views", path.join(__dirname, "views")); //Specify the views folder
  app.set("view engine", config.templateEngine); //View engine is Jade

  app.use(path.join('/', dodoc.publicationTemplateDir), express.static(path.join(__dirname, dodoc.publicationTemplateDir)));
  app.use(express.static(path.join(__dirname, dodoc.contentDir)));
  app.use(express.static(path.join(__dirname, "public")));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
}