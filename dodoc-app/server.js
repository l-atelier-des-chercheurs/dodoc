module.exports = function() {
  var express = require("express");
  var http = require('http');
  var https = require('https');
  var fs = require('fs');
  var io = require('socket.io');
  var path = require('path');

  var app = express();

  var privateKey  = fs.readFileSync(path.join(__dirname, 'file.pem'), 'utf8');
  var certificate = fs.readFileSync(path.join(__dirname, 'file.crt'), 'utf8');

  //create https server
  var credentials = { key: privateKey, cert: certificate };
  var httpsServer = http.createServer(app);
  var io = require("socket.io").listen(httpsServer);

  var dodoc = require('./public/dodoc.js');
  var main = require('./main');
  var config = require('./config');
  var router = require('./router');

  var m = new main(app, io);


  /*
  * Server config
  */
  config(app, express);

  /**
  * Server routing and io events
  */
  router(app, io, m);


  /**
  * Start the http server at port and IP defined before
  */

  httpsServer.listen(
    app.get("port"), function() {
      console.log("Server up and running. Go to http://localhost:" + app.get("port"));
    }
  );
}
