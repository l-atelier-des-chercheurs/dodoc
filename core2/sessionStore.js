/* abstract */
// from https://socket.io/fr/get-started/private-messaging-part-2/
const crypto = require("crypto");
const dev = require("./dev-log");
const randomId = () => crypto.randomBytes(8).toString("hex");

module.exports = (function () {
  let sessions = [];

  return {
    getOrCreate(sessionID) {
      dev.logfunction({ sessionID });
      if (sessionID && this.findSession(sessionID)) return sessionID;
      dev.logverbose(`session not found/does not exists, creating new one`);
      const $path = "_users/" + randomId();
      sessions.push({
        $path,
        connected: false,
        userIDs: [],
        active_socket_count: 0,
      });
      return $path;
    },
    findSession($path) {
      return sessions.find((session) => session.$path === $path);
    },
    addSocketConnection($path, userID) {
      sessions = sessions.map((session) => {
        if (session.$path !== $path) return session;

        const userIDs = Array.isArray(session.userIDs) ? [...session.userIDs] : [];
        if (userID && !userIDs.includes(userID)) userIDs.push(userID);

        const active_socket_count =
          (Number(session.active_socket_count) || 0) + 1;

        return {
          ...session,
          connected: true,
          userIDs,
          active_socket_count,
        };
      });
    },
    removeSocketConnection($path, userID) {
      sessions = sessions.map((session) => {
        if (session.$path !== $path) return session;

        const current_count = Number(session.active_socket_count) || 0;
        const active_socket_count = Math.max(0, current_count - 1);
        const userIDs = Array.isArray(session.userIDs)
          ? session.userIDs.filter((id) => id !== userID)
          : [];

        return {
          ...session,
          connected: active_socket_count > 0,
          userIDs,
          active_socket_count,
        };
      });
    },
    isUserInSession($path, userID) {
      const session = this.findSession($path);
      if (!session) return false;
      if (!userID) return false;
      return Array.isArray(session.userIDs) && session.userIDs.includes(userID);
    },
    updateSession($path, content) {
      sessions = sessions.map((session) => {
        if (session.$path === $path)
          session = Object.assign({}, session, content);
        return session;
      });
    },
    findAllSessions() {
      return [...sessions];
    },
  };
})();
