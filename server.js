var express = require("express");
var app     = express();
var http    = require("http").createServer(app);
var https = require('https');
var fs = require('fs');
var privateKey  = fs.readFileSync('file.pem', 'utf8');
var certificate = fs.readFileSync('file.crt', 'utf8');

//create https server
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);
var io      = require("socket.io").listen(httpsServer);

var dodoc  = require('./public/dodoc.js');
var main    = require('./main');
var config  = require('./config');
var router  = require('./router');

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
httpsServer.listen(app.get("port"), function() {
  console.log("Server up and running. Go to https://localhost:" + app.get("port"));
});
