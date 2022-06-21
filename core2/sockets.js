// const dev = require("./dev-log"),
//   api = require("./api"),
//   auth = require("./auth"),
//   exporter = require("./exporter"),
//   file = require("./file"),
//   changelog = require("./changelog"),
//   access = require("./access");

// const bcrypt = require("bcryptjs");
const dev = require("./dev-log"),
  notifier = require("./notifier"),
  sessionStore = require("./sessionStore");

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
        dev.logsockets(`initSessionID`);
        const { sessionID, userID } = sessionStore.get({
          sessionID: socket.handshake.auth.sessionID,
        });
        socket.sessionID = sessionID;
        socket.userID = userID;
      } catch (err) {
        dev.error(err);
        return next(err);
      }

      dev.logverbose({ sessions: sessionStore.findAllSessions() });

      next();
    });

    io.on("connection", async (socket) => {
      dev.logsockets(`RECEIVED CONNECTION FROM SOCKET.id: ${socket.id}`);

      dev.logsockets({
        sessionID: socket.sessionID,
        userID: socket.userID,
      });

      // persist session
      // see https://github.com/socketio/socket.io/blob/992c9380c34b9a67c03dd503c26d008836f2899b/examples/private-messaging/server/index.js
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        connected: true,
      });

      // rejoin rooms indicated in session

      // emit session details
      socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
      });

      const sockets = await io.fetchSockets();
      dev.logsockets(
        `Sockets connected currently : ${Object.keys(sockets).length}`
      );

      let ip = "";
      if (socket.handshake) {
        if (socket.handshake.headers && socket.handshake.headers["x-real-ip"]) {
          // need to add the following to nginx .conf
          // proxy_set_header X-Real-IP $remote_addr;
          ip = socket.handshake.headers["x-real-ip"];
        } else if (socket.handshake.address) {
          ip = socket.handshake.address;
        }
      }

      let user_agent = "";
      if (
        socket.handshake &&
        socket.handshake.headers &&
        socket.handshake.headers["user-agent"]
      )
        user_agent = socket.handshake.headers["user-agent"];

      // access.append({
      //   ip,
      //   user_agent,
      // });
      socket._data = {};

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

      socket.on("joinRoom", ({ room }) => {
        dev.logsockets(`socket ${socket.id} is joining ${room}`);
        socket.join("content/" + room);

        roomStatus(socket);
      });
      socket.on("leaveRoom", ({ room }) => {
        dev.logsockets(`socket ${socket.id} is leaving ${room}`);
        socket.leave("content/" + room);

        roomStatus(socket);
      });
      socket.on("disconnect", () => {
        dev.logsockets(`user ${socket.id} disconnected`);
      });
    });

    // https://socket.io/fr/docs/v3/emit-cheatsheet/
    notifier.on("createFolder", (room, content) => {
      io.to("content/" + room).emit("createFolder", content);
    });
    notifier.on("updateFolder", (room, content) => {
      io.to("content/" + room).emit("updateFolder", content);
    });
    notifier.on("removeFolder", (room, content) => {
      io.to("content/" + room).emit("removeFolder", content);
    });

    notifier.on("newFile", (room, content) => {
      io.to("content/" + room).emit("newFile", content);
    });
    notifier.on("updateFile", (room, content) => {
      io.to("content/" + room).emit("updateFile", content);
    });
    notifier.on("removeFile", (room, content) => {
      io.to("content/" + room).emit("removeFile", content);
    });
  }

  function roomStatus(socket) {
    dev.logverbose("rooms");
    for (const [key, value] of socket.adapter.rooms) {
      if (key.startsWith("content/"))
        dev.logverbose(
          key + " = " + JSON.stringify(Array.from(value.entries()))
        );
    }
  }

  return API;
})();
