import { io } from "socket.io-client";
import Vue from "vue";

export default function () {
  return new Vue({
    data: {
      socket: "",
      store: {},
      is_logged_in: true,
      debug_mode: false,
    },
    created() {},
    methods: {
      init({ debug_mode }) {
        this.debug_mode = debug_mode;
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
          // truncate long strings in content (long texts for example)
          const _args = JSON.parse(JSON.stringify(args));
          if (_args[0].changed_data?.$content)
            _args[0].changed_data.$content = "…";
          // if (_args[0].changed_data?.$content)
          //   _args[0].changed_data.$content =
          //     _args[0].changed_data?.$content.slice(0, 15) +
          //     "[…] (truncated content)";
          if (this.debug_mode)
            this.$alertify
              .delay(4000)
              .log(`⤓ ` + eventName + JSON.stringify(_args));
        });
        this.socket.on("folderCreated", this.folderCreated);
        this.socket.on("folderUpdated", this.folderUpdated);
        this.socket.on("folderRemoved", this.folderRemoved);

        this.socket.on("fileCreated", this.fileCreated);
        this.socket.on("fileUpdated", this.fileUpdated);
        this.socket.on("fileRemoved", this.fileRemoved);
      },

      disconnectSocket() {
        this.socket.disconnect();
      },
      reconnectSocket() {
        this.socket.connect();
      },
      folderCreated({ path, meta }) {
        if (!this.store[path]) this.store[path] = new Array();
        this.store[path].push(meta);
        this.$set(this.store, meta.$path, meta);
      },
      folderUpdated({ path, changed_data }) {
        const updateProps = ({ changed_data, folder_to_update }) => {
          Object.entries(changed_data).map(([key, value]) => {
            this.$set(folder_to_update, key, value);
          });
        };

        // updated folder $path
        if (Object.prototype.hasOwnProperty.call(this.store, path)) {
          updateProps({ changed_data, folder_to_update: this.store[path] });
        }

        // parent folder path
        const parent_folder_path = path.substr(0, path.lastIndexOf("/"));
        if (
          Object.prototype.hasOwnProperty.call(this.store, parent_folder_path)
        ) {
          const folder_to_update = this.store[parent_folder_path].find(
            (f) => f.$path === path
          );
          updateProps({ changed_data, folder_to_update });
        }

        // update
      },
      folderRemoved({ path }) {
        this.$delete(this.store, path);

        if (Object.prototype.hasOwnProperty.call(this.store, path)) {
          this.store.$delete(path);
        }

        const parent_folder_path = path.substr(0, path.lastIndexOf("/"));
        if (
          Object.prototype.hasOwnProperty.call(this.store, parent_folder_path)
        ) {
          const folder_index = this.store[parent_folder_path].findIndex(
            (f) => f.$path === path
          );
          this.store[parent_folder_path].splice(folder_index, 1);
        }

        this.$eventHub.$emit("folder.removed", { path });
      },

      fileCreated({ path_to_folder, meta }) {
        const folder = this.store[path_to_folder];
        if (!folder.$files) this.$set(folder, "files", new Array());
        folder.$files.push(meta);
      },
      fileUpdated({ path_to_folder, path_to_meta, changed_data }) {
        const folder = this.store[path_to_folder];
        const file = folder.$files.find((file) => file.$path === path_to_meta);
        if (file)
          Object.entries(changed_data).map(([key, value]) => {
            this.$set(file, key, value);
          });
      },
      fileRemoved({ path_to_folder, path_to_meta }) {
        const folder = this.store[path_to_folder];
        folder.$files = folder.$files.filter(
          (file) => file.$path !== path_to_meta
        );
      },

      join({ room }) {
        this.socket.emit("joinRoom", { room });
        // todo rejoin room after disconnect
      },
      leave({ room }) {
        this.socket.emit("leaveRoom", { room });
        // todo rejoin room after disconnect
      },

      async getSettings() {
        const response = await this.$axios.get(`_admin`);
        return response.data;
      },
      async getFolders({ path }) {
        const response = await this.$axios.get(path);
        const folders = response.data;
        // folders.map((f) => this.$set(this.store, f.$path, f));

        this.$set(this.store, path, folders);

        // we use the store to trigger updates to array if item is updated
        return folders;
      },
      async getFolder({ path }) {
        const response = await this.$axios.get(path);
        const folder = response.data;
        this.$set(this.store, folder.$path, folder);
        return folder;
      },
      async getArchives({ path }) {
        const response = await this.$axios.get(path);
        const d = response.data;
        return d;
      },

      async createFolder({ path, additional_meta }) {
        try {
          const response = await this.$axios.post(path, additional_meta);
          return response.data.new_folder_slug;
        } catch (e) {
          throw e.response.data;
        }
      },
      async loginToFolder({ folder_type, folder_slug, auth_infos }) {
        try {
          const response = await this.$axios.post(
            `/${folder_type}/${folder_slug}/_login`,
            auth_infos
          );
          return response.data;
        } catch (e) {
          throw e.response.data;
        }
      },

      async uploadText({ path, filename, content = "", additional_meta }) {
        let formData = new FormData();

        const file = new Blob([content], { type: "text/plain" });

        if (additional_meta)
          formData.append(filename, JSON.stringify(additional_meta));

        await this.uploadFile({
          path,
          filename,
          file,
          additional_meta,
        });
      },
      async uploadFile({ path, filename, file, additional_meta, onProgress }) {
        // if no file binary to send, we'll only create a meta file with additional_meta
        let data;
        let headers;

        if (file) {
          data = new FormData();
          data.append("file", file, filename);
          if (additional_meta)
            data.append(filename, JSON.stringify(additional_meta));
          headers = { "Content-Type": "multipart/form-data" };
        } else {
          data = additional_meta;
        }

        path = `${path}/_upload`;

        let res = await this.$axios
          .post(path, data, {
            headers,
            onUploadProgress: (progressEvent) => {
              if (onProgress) onProgress(progressEvent);
            },
          })
          .catch((err) => {
            this.$alertify.delay(4000).error(err);
            throw err;
          });

        return res.data.meta_filename;
      },

      async updateMeta({ path, new_meta }) {
        const response = await this.$axios.patch(path, new_meta);
        return response.data;
      },

      async updateCover({ path, rawData, onProgress }) {
        let formData = new FormData();
        if (rawData) formData.append("file", rawData, "cover");

        path = path + `?cover`;

        await this.$axios
          .patch(path, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              if (onProgress) onProgress(progressEvent);
            },
          })
          .catch((err) => {
            this.$alertify.delay(4000).error(err);
            throw err;
          });

        return;
      },

      async deleteItem({ path }) {
        try {
          const response = await this.$axios.delete(path);
          return response.data;
        } catch (e) {
          throw e.response.data;
        }
      },
    },
  });
}
