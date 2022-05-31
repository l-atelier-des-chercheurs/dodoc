
import io from "socket.io-client";
import Vue from "vue";

module.exports = (function () {
  return {
    init: function (i18n, auth, alertify) {
      return new Vue({
        i18n,
        data: {
          socket: "",
        },
        methods: {
          connect(pwd) {
            let opts = {};

          }
        }
      }
    }
  }
}