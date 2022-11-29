const utils = require("./utils"),
  thumbs = require("./thumbs"),
  cache = require("./cache"),
  crypto = require("crypto");

module.exports = (function () {
  let tokens = new Map();

  const API = {
    async createAndStoreToken({ path_to_folder }) {
      dev.logfunction({ path_to_folder });
      // todo replace with jwt with expiration
      // https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs
      const token = crypto.randomBytes(32).toString("hex");
      tokens.set(token, path_to_folder);
      dev.logverbose("set new token", { token, path_to_folder });
      return token;
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
