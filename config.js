var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var dodoc  = require('./public/dodoc');
var path = require('path');

module.exports = function(app,express){
  app.set("port", 8080); //Server's port number
  app.set("views", __dirname + "/views"); //Specify the views folder
  app.set("view engine", "jade"); //View engine is Jade

  app.use(path.join('/', dodoc.publicationTemplateDir), express.static(path.join(__dirname, dodoc.publicationTemplateDir)));
  app.use(express.static(path.join(__dirname, dodoc.contentDir))); 
  app.use(express.static(path.join(__dirname, "public")));

  //app.use(express.bodyParser()); //Tells server to support JSON, urlencoded, and multipart requests
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
//   app.use(favicon(__dirname + '/public/images/favicon.ico'));
}