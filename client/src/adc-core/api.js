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
          autoConnect: false,
        });

        const sessionID = localStorage.getItem("sessionID");
        if (sessionID) this.socket.auth = { sessionID };

        this.socket.connect();

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
        this.socket.on("session", ({ sessionID, userID }) => {
          // attach the session ID to the next reconnection attempts
          this.socket.auth = { sessionID };
          localStorage.setItem("sessionID", sessionID);
          this.socket.userID = userID;
        });

        this.socket.on("connect_error", (reason) => {
          this.$eventHub.$emit("socketio.connect_error", reason);
        });
        this.socket.on("disconnect", (reason) => {
          this.$eventHub.$emit("socketio.disconnect", reason);
        });

        this.socket.onAny((eventName, ...args) => {
          this.$alertify.delay(4000).success(eventName + JSON.stringify(args));
        });
        this.socket.on("createFolder", this.createFolder);
        this.socket.on("updateFolder", this.updateFolder);
        this.socket.on("removeFolder", this.removeFolder);

        this.socket.on("newFile", this.newFile);
        this.socket.on("updateFile", this.updateFile);
        this.socket.on("removeFile", this.removeFile);
      },

      disconnectSocket() {
        this.socket.disconnect();
      },
      reconnectSocket() {
        this.socket.connect();
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

      createFolder({ folder_type, meta }) {
        this.store[folder_type].push(meta);
      },
      updateFolder({ folder_type, folder_slug, changed_data }) {
        const folder = this.findFolder({
          folder_type,
          folder_slug,
        });
        // update props
        Object.entries(changed_data).map(([key, value]) => {
          this.$set(folder, key, value);
        });
      },
      removeFolder({ folder_type, folder_slug }) {
        const folder_index = this.findFolderIndex({
          folder_type,
          folder_slug,
        });
        this.store[folder_type].splice(folder_index, 1);
      },

      newFile({ folder_type, folder_slug, file_meta }) {
        const folder = this.findFolder({
          folder_type,
          folder_slug,
        });
        if (!folder.files) this.$set(folder, "files", new Array());
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
      removeFile({ folder_type, folder_slug, meta_slug }) {
        const folder = this.findFolder({ folder_type, folder_slug });
        const file_index = this.findFileIndexInFolder({
          folder_type,
          folder_slug,
          meta_slug,
        });
        if (file_index >= 0) folder.files.splice(file_index, 1);
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
        // check if folder exists in store first, and if not invalidated

        const response = await this.$axios.get(
          `/${folder_type}/${folder_slug}`
        );

        const d = response.data;

        if (!Object.prototype.hasOwnProperty.call(this.store, folder_type))
          this.$set(this.store, folder_type, new Array());

        let folders = this.store[folder_type];
        folders = folders.filter((f) => f.slug !== folder_slug);
        folders.push(d);
        this.store[folder_type] = folders;

        return d;
      },
    },
  });
}
