const utils = require("./utils"),
  folder = require("./folder"),
  file = require("./file");

module.exports = (function () {
  let users = [];

  const API = {
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
      user.meta = meta;
      return user;
    },
    removeUser: (id) => {
      users = users.filter((u) => u.id !== id);
    },
  };

  return API;
})();
