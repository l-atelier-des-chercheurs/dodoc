// const dev = require("./dev-log"),
//   api = require("./api"),
//   auth = require("./auth"),
//   exporter = require("./exporter"),
//   file = require("./file"),
//   changelog = require("./changelog"),
//   access = require("./access");

// TODO : make changelog, and access modules
const { Server } = require("socket.io"),
  { v4: uuidv4 } = require("uuid");

const dev = require("./dev-log"),
  notifier = require("./notifier"),
  sessionStore = require("./sessionStore"),
  users = require("./users");

module.exports = (function () {
  let io;

  const API = {
    init: (server) => init(server),
  };

  function init(server) {
    dev.log(`Sockets module initialized`);
    io = new Server(server, {
      cookie: false,
      serveClient: false,
    });
    users.init(io);

    io.use(function (socket, next) {
      // if (
      //   auth.isSubmittedSessionPasswordValid(
      //     socket.handshake.query.hashed_session_password
      //   )
      // ) {
      // } else {
      //   dev.error(`CONNECTION DENIED`);
      //   next(new Error("Authentication error"));
      // }

      // check if socket has a session_id
      // if it does, check if it matches one in the store
      // if it does, return what's in the store
      // else create a session ID

      try {
        dev.log(`initSessionID`);

        const { sessionID: _sID, token_path } = socket.handshake.auth;

        const sessionID = sessionStore.getOrCreate(_sID);
        socket.sessionID = sessionID;
        socket.userID = uuidv4();
        if (token_path) socket.token_path = token_path;
      } catch (err) {
        dev.error(err);
        return next(err);
      }

      next();
    });

    io.on("connection", async (socket) => {
      const { sessionID, userID, token_path } = socket;
      dev.logsockets(`RECEIVED CONNECTION with sessionID: ${sessionID}`);

      // let ip = socket.handshake?.headers?.["x-real-ip"] || socket.handshake?.address;
      let user_agent = socket.handshake?.headers?.["user-agent"];

      // persist session, see https://github.com/socketio/socket.io/blob/992c9380c34b9a67c03dd503c26d008836f2899b/examples/private-messaging/server/index.js
      sessionStore.updateSession(sessionID, {
        connected: true,
      });

      let meta = {
        user_agent,
      };
      if (token_path) meta.token_path = token_path;
      const user = users.addUser(userID, meta);
      if (user) notifier.emit("userJoined", user);

      socket.emit("session", {
        sessionID,
        userID,
      });

      var onevent = socket.onevent;
      socket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call(this, packet); // original call
        packet.data = ["*"].concat(args);
        onevent.call(this, packet); // additional call to catch-all
      };
      // socket.on("*", (event, data) =>
      //   dev.logsockets(
      //     `RECEIVED EVENT: ${event} with data.length ${data.length}`
      //   )
      // );

      socket.on("trackUsers", () => {
        socket.join("users");
      });
      socket.on("leaveUsers", () => {
        socket.leave("users");
      });

      socket.on("joinRoom", ({ room, token, token_path }) => {
        dev.logrooms(`ROOMS — socket ${socket.id} is joining ${room}`);
        socket.join("content/" + room);

        // todo check if token is allowed to join room, first by checking checkTokenValidity
        // then by checking if room is private or not, and if it is, checking if token is allowed
        // see _restrictIfPrivate
        // roomStatus(socket);
      });
      socket.on("leaveRoom", ({ room }) => {
        dev.logrooms(`ROOMS — socket ${sessionID} is leaving ${room}`);
        socket.leave("content/" + room);
      });
      socket.on("disconnect", async () => {
        sessionStore.updateSession(sessionID, {
          connected: false,
        });
        users.userLeft(userID);
        notifier.emit("userLeft", userID);
      });
    });

    notifier.on("folderCreated", (room, content) => {
      io.to("content/" + room).emit("folderCreated", content);
    });
    notifier.on("folderUpdated", (room, content) => {
      io.to("content/" + room).emit("folderUpdated", content);
    });
    notifier.on("folderRemoved", (room, content) => {
      io.to("content/" + room).emit("folderRemoved", content);
    });

    notifier.on("fileCreated", (room, content) => {
      io.to("content/" + room).emit("fileCreated", content);
    });
    notifier.on("fileUpdated", (room, content) => {
      io.to("content/" + room).emit("fileUpdated", content);
    });
    notifier.on("fileRemoved", (room, content) => {
      io.to("content/" + room).emit("fileRemoved", content);
    });

    notifier.on("adminSettingsUpdated", (room, content) => {
      io.to("content/" + room).emit("adminSettingsUpdated", content);
    });

    notifier.on("taskStatus", (room, content) => {
      io.to("content/" + room).emit("taskStatus", content);
    });
    notifier.on("taskEnded", (room, content) => {
      io.to("content/" + room).emit("taskEnded", content);
    });

    notifier.on("userJoined", (user) => {
      io.to("users").emit("userJoined", user);
    });
    notifier.on("userUpdated", (content) => {
      io.to("users").emit("userUpdated", content);
    });
    notifier.on("userLeft", (id) => {
      io.to("users").emit("userLeft", id);
    });
  }

  function roomStatus(socket) {
    dev.logrooms("ROOMS — status");
    for (const [key, value] of socket.adapter.rooms) {
      if (key.startsWith("content/"))
        dev.logrooms(key + " = " + JSON.stringify(Array.from(value.entries())));
    }
  }

  return API;
})();
