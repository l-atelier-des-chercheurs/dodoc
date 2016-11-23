var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var path = require('path');

var dodoc  = require('./dodoc');
try {
  // root config.json is specific to electron
  var config = require('../config.json');
} catch( err) {
  // local config.json is for node
  var config = require('./config.json');
}

module.exports = function(app, express) {
  app.set("port", config.port); //Server's port number
  app.set("views", path.join(__dirname, "views")); //Specify the views folder
  app.set("view engine", config.templateEngine); //View engine is Jade

  app.use(express.static(global.userDirname));
  app.use(express.static(path.join(global.userDirname, dodoc.contentDirname)));
  app.use(express.static(path.join(__dirname, "client")));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
}