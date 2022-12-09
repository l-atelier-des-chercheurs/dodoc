const crypto = require("crypto"),
  fs = require("fs-extra"),
  path = require("path"),
  writeFileAtomic = require("write-file-atomic");

module.exports = (function () {
  let tokens = {};
  const path_to_tokens = path.join(global.appRoot, "tokens.json");
  (async () => {
    try {
      const _tokens = await fs
        .readFile(path_to_tokens, "UTF-8")
        .catch((err) => {});
      if (_tokens) tokens = JSON.parse(_tokens);
    } catch (err) {}
  })();

  const API = {
    async hashPassword({
      password,
      salt = crypto.randomBytes(32).toString("hex"),
    }) {
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

    async createAndStoreToken({ path_to_folder }) {
      dev.logfunction({ path_to_folder });
      // todo replace with jwt with expiration
      // https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs
      const token = crypto.randomBytes(32).toString("hex");
      tokens[token] = { token_path: path_to_folder, issued: +new Date() };

      API.updateTokensFile();
      dev.logverbose("set new token", { token, path_to_folder });
      return token;
    },
    checkToken({ token, token_path }) {
      if (!tokens.hasOwnProperty(token))
        throw new Error(`token_does_not_exist`);
      if (tokens[token].token_path !== token_path)
        throw new Error(`token_path_mismatch`);

      // check if token isn't expired
      const issued = tokens[token].issued;
      const expires_after_hours = 0.0001;
      const hours_since_issued = (+new Date() - issued) / (1000 * 3600);

      if (hours_since_issued > expires_after_hours) {
        API.revokeToken({ token_to_revoke: token });
        // check if other tokens are also expired and remove them?
        throw new Error(`token_expired`);
      }

      return;
    },

    async updateTokensFile() {
      await writeFileAtomic(path_to_tokens, JSON.stringify(tokens, null, 2));
    },

    async removeObsoleteTokens() {
      Object.entries(tokens).find(([token, tp]) => {
        const issued = tp.issued;
        debugger;
        // if (tp.issued) delete tokens[token];
      });
      await API.updateTokensFile();
      return;
    },
    async revokeToken({ token_to_revoke }) {
      delete tokens[token_to_revoke];
      await API.updateTokensFile();
      return;
    },
    async removeAllTokensForFolder({ token_path }) {
      dev.logfunction({ token_path });
      Object.entries(tokens).find(([token, tp]) => {
        if (tp.token_path === token_path) delete tokens[token];
      });
      API.updateTokensFile();
    },
  };
  return API;
})();
