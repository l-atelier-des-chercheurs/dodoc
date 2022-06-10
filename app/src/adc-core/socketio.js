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
        this.socket.on("createFolder", ({ folder_type, meta }) => {
          window.store[folder_type].push(meta);
        });
        this.socket.on(
          "updateFolder",
          ({ folder_type, folder_slug, changed_meta }) => {
            const folder = this.findFolder({
              folder_type,
              folder_slug,
            });
            // update props
            Object.entries(changed_meta).map(([key, value]) => {
              this.$set(folder, key, value);
            });
          }
        );
        this.socket.on("removeFolder", ({ folder_type, folder_slug }) => {
          const folder_index = this.findFolderIndex({
            folder_type,
            folder_slug,
          });
          window.store[folder_type].splice(folder_index, 1);
        });

        this.socket.on("newFile", ({ folder_type, folder_slug, file_meta }) => {
          const folder = this.findFolder({
            folder_type,
            folder_slug,
          });
          if (!Object.prototype.hasOwnProperty.call(folder, "files"))
            this.$set(folder, "files", new Array());
          folder.files.push(file_meta);
        });
        this.socket.on(
          "updateFile",
          ({ folder_type, folder_slug, meta_slug, changed_meta }) => {
            folder_type;
            folder_slug;
            meta_slug;
            changed_meta;

            const file = this.findFileInFolder({
              folder_type,
              folder_slug,
              meta_slug,
            });

            if (file)
              Object.entries(changed_meta).map(([key, value]) => {
                this.$set(file, key, value);
              });
          }
        );
        this.socket.on(
          "removeFile",
          ({ folder_type, folder_slug, meta_slug }) => {
            const folder = this.findFolder({ folder_type, folder_slug });
            const file_index = this.findFileIndexInFolder({
              folder_type,
              folder_slug,
              meta_slug,
            });
            if (file_index >= 0) folder.files.splice(file_index, 1);
          }
        );
      },

      findFolderIndex({ folder_type, folder_slug }) {
        return window.store[folder_type].findIndex(
          (folder) => folder.slug === folder_slug
        );
      },
      findFolder({ folder_type, folder_slug }) {
        return window.store[folder_type].find(
          (folder) => folder.slug === folder_slug
        );
      },
      findFileIndexInFolder({ folder_type, folder_slug, meta_slug }) {
        const folder = this.findFolder({ folder_type, folder_slug });
        if (folder.files)
          return folder.files.findIndex((f) => f.slug === meta_slug);
        return false;
      },
      findFileInFolder({ folder_type, folder_slug, meta_slug }) {
        const folder = this.findFolder({ folder_type, folder_slug });
        if (folder.files) return folder.files.find((f) => f.slug === meta_slug);
        return false;
      },
    },
  });
}
