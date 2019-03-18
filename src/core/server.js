var express = require('express');

var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
const compression = require('compression');

var dev = require('./dev-log');

const sockets = require('./sockets'),
  setup_realtime_collaboration = require('./server-realtime_text_collaboration.js');

module.exports = function(router) {
  dev.logverbose('Starting server 1');

  const app = express();

  app.use(compression());

  // only for HTTPS, works without asking for a certificate
  const privateKeyPath = !!global.settings.privateKeyPath
    ? global.settings.privateKeyPath
    : path.join(__dirname, 'ssl', 'file.pem');

  const certificatePath = !!global.settings.certificatePath
    ? global.settings.certificatePath
    : path.join(__dirname, 'ssl', 'file.crt');

  const options = {
    key: fs.readFileSync(privateKeyPath),
    cert: fs.readFileSync(certificatePath)
  };

  if (
    global.settings.protocol === 'https' &&
    global.settings.redirect_port !== ''
  ) {
    // redirect from http (port 80) to https (port 443) for example
    http
      .createServer((req, res) => {
        res.writeHead(301, {
          Location: 'https://' + req.headers['host'] + req.url
        });
        res.end();
      })
      .listen(global.settings.redirect_port);
  }

  let server =
    global.settings.protocol === 'https'
      ? https.createServer(options, app)
      : http.createServer(app);

  var io = require('socket.io').listen(server);

  dev.logverbose('Starting server 2');
  sockets.init(app, io);

  dev.logverbose('Starting express-settings');

  app.set('port', global.appInfos.port); //Server's port number
  app.set('views', global.appRoot); //Specify the views folder
  app.set('view engine', 'pug'); //View engine is Pug

  app.use(function(req, res, next) {
    if (isURLToForbiddenFiles(req.url)) {
      res.status(404).send(`Access not allowed.`);
    } else {
      next();
    }
  });
  app.use(express.static(global.pathToUserContent));
  app.use(express.static(path.join(global.appRoot, 'public')));
  app.use(
    express.static(path.join(global.appRoot, global.settings.cacheDirname))
  );

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.locals.pretty = true;

  // setup_realtime_collaboration(server);
  router(app);

  server.listen(app.get('port'), () => {
    dev.log(
      `Server up and running. ` +
        `Go to ${global.settings.protocol}://${global.settings.host}:${
          global.appInfos.port
        }`
    );
    dev.log(` `);
  });
};

function isURLToForbiddenFiles(url) {
  return url.includes(global.settings.metaFileext);
}
