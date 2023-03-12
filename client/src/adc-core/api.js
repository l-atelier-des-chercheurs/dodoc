import { io } from "socket.io-client";
import Vue from "vue";

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

        if (this.tokenpath.token_path) await this.getCurrentAuthor();

        // todo also use token for socketio connection
        this.socket.connect();

        // client-side
        this.socket.on("connect", () => {
          console.log("connect " + this.socket.id);
          this.$eventHub.$emit("socketio.connect", {
            socketid: this.socket.id,
          });
          this.rejoinRooms();
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

        this.socket.on("adminSettingsUpdated", this.adminSettingsUpdated);
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
        this.socket.emit("joinRoom", { room });
        this.rooms_joined.push(room);
      },
      leave({ room }) {
        this.socket.emit("leaveRoom", { room });
        this.rooms_joined = this.rooms_joined.filter((rj) => rj !== room);
      },
      rejoinRooms() {
        console.log("rejoinRooms" + this.rooms_joined.join(", "));

        this.rooms_joined.map((rj) =>
          this.socket.emit("joinRoom", { room: rj })
        );
      },

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

        if (auth.general_password)
          if (response.data.general_password_is_valid)
            this.general_password = auth.general_password;
          else if (response.data.general_password_is_wrong)
            this.$alertify
              .delay(4000)
              .error(response.data.general_password_is_wrong);

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
          err;
          // TODO catch folder no existing: author was removed, for example
        });
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

      async getSettings() {
        const response = await this.$axios.get(`_admin`);
        const admin_settings = response.data;
        this.$set(this.store, "_admin", admin_settings);
        return this.store["_admin"];
      },
      adminSettingsUpdated({ changed_data }) {
        if (this.store["_admin"])
          Object.entries(changed_data).map(([key, value]) => {
            this.$set(this.store["_admin"], key, value);
          });
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

      async editSettings(settings) {
        const response = await this.$axios
          .patch(`_admin`, settings)
          .catch((err) => {
            this.onError(err);
            throw err;
          });
        return response.data;
      },
      async getFolders({ path }) {
        if (this.store[path]) return this.store[path];

        const response = await this.$axios.get(path).catch((err) => {
          this.onError(err);
          throw err;
        });
        const folders = response.data;
        // folders.map((f) => this.$set(this.store, f.$path, f));
        this.$set(this.store, path, folders);
        // we use the store to trigger updates to array if item is updated
        return this.store[path];
      },
      async getFolder({ path }) {
        if (this.store[path]) return this.store[path];

        const response = await this.$axios.get(path).catch((err) => {
          this.onError(err);
          throw err;
        });
        const folder = response.data;
        this.$set(this.store, folder.$path, folder);
        return this.store[folder.$path];
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
        } catch (e) {
          throw _getErrorMsgFromCode(e.response.data.code);
        }
      },
      async logoutFromFolder() {
        const auth_infos = {
          token: this.tokenpath.token,
        };
        const path = this.tokenpath.token_path;
        try {
          // remove token locally
          this.resetToken();
          // remove token on the server
          await this.$axios.post(`${path}/_logout`, auth_infos);
          return;
        } catch (e) {
          if (e.response.data.code)
            throw _getErrorMsgFromCode(e.response.data.code);
          else throw e.response.data;
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
            this.onError(err);
            throw err;
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
            this.$alertify.delay(4000).error(err);
            throw err;
          });

        return res.data.meta_filename;
      },
      async duplicateFile({ path, new_meta }) {
        path = `${path}/_duplicate`;

        const response = await this.$axios.post(path, new_meta).catch((err) => {
          this.onError(err);
          throw err;
        });

        return response.data.meta_filename;
      },
      async exportFolder({ path, instructions }) {
        path = `${path}/_export`;

        const response = await this.$axios
          .post(path, instructions)
          .catch((err) => {
            this.onError(err);
            throw err;
          });

        const task_id = response.data.task_id;
        this.$eventHub.$emit("task.started", { task_id, instructions });
      },
      async updateMeta({ path, new_meta }) {
        const response = await this.$axios
          .patch(path, new_meta)
          .catch((err) => {
            this.onError(err);
            throw err;
          });

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
            this.onError(err);
            throw err;
          });

        return;
      },

      async deleteItem({ path }) {
        const response = await this.$axios.delete(path).catch((err) => {
          this.onError(err);
          throw err;
        });

        return response.data;
      },

      resetToken() {
        this.tokenpath.token = "";
        this.tokenpath.token_path = "";
        localStorage.setItem("tokenpath", undefined);
      },

      onError(err) {
        console.error(err.response.data?.message);
        if (err.response.data?.message === "token_does_not_exist") {
          this.resetToken();
        } else if (err.response.data?.message === "token_expired") {
          this.resetToken();
        } else if (err.response.data?.message === "wrong_general_password") {
          this.$eventHub.$emit("app.prompt_general_password");
        } else if (
          err.response.data?.message === "no_general_password_submitted"
        ) {
          this.$eventHub.$emit("app.prompt_general_password");
        } else if (err.response.data?.message === "author_not_allowed") {
          // invalidate token
          // this.resetToken();
          // this.$alertify
          //   .delay(4000)
          //   .error(this.$t("notifications.author_not_allowed"));
        }

        this.setAuthorizationHeader();
        this.$alertify.delay(4000).error(err);
      },
    },
    computed: {},
  });
}

function _getErrorMsgFromCode(code) {
  if (code === "ENOENT") return "folder_is_missing";
  // submitted_password_is_wrong

  return code;
}
