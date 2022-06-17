// const dev = require("./dev-log"),
//   api = require("./api"),
//   auth = require("./auth"),
//   exporter = require("./exporter"),
//   file = require("./file"),
//   changelog = require("./changelog"),
//   access = require("./access");

// const bcrypt = require("bcryptjs");
const dev = require("./dev-log");
const notifier = require("./notifier");

module.exports = (function () {
  dev.log(`Sockets module initialized`);
  let app;
  let io;

  const API = {
    init: (app, io) => init(app, io),
  };

  function init(io) {
    io.use(function (socket, next) {
      // if (
      //   auth.isSubmittedSessionPasswordValid(
      //     socket.handshake.query.hashed_session_password
      //   )
      // ) {
      dev.log(`CONNECTION ALLOWED`);
      next();
      // } else {
      //   dev.error(`CONNECTION DENIED`);
      //   next(new Error("Authentication error"));
      // }
    });

    io.on("connection", async (socket) => {
      dev.log(`RECEIVED CONNECTION FROM SOCKET.id: ${socket.id}`);

      const sockets = await io.fetchSockets();
      dev.log(`Clients connected currently : ${Object.keys(sockets).length}`);

      // setTimeout(() => {
      // socket.emit("msg", "hello world");
      // }, 2000);

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

      socket.on("joinRoom", ({ room }) => {
        dev.logpackets(`socket ${socket.id} is joining ${room}`);
        socket.join(room);
      });
      socket.on("leaveRoom", ({ room }) => {
        dev.logpackets(`socket ${socket.id} is leaving ${room}`);
        socket.leave(room);
      });
      socket.on("disconnect", () => {
        console.log(`user ${socket.id} disconnected`);
      });
    });

    // https://socket.io/fr/docs/v3/emit-cheatsheet/
    notifier.on("createFolder", (path, content) => {
      io.to(path).emit("createFolder", content);
    });
    notifier.on("updateFolder", (path, content) => {
      // notify all connected
      io.to(path).emit("updateFolder", content);
    });
    notifier.on("removeFolder", (path, content) => {
      // notify all connected
      io.to(path).emit("removeFolder", content);
    });

    notifier.on("newFile", (content) => {
      // notify only those in the room
      io.in("").emit("newFile", content);
    });
    notifier.on("updateFile", (content) => {
      // notify only those in the room
      socket.emit("updateFile", content);
    });
    notifier.on("removeFile", (content) => {
      // notify only those in the room
      socket.emit("removeFile", content);
    });

    io.on("*", (event, data) => dev.log(`RECEIVED EVENT: ${event}`));
  }

  return API;
})();
