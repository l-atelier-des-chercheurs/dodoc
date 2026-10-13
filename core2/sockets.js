// const dev = require("./dev-log"),
//   api = require("./api"),
//   auth = require("./auth"),
//   exporter = require("./exporter"),
//   file = require("./file"),
//   changelog = require("./changelog"),
//   access = require("./access");

// TODO : make changelog, and access modules
const { Server } = require("socket.io"),
  { randomUUID } = require("crypto");

const dev = require("./dev-log"),
  api2 = require("./api2"),
  auth = require("./auth"),
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

        const { sessionID: _sID, token, token_path } = socket.handshake.auth;

        const sessionID = sessionStore.getOrCreate(_sID);
        socket.sessionID = sessionID;
        socket.userID = randomUUID();
        // only trust token_path if it comes with a valid token
        if (token && token_path) {
          try {
            auth.checkTokenValidity({ token, token_path, purpose: "auth" });
            socket.token = token;
            socket.token_path = token_path;
          } catch (err) {}
        }
      } catch (err) {
        dev.error(err);
        return next(err);
      }

      next();
    });

    io.on("connection", async (socket) => {
      const { sessionID, userID, token, token_path } = socket;
      dev.logsockets(`RECEIVED CONNECTION with sessionID: ${sessionID}`);

      // let ip = socket.handshake?.headers?.["x-real-ip"] || socket.handshake?.address;
      let user_agent = socket.handshake?.headers?.["user-agent"];

      // persist session, see https://github.com/socketio/socket.io/blob/992c9380c34b9a67c03dd503c26d008836f2899b/examples/private-messaging/server/index.js
      sessionStore.addSocketConnection(sessionID, userID);

      let meta = {
        // the device type is enough for presence, no need to share user_agent
        device: deviceFromUserAgent(user_agent),
        browser_id: sessionStore.getBrowserID(sessionID),
      };
      // token stays server-side, see getPresenceFor
      if (token_path) Object.assign(meta, { token, token_path });
      users.addUser(userID, meta);

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

      // presence is reserved to logged-in accounts
      socket.on("trackUsers", async ({ token, token_path } = {}) => {
        try {
          auth.checkTokenValidity({ token, token_path, purpose: "auth" });
        } catch (err) {
          return stopTracking(socket);
        }
        socket.data.presence_auth = { token, token_path };
        socket.join("users");
        // client starts from an empty list: always send
        await sendPresence(socket, { skip_if_unchanged: false });
      });
      socket.on("leaveUsers", () => stopTracking(socket));

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
        sessionStore.removeSocketConnection(sessionID, userID);
        users.userLeft(userID);
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
    notifier.on("filesRemoved", (room, content) => {
      io.to("content/" + room).emit("filesRemoved", content);
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

    // batch bursts of changes (page loads, cleanups) into one broadcast,
    // sent at most PRESENCE_MAX_WAIT after the first pending change
    const PRESENCE_DEBOUNCE = 300;
    const PRESENCE_MAX_WAIT = 1000;
    let presence_timeout;
    let first_pending_change;
    notifier.on("usersChanged", () => {
      clearTimeout(presence_timeout);
      if (!first_pending_change) first_pending_change = Date.now();
      const waited = Date.now() - first_pending_change;
      const delay = Math.min(
        PRESENCE_DEBOUNCE,
        Math.max(0, PRESENCE_MAX_WAIT - waited)
      );
      presence_timeout = setTimeout(() => {
        first_pending_change = null;
        broadcastPresence();
      }, delay);
    });
  }

  async function broadcastPresence() {
    const sockets = await io.in("users").fetchSockets();
    const shared_cache = {};
    await Promise.all(
      sockets.map((socket) => sendPresence(socket, { shared_cache }))
    );
  }

  // each viewer gets its own snapshot: private locations depend on its rights
  // skip_if_unchanged: changes by anonymous visitors often don't alter it
  async function sendPresence(
    socket,
    { shared_cache, skip_if_unchanged = true } = {}
  ) {
    const presence_auth = socket.data.presence_auth;
    try {
      // token may have been revoked (logout) or expired since trackUsers
      auth.checkTokenValidity({ ...presence_auth, purpose: "auth" });
    } catch (err) {
      return stopTracking(socket);
    }
    try {
      const presence = await api2.getPresenceFor(presence_auth, shared_cache);
      const serialized = JSON.stringify(presence);
      if (skip_if_unchanged && socket.data.last_presence === serialized) return;
      socket.data.last_presence = serialized;
      socket.emit("presence", presence);
    } catch (err) {
      dev.error(err);
    }
  }

  function stopTracking(socket) {
    socket.leave("users");
    delete socket.data.presence_auth;
    delete socket.data.last_presence;
  }

  function deviceFromUserAgent(user_agent = "") {
    if (/iPad|Tablet/i.test(user_agent)) return "tablet";
    if (/Mobi|Android|iPhone/i.test(user_agent)) return "phone";
    return "laptop";
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
