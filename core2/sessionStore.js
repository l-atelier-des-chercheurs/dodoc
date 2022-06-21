/* abstract */
// from https://socket.io/fr/get-started/private-messaging-part-2/
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

module.exports = (function () {
  let sessions = new Map();

  return {
    get({ sessionID }) {
      dev.logfunction({ sessionID });
      if (sessionID) {
        // find existing session
        const session = this.findSession(sessionID);
        if (session) {
          dev.logverbose(`found session, returning`, { session });
          return {
            sessionID,
            userID: session.userID,
          };
        }
      }
      dev.logverbose(`session not found/does not exists, creating new one`);

      // create new session
      return {
        sessionID: randomId(),
        userID: randomId(),
      };
    },

    findSession(id) {
      return sessions.get(id);
    },

    saveSession(id, session) {
      sessions.set(id, session);
    },

    findAllSessions() {
      return [...sessions.values()];
    },
  };
})();
