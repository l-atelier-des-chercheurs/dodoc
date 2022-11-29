const utils = require("./utils"),
  thumbs = require("./thumbs"),
  cache = require("./cache"),
  crypto = require("crypto");

module.exports = (function () {
  const API = {
    async createAndStoreToken({ path_to_folder }) {
      return "mytoken";
    },
    async hashPassword({ password, salt = global.settings.password_salt }) {
      // see https://stackoverflow.com/a/67038052
      const buf = crypto.scryptSync(password, salt, 64).toString("hex");
      return `${buf.toString("hex")}.${salt}`;
    },

    async checkPassword({ submitted_password, stored_password_with_salt }) {
      // check if password matches stored_password once it is hashed
      const [stored_password, salt] = stored_password_with_salt.split(".");
      const submitted_password_with_salt = await API.hashPassword({
        password: submitted_password,
        salt,
      });
      return submitted_password_with_salt === stored_password_with_salt;
    },
  };
  return API;
})();
