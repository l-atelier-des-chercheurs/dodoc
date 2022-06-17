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
      dev.logsockets(`CONNECTION ALLOWED`);
      next();
      // } else {
      //   dev.error(`CONNECTION DENIED`);
      //   next(new Error("Authentication error"));
      // }
    });

    io.on("connection", async (socket) => {
      dev.logsockets(`RECEIVED CONNECTION FROM SOCKET.id: ${socket.id}`);

      const sockets = await io.fetchSockets();
      dev.logsockets(
        `Clients connected currently : ${Object.keys(sockets).length}`
      );

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
        dev.logsockets(`socket ${socket.id} is joining ${room}`);
        socket.join(room);

        roomStatus(socket);
      });
      socket.on("leaveRoom", ({ room }) => {
        dev.logsockets(`socket ${socket.id} is leaving ${room}`);
        socket.leave(room);

        roomStatus(socket);
      });
      socket.on("disconnect", () => {
        dev.logsockets(`user ${socket.id} disconnected`);
      });
    });

    // https://socket.io/fr/docs/v3/emit-cheatsheet/
    notifier.on("createFolder", (room, content) => {
      io.to(room).emit("createFolder", content);
    });
    notifier.on("updateFolder", (room, content) => {
      io.to(room).emit("updateFolder", content);
    });
    notifier.on("removeFolder", (room, content) => {
      io.to(room).emit("removeFolder", content);
    });

    notifier.on("newFile", (room, content) => {
      io.to(room).emit("newFile", content);
    });
    notifier.on("updateFile", (room, content) => {
      io.to(room).emit("updateFile", content);
    });
    notifier.on("removeFile", (room, content) => {
      io.to(room).emit("removeFile", content);
    });

    io.on("*", (event, data) =>
      dev.logsockets(`RECEIVED EVENT: ${event} with data.length ${data.length}`)
    );
  }

  function roomStatus(socket) {
    for (const [key, value] of socket.adapter.rooms) {
      console.log(key + " = " + JSON.stringify(Array.from(value.entries())));
    }
  }

  return API;
})();
