/* abstract */
// from https://socket.io/fr/get-started/private-messaging-part-2/
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

module.exports = (function () {
  let sessions = [];

  return {
    getOrCreate(sessionID) {
      dev.logfunction({ sessionID });
      if (sessionID && this.findSession(sessionID)) return sessionID;
      dev.logverbose(`session not found/does not exists, creating new one`);
      const $path = "_users/" + randomId();
      sessions.push({ $path });
      return $path;
    },
    findSession($path) {
      return sessions.find((session) => session.$path === $path);
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
