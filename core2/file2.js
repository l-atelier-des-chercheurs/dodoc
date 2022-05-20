const path = require("path"),
  fs = require("fs-extra"),
  validator = require("validator");

module.exports = (function () {
  const API = {
    getFolder: async () => {
      return "plop";
    },
  };

  async function _localFct() {}

  return API;
})();
