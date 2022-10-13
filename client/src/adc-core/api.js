import { io } from "socket.io-client";
import Vue from "vue";

export default function () {
  return new Vue({
    data: {
      socket: "",
      store: {},
      is_logged_in: false,
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
          if (_args[0].changed_data?.content)
            _args[0].changed_data.content = "…";
          // if (_args[0].changed_data?.content)
          //   _args[0].changed_data.content =
          //     _args[0].changed_data?.content.slice(0, 15) +
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

      folderCreated({ folder_type, meta }) {
        this.store[folder_type].push(meta);
      },
      folderUpdated({ folder_type, folder_slug, changed_data }) {
        const folder = this.findFolder({
          folder_type,
          folder_slug,
        });
        // update props
        Object.entries(changed_data).map(([key, value]) => {
          this.$set(folder, key, value);
        });
      },
      folderRemoved({ folder_type, folder_slug }) {
        const folder_index = this.findFolderIndex({
          folder_type,
          folder_slug,
        });
        this.store[folder_type].splice(folder_index, 1);
      },

      fileCreated({ folder_type, folder_slug, file_meta }) {
        const folder = this.findFolder({
          folder_type,
          folder_slug,
        });
        if (!folder.files) this.$set(folder, "files", new Array());
        folder.files.push(file_meta);
      },
      fileUpdated({ folder_type, folder_slug, meta_slug, changed_data }) {
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
      fileRemoved({ folder_type, folder_slug, meta_slug }) {
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

      async getSettings() {
        const response = await this.$axios.get(`/_admin`);
        return response.data;
      },
      async getFolders({ folder_type }) {
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

        if (!Object.prototype.hasOwnProperty.call(this.store, folder_type))
          this.$set(this.store, folder_type, new Array());

        let folders = this.store[folder_type];
        folders = folders.filter((f) => f.slug !== folder_slug);
        folders.push(d);
        this.store[folder_type] = folders;

        return d;
      },
      async getArchives({ folder_type, folder_slug, meta_slug }) {
        const response = await this.$axios.get(
          `/${folder_type}/${folder_slug}/${meta_slug}/_archives`
        );
        const d = response.data;
        return d;
      },
      async deleteFolder({ folder_type, folder_slug }) {
        try {
          const response = await this.$axios.delete(
            `/${folder_type}/${folder_slug}`
          );
          return response.data;
        } catch (e) {
          throw e.response.data;
        }
      },

      async uploadText({
        folder_type,
        folder_slug,
        filename,
        content = "",
        additional_meta,
      }) {
        let formData = new FormData();

        const file = new Blob([content], { type: "text/plain" });

        if (additional_meta)
          formData.append(filename, JSON.stringify(additional_meta));

        await this.uploadFile({
          folder_type,
          folder_slug,
          filename,
          file,
          additional_meta,
        });
      },
      async uploadFile({
        folder_type,
        folder_slug,
        filename,
        file,
        additional_meta,
        onProgress,
      }) {
        let formData = new FormData();
        formData.append("file", file, filename);

        if (additional_meta)
          formData.append(filename, JSON.stringify(additional_meta));

        const path = `/${folder_type}/${folder_slug}/_upload`;

        let res = await this.$axios
          .post(path, formData, {
            headers: { "Content-Type": "multipart/form-data" },
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

      async updateCover({
        folder_type,
        folder_slug,
        filename,
        rawData,
        onProgress,
      }) {
        let formData = new FormData();
        if (rawData) formData.append("file", rawData, filename);

        const path = `/${folder_type}/${folder_slug}?cover`;

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

      async deleteFile({ folder_type, folder_slug, meta_slug }) {
        try {
          const response = await this.$axios.delete(
            `/${folder_type}/${folder_slug}/${meta_slug}`
          );
          return response.data;
        } catch (e) {
          throw e.response.data;
        }
      },
    },
  });
}
