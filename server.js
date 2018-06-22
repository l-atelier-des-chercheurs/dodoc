var express = require('express');
var https = require('https');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
const compression = require('compression');

var dev = require('./core/dev-log');

// var localtunnel = require('localtunnel');
// var ngrok = require('ngrok');

const sockets = require('./core/sockets'),
  router = require('./router'),
  settings = require('./settings.json');

module.exports = function(electronApp) {
  dev.logverbose('Starting server 1');

  var app = express();
  app.use(compression());

  // only for HTTPS, works without asking for a certificate
  const privateKey = fs.readFileSync(
    path.join(__dirname, 'ssl', 'file.pem'),
    'utf8'
  );
  const certificate = fs.readFileSync(
    path.join(__dirname, 'ssl', 'file.crt'),
    'utf8'
  );
  const options = { key: privateKey, cert: certificate };

  let server = https.createServer(options, app);
  var io = require('socket.io').listen(server);
  dev.logverbose('Starting server 2');

  var m = sockets.init(app, io, electronApp);

  dev.logverbose('Starting express-settings');

  app.set('port', global.appInfos.port); //Server's port number
  app.set('views', __dirname); //Specify the views folder
  app.set('view engine', 'pug'); //View engine is Pug

  app.use(function(req, res, next) {
    if (isURLToForbiddenFiles(req.url)) {
      res.status(404).send(`Access not allowed.`);
    } else {
      next();
    }
  });
  app.use(express.static(global.pathToUserContent));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, settings.cacheDirname)));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.locals.pretty = true;

  router(app, io, m);

  server.listen(app.get('port'), () => {
    dev.log(
      `Server up and running. ` +
        `Go to ${settings.protocol}://${settings.host}:${global.appInfos.port}`
    );
    dev.log(` `);
  });
};

function isURLToForbiddenFiles(url) {
  return url.includes(settings.metaFileext);
}
