const notifier = require("./notifier");

module.exports = (function () {
  let users = [];
  let io;
  let isCleaningUp = false; // Prevent overlapping cleanup operations

  const API = {
    init: (_io) => {
      io = _io;

      const interval = 1000 * 10;
      setInterval(async () => {
        if (!isCleaningUp) {
          try {
            await API.cleanupUsers();
          } catch (error) {
            console.error("Error during user cleanup:", error);
          }
        }
      }, interval);
    },
    getAllUsers: () => {
      return users;
    },
    addUser: (id, meta = {}) => {
      if (!users.find((u) => u.id === id)) {
        const user = { id, meta };
        users.push(user);
        return user;
      }
    },
    updateUser: (id, meta = {}) => {
      const user = users.find((u) => u.id === id);
      if (!user) return;
      user.meta = { ...user.meta, ...meta };
      return user;
    },
    userLeft: (id) => {
      users = users.filter((u) => u.id !== id);
    },
    cleanupUsers: async () => {
      if (!io) return;

      isCleaningUp = true;

      try {
        const sockets = await io.fetchSockets();
        const activeSocketIds = new Set(
          sockets.map((socket) => socket.userID).filter(Boolean)
        );

        // Find users that no longer have active sockets
        const staleUsers = users.filter(
          (user) => !activeSocketIds.has(user.id)
        );

        // Remove stale users and emit notifications
        staleUsers.forEach((user) => {
          users = users.filter((u) => u.id !== user.id);
          notifier.emit("userLeft", user.id);
        });

        return staleUsers.length; // Return number of cleaned up users
      } catch (error) {
        console.error("Error in cleanupUsers:", error);
        throw error;
      } finally {
        isCleaningUp = false;
      }
    },
  };

  return API;
})();
