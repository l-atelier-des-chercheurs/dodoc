import { io } from "socket.io-client";
import Vue from "vue";
import saveAs from "file-saver";

export default function () {
  return new Vue({
    data: {
      socket: null,
      store: {},
      debug_mode: false,
      tokenpath: {
        token: "",
        token_path: "",
      },
      general_password: "",

      rooms_joined: [],

      // todo replace is_identified, create route to test
      is_correctly_logged_in: false,

      connected: false,
    },
    created() {},
    watch: {},
    methods: {
      async init({ debug_mode }) {
        this.debug_mode = debug_mode;
        await this.initSocketio();
      },
      async initSocketio() {
        console.log("initSocketio");
        this.socket = io({
          autoConnect: false,
        });

        const sessionID = localStorage.getItem("sessionID");
        if (sessionID) this.socket.auth = { sessionID };

        await this._setAuthFromStorage();
        this.setAuthorizationHeader();

        if (this.tokenpath.token_path) {
          await this.getCurrentAuthor().catch(() => {});
          this.trackCurrentAuthor();
        }

        await this.socket.connect();

        // client-side
        this.socket.on("connect", () => {
          console.log("socket connected");
          this.connected = true;
          console.log("connect " + this.socket.id);
          this.$eventHub.$emit("socketio.connect", {
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
          console.log("socket connect error");
          this.$eventHub.$emit("socketio.connect_error", reason);
        });
        this.socket.on("disconnect", (reason) => {
          console.log("socket disconnected");

          this.connected = false;
          this.$eventHub.$emit("socketio.disconnect", reason);
          this.socket.disconnect();
          this.emptyStore();
          this.socket.once("connect", () => {
            this.rejoinRooms();
          });
        });

        this.socket.onAny((eventName, ...args) => {
          // truncate long strings in content (long texts for example)
          const _args = JSON.parse(JSON.stringify(args));
          if (_args[0].changed_data?.$content)
            _args[0].changed_data.$content = "…";
          if (_args[0].changed_data?.$thumbs)
            _args[0].changed_data.$thumbs = "…";
          // if (_args[0].changed_data?.$content)
          //   _args[0].changed_data.$content =
          //     _args[0].changed_data?.$content.slice(0, 15) +
          //     "[…] (truncated content)";
          if (this.debug_mode)
            this.$alertify.delay(4000).log(
              `⤓ ` + eventName
              // + JSON.stringify(_args)
            );
        });
        this.socket.on("folderCreated", this.folderCreated);
        this.socket.on("folderUpdated", this.folderUpdated);
        this.socket.on("folderRemoved", this.folderRemoved);

        this.socket.on("fileCreated", this.fileCreated);
        this.socket.on("fileUpdated", this.fileUpdated);
        this.socket.on("fileRemoved", this.fileRemoved);

        this.socket.on("taskStatus", this.taskStatus);
        this.socket.on("taskEnded", this.taskEnded);
      },
      disconnectSocket() {
        this.socket.disconnect();
      },
      reconnectSocket() {
        this.socket.connect();
      },
      join({ room }) {
        // join room only if not tracking
        if (!this.rooms_joined.includes(room)) {
          // console.log("JOIN – room isnt tracked, joining", room);
          this.socket.emit("joinRoom", { room });
        } else {
          // console.log("JOIN – room already tracked", room);
        }
        // we push this room anyway, so that when we remove it we keep tracking until all has been removed
        this.rooms_joined.push(room);
      },
      leave({ room }) {
        const index_to_remove = this.rooms_joined.findIndex(
          (rj) => rj === room
        );
        this.rooms_joined.splice(index_to_remove, 1);
        // if room isnt tracked anymore
        if (!this.rooms_joined.includes(room)) {
          // console.log("LEAVE – room isnt tracked anymore, delete store", room);
          this.socket.emit("leaveRoom", { room });
          this.$delete(this.store, room);
        } else {
          // console.log("LEAVE – room still tracked", room);
        }
      },

      emptyStore() {
        // called when client disconnects from socket
        // since we cant be sure of what happens before reconnect, we nuke all store
        // this.store = {};
      },

      async rejoinRooms() {
        console.log("rejoinRooms");
        // refresh full content of all rooms tracked
        const paths = this.rooms_joined.filter(
          (value, index, array) => array.indexOf(value) === index
        );
        for (const path of paths) {
          await this.updateStore(path);
          this.socket.emit("joinRoom", { room: path });
        }
      },
      // async getAndTrack(path) {
      //   // getFolders ou getFolder
      //   const response = await this.$axios.get(path).catch((err) => {
      // throw this.processError(err);
      //   });
      //   const content = response.data;
      //   // puis join le path en question

      //   // si disconnect, il faut relancer le get, que ça maj
      //   // l'objet côté component
      //   // et que ça rejoin la room

      //   return content;
      // },

      async _setAuthFromStorage() {
        let auth = {};

        const tokenpath = localStorage.getItem("tokenpath");
        try {
          const { token, token_path } = JSON.parse(tokenpath);
          auth.token = token;
          auth.token_path = token_path;
        } catch (err) {
          err;
        }

        const general_password = localStorage.getItem("general_password");
        if (general_password) auth.general_password = general_password;

        if (Object.keys(auth).length === 0) return;

        const Authorization = JSON.stringify(auth);

        // check with route
        const response = await this.$axios.get("_authCheck", {
          headers: {
            Authorization,
          },
        });

        if (auth.general_password) {
          if (response.data.general_password_is_valid)
            this.general_password = auth.general_password;
          else if (response.data.general_password_is_wrong) {
            this.$alertify
              .delay(4000)
              .error(response.data.general_password_is_wrong);
            this.$eventHub.$emit("app.prompt_general_password");
          }
        } else if (response.data.general_password_is_wrong) {
          this.$eventHub.$emit("app.prompt_general_password");
        }

        if (auth.token && auth.token_path)
          if (response.data.token_is_valid) {
            this.tokenpath.token = auth.token;
            this.tokenpath.token_path = auth.token_path;
            // token is valid, get author info
          } else if (response.data.token_is_wrong)
            this.$alertify.delay(4000).error(response.data.token_is_wrong);

        // Todo change all this? if a user has a valid token and token_path,
        // then they must also have access
        // so for users that are not logged in but have the password,
        // they should get a token with a path that looks like
        // token_path: "/"
        // --> meaning they can read content, but not update anything
      },
      setAuthorizationHeader() {
        this.$axios.defaults.headers.common["Authorization"] = JSON.stringify({
          token: this.tokenpath.token,
          token_path: this.tokenpath.token_path,
          general_password: this.general_password,
        });
      },
      async getCurrentAuthor() {
        await this.getFolder({
          path: this.tokenpath.token_path,
        }).catch((err) => {
          throw err;
          // TODO catch folder no existing: author was removed, for example
        });
      },
      trackCurrentAuthor() {
        this.join({ room: this.tokenpath.token_path });
      },

      folderCreated({ path, meta }) {
        // only update store if content is tracked
        if (!this.rooms_joined.includes(path)) {
          // console.log("folderCreated – room isnt tracked, not adding to store");
          return;
        }

        if (!this.store[path]) this.store[path] = new Array();
        this.store[path].push(meta);
        this.$set(this.store, meta.$path, meta);
      },

      updateProps({ changed_data, folder_to_update }) {
        Object.entries(changed_data).map(([key, value]) => {
          this.$set(folder_to_update, key, value);
        });
      },

      folderUpdated({ path, changed_data }) {
        // updated folder $path
        if (Object.prototype.hasOwnProperty.call(this.store, path)) {
          this.updateProps({
            changed_data,
            folder_to_update: this.store[path],
          });
        }

        if (path === "") return;

        // parent folder path
        const parent_folder_path = path.substr(0, path.lastIndexOf("/"));
        if (
          Object.prototype.hasOwnProperty.call(this.store, parent_folder_path)
        ) {
          const folder_to_update = this.store[parent_folder_path].find(
            (f) => f.$path === path
          );
          this.updateProps({ changed_data, folder_to_update });
        }
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
        if (!folder.$files) this.$set(folder, "$files", new Array());
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

      async getStoragePath() {
        const response = await this.$axios.get(`_storagePath`);
        const storage_path = response.data.pathToUserContent;
        return storage_path;
      },
      taskStatus({ task_id, progress }) {
        this.$eventHub.$emit("task.status", { task_id, progress });
      },
      taskEnded({ task_id, message }) {
        this.$eventHub.$emit("task.ended", { task_id, message });
      },
      async restartDodoc() {
        return await this.$axios.post(`_admin`);
      },
      async updateStore(path) {
        const response = await this.$axios.get(path).catch((err) => {
          throw this.processError(err);
        });
        const content = response.data;
        this.folderUpdated({ path, changed_data: content });
        return;
      },
      async getFolders({ path }) {
        if (this.store[path]) return this.store[path];
        const response = await this.$axios.get(path).catch((err) => {
          throw this.processError(err);
        });
        const folders = response.data.length === 0 ? [] : response.data;
        this.$set(this.store, path, folders);
        // we use the store to trigger updates to array if item is updated
        return this.store[path];
      },
      async getFolder({ path, detailed_infos = false }) {
        if (!detailed_infos && this.store[path]) return this.store[path];
        if (detailed_infos) path += `?detailed=true`;
        const response = await this.$axios.get(path).catch((err) => {
          throw this.processError(err);
        });
        const folder = response.data;
        this.$set(this.store, folder.$path, folder);
        return this.store[folder.$path];
      },
      async getArchives({ path }) {
        const response = await this.$axios.get(path);
        return response.data;
      },
      async getLocalNetworkInfos() {
        const response = await this.$axios.get("_networkInfos");
        return response.data;
      },
      async createFolder({ path, additional_meta }) {
        path = `${path}/_create`;
        const response = await this.$axios
          .post(path, additional_meta)
          .catch((err) => {
            throw this.processError(err);
          });
        return response.data.new_folder_slug;
      },
      async loginToFolder({ path, auth_infos }) {
        try {
          const response = await this.$axios.post(`${path}/_login`, auth_infos);
          const token = response.data.token;

          this.tokenpath.token = token;
          this.tokenpath.token_path = path;

          localStorage.setItem(
            "tokenpath",
            JSON.stringify({ token, token_path: path })
          );
          this.setAuthorizationHeader();
          await this.getCurrentAuthor();

          return;
        } catch (err) {
          throw this.processError(err);
        }
      },
      async logoutFromFolder() {
        const path = this.tokenpath.token_path;
        const auth_infos = {
          token: path,
        };
        try {
          // remove token locally
          this.resetToken();
          this.leave({ room: path });
          // remove token on the server
          await this.$axios.post(`${path}/_logout`, auth_infos);
          return;
        } catch (err) {
          throw this.processError(err);
        }
      },

      async submitGeneralPassword({
        password,
        remember_on_this_device = false,
      }) {
        // TODO
        await this.$axios
          .get(`_authCheck`, {
            headers: {
              Authorization: JSON.stringify({ general_password: password }),
            },
          })
          .catch((err) => {
            throw this.processError(err);
          });

        if (remember_on_this_device)
          localStorage.setItem("general_password", password);

        this.general_password = password;
        this.setAuthorizationHeader();
        return true;
      },
      disconnectFromGeneralPassword() {
        localStorage.setItem("general_password", "");
        this.general_password = "";
        this.setAuthorizationHeader();
      },

      async uploadText({ path, filename, content = "", additional_meta }) {
        let formData = new FormData();

        const file = new Blob([content], { type: "text/plain" });

        if (additional_meta)
          formData.append(filename, JSON.stringify(additional_meta));

        return await this.uploadFile({
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
            throw this.processError(err);
          });

        return res.data.meta_filename;
      },
      async copyFile({ path, new_meta = {}, path_to_destination_folder = "" }) {
        path = `${path}/_copy`;
        const response = await this.$axios
          .post(path, { new_meta, path_to_destination_folder })
          .catch((err) => {
            throw this.processError(err);
          });
        return response.data.meta_filename;
      },
      async copyFolder({ path, new_meta = {}, path_to_destination_type = "" }) {
        path = `${path}/_copy`;
        const response = await this.$axios
          .post(path, { new_meta, path_to_destination_type })
          .catch((err) => {
            throw this.processError(err);
          });
        return response.data.copy_folder_path;
      },
      async downloadFolder({ path, filename }) {
        path = `${path}.zip`;
        const response = await this.$axios({
          url: path,
          method: "GET",
          responseType: "blob",
        }).catch((err) => {
          throw this.processError(err);
        });
        saveAs(response.data, filename);
      },
      async importFolder({
        path,
        filename,
        file,
        additional_meta,
        onProgress,
      }) {
        let data = new FormData();
        data.append("file", file, filename);
        if (additional_meta)
          data.append(filename, JSON.stringify(additional_meta));
        path = `${path}/_import`;

        let res = await this.$axios
          .post(path, data, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              if (onProgress) onProgress(progressEvent);
            },
          })
          .catch((err) => {
            throw this.processError(err);
          });

        return res.data.meta_filename;
      },
      async remixFolder({
        path,
        new_meta = {},
        path_to_destination_type = "",
      }) {
        path = `${path}/_remix`;
        const response = await this.$axios
          .post(path, { new_meta, path_to_destination_type })
          .catch((err) => {
            throw this.processError(err);
          });
        return response.data.remix_folder_path;
      },
      async exportFolder({ path, instructions }) {
        path = `${path}/_export`;

        const response = await this.$axios
          .post(path, instructions)
          .catch((err) => {
            throw this.processError(err);
          });
        const task_id = response.data.task_id;
        this.$eventHub.$emit("task.started", { task_id, instructions });
        return task_id;
      },
      async generatePreviewForPublication({ path, instructions }) {
        path = `${path}/_generatePreview`;

        const response = await this.$axios
          .post(path, instructions)
          .catch((err) => {
            throw this.processError(err);
          });

        const task_id = response.data.task_id;
        return task_id;
      },
      async updateMeta({ path, new_meta }) {
        const response = await this.$axios
          .patch(path, new_meta)
          .catch((err) => {
            throw this.processError(err);
          });

        return response.data;
      },

      async updateCover({ path, new_cover_data, onProgress }) {
        path = path + `?cover`;
        if (typeof new_cover_data === "string") {
          // its a meta filename in that same folder
          const new_meta = {
            path_to_meta: new_cover_data,
          };
          await this.$axios.patch(path, new_meta).catch((err) => {
            throw this.processError(err);
          });
        } else if (typeof new_cover_data === "object") {
          let formData = new FormData();

          const original_filename = new_cover_data.name || "cover";
          formData.append("file", new_cover_data, original_filename);

          await this.$axios
            .patch(path, formData, {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                if (onProgress) onProgress(progressEvent);
              },
            })
            .catch((err) => {
              throw this.processError(err);
            });
        }

        return;
      },

      async deleteItem({ path }) {
        const response = await this.$axios.delete(path).catch((err) => {
          throw this.processError(err);
        });

        return response.data;
      },

      resetToken() {
        this.tokenpath.token = "";
        this.tokenpath.token_path = "";
        localStorage.setItem("tokenpath", undefined);
      },

      processError(err) {
        let { code, err_infos } = err?.response?.data;

        if (code) {
          if (code === "token_does_not_exist") {
            this.resetToken();
          } else if (code === "token_expired") {
            this.resetToken();
          } else if (code === "submitted_general_password_is_wrong") {
            this.$eventHub.$emit("app.prompt_general_password");
          } else if (code === "no_general_password_submitted") {
            this.$eventHub.$emit("app.prompt_general_password");
          } else if (code === "token_not_allowed_must_be_local_admin") {
            // this.$alertify.delay(4000).error("notifications.action_not_allowed");
          } else if (code === "token_not_allowed_must_be_contributors") {
            // this.$alertify.delay(4000).error("notifications.action_not_allowed");
          } else if (code === "ENOENT") code = "folder_is_missing";
          this.$alertify.delay(4000).error("Message d’erreur : " + code);
          console.error("processError – " + code);
        } else console.error("processError – NO ERROR CODES");

        this.setAuthorizationHeader();

        return { code, err_infos };
        // this.$alertify.delay(4000).error(err);
      },
    },
    computed: {},
  });
}
