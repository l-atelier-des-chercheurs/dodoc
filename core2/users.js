const notifier = require("./notifier");

module.exports = (function () {
  let users = [];
  let io;

  const API = {
    init: (_io) => {
      io = _io;

      const interval = 1000 * 10;
      setInterval(() => {
        API.cleanupUsers();
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
      const ids = await io.fetchSockets();
      return ids.map((socket) => {
        const user = users.find((u) => u.id === socket.userID);
        if (!user) notifier.emit("userLeft", socket.userID);
      });
    },
  };

  return API;
})();
