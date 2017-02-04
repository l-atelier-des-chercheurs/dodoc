var bodyParser = require('body-parser');
var path = require('path');

var dodoc  = require('./dodoc');
var config = require('./config.json');
var dev = require('./bin/dev-log');

module.exports = function(app, express) {
  dev.logverbose('Starting express-settings');

  app.set("port", config.port); //Server's port number
  app.set("views", path.join(__dirname, "views")); //Specify the views folder
  app.set("view engine", config.templateEngine); //View engine is Jade

  app.use(express.static(global.pathToUserContent));
  app.use(express.static(path.join(global.pathToUserContent, dodoc.settings().contentDirname)));
  app.use(express.static(path.join(__dirname, "client")));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
}