import { io } from "socket.io-client";
import Vue from "vue";

export default function () {
  return new Vue({
    data: {
      socket: "",
      store: {},
    },
    methods: {
      init() {
        this.initSchema();
        this.initSocketio();
      },

      initSchema() {},
      initSocketio() {
        this.socket = io({
          // TODO : only connect when user logs in ?
          // autoConnect: false,
        });

        // client-side
        this.socket.on("connect", () => {
          console.log(this.socket.id);
          this.$eventHub.$emit("socketio.connect", {
            socketid: this.socket.id,
          });
        });
        this.socket.on("reconnect", () => {
          console.log(this.socket.id);
          this.$eventHub.$emit("socketio.reconnect", {
            socketid: this.socket.id,
          });
        });
        this.socket.on("disconnect", () => {
          this.$eventHub.$emit("socketio.disconnect");
        });

        this.socket.onAny((eventName, ...args) => {
          this.$alertify.delay(4000).success(eventName + JSON.stringify(args));
        });
        this.socket.on("createFolder", ({ folder_type, meta }) => {
          this.store[folder_type].push(meta);
        });
        this.socket.on(
          "updateFolder",
          ({ folder_type, folder_slug, changed_data }) => {
            const folder = this.findFolder({
              folder_type,
              folder_slug,
            });
            // update props
            Object.entries(changed_data).map(([key, value]) => {
              this.$set(folder, key, value);
            });
          }
        );
        this.socket.on("removeFolder", ({ folder_type, folder_slug }) => {
          const folder_index = this.findFolderIndex({
            folder_type,
            folder_slug,
          });
          this.store[folder_type].splice(folder_index, 1);
        });

        this.socket.on("newFile", this.appendFile);
        this.socket.on("updateFile", this.updateFile);
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
        return this.store[folder_type].findIndex(
          (folder) => folder.slug === folder_slug
        );
      },
      findFolder({ folder_type, folder_slug }) {
        if (!this.store[folder_type]) return false;
        return this.store[folder_type].find(
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
        if (folder?.files)
          return folder.files.find((f) => f.slug === meta_slug);
        return false;
      },

      appendFile({ folder_type, folder_slug, file_meta }) {
        const folder = this.findFolder({
          folder_type,
          folder_slug,
        });
        if (!Object.prototype.hasOwnProperty.call(folder, "files"))
          this.$set(folder, "files", new Array());
        folder.files.push(file_meta);
      },
      updateFile({ folder_type, folder_slug, meta_slug, changed_data }) {
        const file = this.findFileInFolder({
          folder_type,
          folder_slug,
          meta_slug,
        });

        if (file)
          Object.entries(changed_data).map(([key, value]) => {
            this.$set(file, key, value);
          });
      },

      join({ room }) {
        this.socket.emit("joinRoom", { room });
      },
      leave({ room }) {
        this.socket.emit("leaveRoom", { room });
      },

      async getFolders({ folder_type }) {
        // fetch folders: only fetch if necessary
        const response = await this.$axios.get(`/${folder_type}`);
        const d = response.data;
        this.$set(this.store, folder_type, d);
        return d;
      },
      async getFolder({ folder_type, folder_slug }) {
        const response = await this.$axios.get(
          `/${folder_type}/${folder_slug}`
        );
        const d = response.data;

        this.$set(this.store, folder_type, d);
        return d;
      },
    },
  });
}
