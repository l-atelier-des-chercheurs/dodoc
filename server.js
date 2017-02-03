var express = require("express");
var http = require('http');
var https = require('https');
var fs = require('fs');
var io = require('socket.io');
var path = require('path');
var dev = require('./bin/dev-log');

// var localtunnel = require('localtunnel');
// var ngrok = require('ngrok');

var config = require('./config.json');

module.exports = function(electronApp) {
  dev.logverbose('Starting server');

  var app = express();
  // works without asking for a certificate
  const privateKey  = fs.readFileSync(path.join(__dirname, 'ssl', 'file.pem'), 'utf8');
  const certificate = fs.readFileSync(path.join(__dirname, 'ssl', 'file.crt'), 'utf8');
  const options = { key: privateKey, cert: certificate };

/*
  var tunnel = localtunnel('8080', {'local_host': 'http://localhost'}, function(err, tunnel) {
  if (err) dev.error('Localtunnel error: ' + err);
    dev.log('Tunnel URL: ' + tunnel.url);
  });
  tunnel.on('close', function() {
  });
*/
/*
  config.protocol = 'http';
  ngrok.connect({
    proto: 'http', // http|tcp|tls
    addr: 8080, // port or network address
    region: 'eu' // one of ngrok regions (us, eu, au, ap), defaults to us
  }, function (err, url) {
    if(err) {
      dev.error('NGROK error: ');
      dev.log(err);
    }
    dev.log('NGROK url : ' + url);
  });
*/


  if( config.protocol === 'http')
    var server = http.createServer(app);
  else if( config.protocol === 'https')
    var server = https.createServer(options, app);

  var io = require("socket.io").listen(server);

  var sockets = require('./sockets');
  var expressSettings = require('./express-settings');
  var router = require('./router');

  var m = sockets.init(app, io, electronApp);

  /*
  * Server config
  */
  expressSettings(app, express);

  /**
  * Server routing and io events
  */
  router(app, io, m);


  /**
  * Start the http server at port and IP defined before
  */

  server.listen(
    app.get("port"), function() {
      dev.log(`Server up and running. Go to ${config.protocol}://${config.host}:${config.port}`);
      dev.log(' ');

      process.on('unhandledRejection', function(reason, p) {
        dev.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
          // application specific logging, throwing an error, or other logic here
      });
    }
  );
}
