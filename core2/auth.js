const crypto = require("crypto"),
  fs = require("fs-extra"),
  path = require("path"),
  writeFileAtomic = require("write-file-atomic");

const folder = require("./folder"),
  utils = require("./utils");

module.exports = (function () {
  let tokens = {};
  let superadmintoken = undefined;

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

    createSuperadminToken() {
      superadmintoken = crypto.randomBytes(32).toString("hex");
    },
    getSuperadminToken() {
      return superadmintoken;
    },
    checkSuperadminToken(t) {
      return superadmintoken === t;
    },
    extrackAndCheckToken({ req }) {
      if (!req.headers || !req.headers.authorization) {
        // const err = new Error("Headers missing");
        // err.code = "missing_headers";
        // throw err;
        return false;
      }

      const { token, token_path } = JSON.parse(req.headers.authorization);
      if (!token || !token_path) {
        // const err = new Error("Token and/or token_path missing in headers");
        // err.code = "no_token_submitted";
        // throw err;
        return false;
      }

      try {
        API.checkTokenValidity({ token, token_path });
      } catch (err) {
        err;
        return false;
      }

      return token_path;
    },

    checkTokenValidity({ token, token_path }) {
      if (!tokens.hasOwnProperty(token))
        throw new Error(`token_does_not_exist`);
      if (tokens[token].token_path !== token_path)
        throw new Error(`token_path_mismatch`);

      // check if token isn't expired
      const issued = tokens[token].issued;
      // 7 days
      const expires_after_minutes =
        60 * 24 * (global.settings.tokenIsValidForXDays || 60);
      const minutes_since_issued = (+new Date() - issued) / (1000 * 60);

      if (minutes_since_issued > expires_after_minutes) {
        API.revokeToken({ token_to_revoke: token });
        // check if other tokens are also expired and remove them?
        throw new Error(`token_expired`);
      }

      return;
    },
    canFolderBeCreatedByAll({ path_to_type }) {
      try {
        const item_in_schema = utils.parseAndCheckSchema({
          relative_path: path_to_type,
        });
        if (item_in_schema && item_in_schema.$can_be_created_by === "everyone")
          return true;
      } catch (err) {
        err;
      }
      return false;
    },
    async isFolderOpenedToAll({ field, path_to_folder = "" }) {
      const folder_meta = await folder.getFolder({ path_to_folder });
      return (
        // anyone can access if no field or field === "everyone"
        folder_meta.hasOwnProperty(field) && folder_meta[field] === "everyone"
      );
    },
    async isInstanceOpenedToAll() {
      return await API.isFolderOpenedToAll({ field: "$admins" });
    },
    async isFolderInheritingFromParent({ field, path_to_folder = "" }) {
      const folder_meta = await folder.getFolder({ path_to_folder });
      return (
        folder_meta.hasOwnProperty(field) &&
        folder_meta[field] === "parent_contributors"
      );
    },
    async isTokenInstanceAdmin({ token_path }) {
      return await API.isTokenIncluded({
        field: "$admins",
        path_to_folder: "",
        token_path,
      });
    },
    async isTokenIncluded({ field, path_to_folder = "", token_path }) {
      const folder_meta = await folder.getFolder({ path_to_folder });
      const paths = folder_meta[field];
      return paths && Array.isArray(paths) && paths.includes(token_path);
    },
    async updateTokensFile() {
      await writeFileAtomic(path_to_tokens, JSON.stringify(tokens, null, 2));
    },

    async removeObsoleteTokens() {
      Object.entries(tokens).find(([token, tp]) => {
        const issued = tp.issued;
        // TODO
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
