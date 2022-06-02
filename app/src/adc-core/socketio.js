import { io } from "socket.io-client";
import Vue from "vue";
import alertify from "alertify.js";
Vue.prototype.$alertify = alertify;

export default function () {
  return new Vue({
    data: {
      socket: "",
    },
    methods: {
      connect() {
        let opts = {};
        this.socket = io(opts);

        // client-side
        this.socket.on("connect", () => {
          console.log(this.socket.id); // x8WIv7-mJelg7on_ALbx
        });

        this.socket.onAny((eventName, ...args) => {
          this.$alertify.delay(4000).success(eventName + JSON.stringify(args));
        });
        this.socket.on("createFolder", (content) => {
          window.store.projects.push(content);
        });
        this.socket.on("removeFolder", (folder_slug) => {
          window.store.projects = window.store.projects.filter(
            (project) => project.slug !== folder_slug
          );
        });
      },
    },
  });
}
