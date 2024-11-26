// const dev = require("./dev-log"),
//   api = require("./api"),
//   auth = require("./auth"),
//   exporter = require("./exporter"),
//   file = require("./file"),
//   changelog = require("./changelog"),
//   access = require("./access");

// TODO : make changelog, and access modules

const dev = require("./dev-log"),
  notifier = require("./notifier"),
  sessionStore = require("./sessionStore"),
  users = require("./users"),
  { v4: uuidv4 } = require("uuid");

module.exports = (function () {
  dev.log(`Sockets module initialized`);
  let io;

  const API = {
    init: (io) => init(io),
  };

  function init(_io) {
    io = _io;

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
        let meta = {};
        if (token_path) meta.token_path = token_path;
        const user = users.addUser(socket.userID, meta);
        if (user) notifier.emit("newUser", user);
      } catch (err) {
        dev.error(err);
        return next(err);
      }

      next();
    });

    io.on("connection", async (socket) => {
      const { sessionID, userID } = socket;
      dev.logsockets(`RECEIVED CONNECTION with sessionID: ${sessionID}`);

      let ip =
        socket.handshake?.headers?.["x-real-ip"] || socket.handshake?.address;
      let user_agent = socket.handshake?.headers?.["user-agent"];

      // persist session, see https://github.com/socketio/socket.io/blob/992c9380c34b9a67c03dd503c26d008836f2899b/examples/private-messaging/server/index.js
      sessionStore.updateSession(sessionID, {
        connected: true,
        ip,
        user_agent,
      });
      let meta = {
        ip,
        user_agent,
      };
      const user = users.updateUser(userID, meta);
      if (user) notifier.emit("updateUser", user);

      socket.emit("session", {
        sessionID,
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
        console.log("disconnect");
        sessionStore.updateSession(sessionID, {
          connected: false,
        });
        users.removeUser(userID);
        notifier.emit("removeUser", userID);
      });
    });

    // https://socket.io/fr/docs/v3/emit-cheatsheet/
    // todo bypass:
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

    notifier.on("newUser", (user) => {
      io.to("users").emit("newUser", user);
    });
    notifier.on("updateUser", (user) => {
      io.to("users").emit("updateUser", user);
    });
    notifier.on("removeUser", (id) => {
      io.to("users").emit("removeUser", { id });
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
