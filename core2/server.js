var express = require("express");

var http = require("http");
var https = require("https");
var fs = require("fs");
var path = require("path"),
  compression = require("compression");
const { Server } = require("socket.io");

const sockets = require("./sockets"),
  api2 = require("./api2"),
  serverRTC = require("./serverRTC.js");

module.exports = function () {
  dev.logverbose("Starting server 1");

  const app = express();

  app.use(compression());

  // only for HTTPS, works without asking for a certificate
  const options = {
    key: fs.readFileSync(
      global.settings.privateKeyPath ||
        path.join(__dirname, "ssl", "selfsigned.key")
    ),
    cert: fs.readFileSync(
      global.settings.certificatePath ||
        path.join(__dirname, "ssl", "selfsigned.crt")
    ),
    passphrase: global.settings.passphrase || "",
  };

  if (
    global.settings.protocol === "https" &&
    global.settings.redirect_port !== ""
  ) {
    // redirect from http (port 80) to https (port 443) for example
    http
      .createServer((req, res) => {
        res.writeHead(301, {
          Location: "https://" + req.headers["host"] + req.url,
        });
        res.end();
      })
      .listen(global.settings.redirect_port);
  }

  let server =
    global.settings.protocol === "https"
      ? https.createServer(options, app)
      : http.createServer(app);

  const io = new Server(server, {
    cookie: false,
    serveClient: false,
  });

  dev.logverbose("Starting server 2");
  sockets.init(io);

  dev.logverbose("Starting express-settings");

  app.set("port", global.appInfos.port); //Server's port number
  app.set("views", global.appRoot); //Specify the views folder
  app.set("view engine", "pug"); //View engine is Pug

  // app.use(function (req, res, next) {
  // if (req.url.includes(".txt")) res.status(403).send(`Access not allowed.`);
  // else next();
  // });

  app.use(express.static(global.pathToUserContent));
  app.use(
    "/_client",
    express.static(path.join(global.appRoot, "client", "dist"))
  );
  // not used yet
  // app.use(
  //   "/_cache",
  //   express.static(path.join(global.appRoot, global.settings.cacheDirname))
  // );
  app.use("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("");
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); // To parse the incoming requests with JSON payloads
  app.locals.pretty = true;

  serverRTC(server);
  api2.init(app);

  dev.logverbose("Starting server 3");

  server.listen(app.get("port"), () => {
    dev.log(
      `Server up and running. ` +
        `Go to ${global.settings.protocol}://${global.settings.host}:${global.appInfos.port}`
    );
    dev.log(` `);
  });
};
