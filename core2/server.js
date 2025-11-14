var express = require("express");

var http = require("http");
var https = require("https");
var fs = require("fs");
var path = require("path"),
  compression = require("compression");
const helmet = require("helmet");
const slowDown = require("express-slow-down").default;

const sockets = require("./sockets"),
  api2 = require("./api2"),
  journal = require("./journal"),
  serverRTC = require("./serverRTC.js"),
  dev = require("./dev-log");
// cors_for_ressources = require("./cors_for_ressources"),

module.exports = function () {
  dev.logverbose("Starting server 1");

  const app = express();

  app.use(compression());

  app.use(
    helmet({
      // todo: set correct CSP
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "same-site" },
    })
  );

  // Rate limiting middleware, slow down API requests after the limit is reached
  const apiSpeedLimiter = slowDown({
    windowMs: 1 * 60 * 1000,
    delayAfter: 60,
    delayMs: () => 100,
    maxDelayMs: 1000,
    // keyGenerator: (req) => {
    //   // Use the proper IP address extraction for IPv6 compatibility
    //   return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    // },
  });
  // Apply rate limiting only to _api2 endpoints
  app.use("/_api2", apiSpeedLimiter);

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

  dev.logverbose("Starting server 2");
  sockets.init(server);

  dev.logverbose("Starting express-settings");

  app.set("port", global.appInfos.port); //Server's port number
  app.set("views", global.appRoot); //Specify the views folder
  app.set("view engine", "pug"); //View engine is Pug

  // prevent access to general admin and folders meta.txt
  app.use(function (req, res, next) {
    if (req.url.includes("/meta.txt"))
      res.status(403).send(`Access not allowed.`);
    // TODO: allow loading medias from domains that admin has allowed (set to ”domain1”, ”domain2”, ”domain3”, etc., or to "all")
    // else if (!(cors_for_ressources.allowed(req, res, next)))
    //   res.status(403).send(`Access not allowed.`);
    else next();
  });

  app.use(express.static(global.pathToUserContent));
  app.use(
    "/_client",
    express.static(path.join(global.appRoot, "client", "dist"))
  );

  // app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: "1mb" })); // To parse the incoming requests with JSON payloads
  app.locals.pretty = true;

  journal.log({
    message: "Server up and running",
    from: "server",
  });

  serverRTC(server);

  journal.log({
    message: "Server RTC initialized",
    from: "server",
  });

  api2.init(app);

  dev.logverbose("API ready");

  server.listen(app.get("port"), () => {
    const message = `Server up and running. Go to ${global.settings.protocol}://${global.settings.host}:${global.appInfos.port}`;
    dev.log(message);
    journal.log({
      message,
      from: "server",
    });
  });
};
