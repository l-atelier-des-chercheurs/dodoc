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

      // Socket subscriptions: { [room]: { ref_count, pinned } }
      rooms: {},
      store_meta: {},

      is_tracking_users: false,
      self_user_id: null,
      users: new Array(),

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
        setTimeout(async () => {
          await this.getAndTrackUsers();
        }, 10);
      },
      async initSocketio() {
        console.log("initSocketio");
        this.socket = io({
          autoConnect: false,
        });

        await this._setAuthFromStorage();
        this.setAuthorizationHeader();

        await this.getAllAuthors();
        this.join({ room: "authors", pinned: true });

        if (this.tokenpath.token_path) {
          await this.getCurrentAuthor().catch(() => {});
          this.join({ room: this.tokenpath.token_path, pinned: true });
        }

        const sessionID = localStorage.getItem("sessionID");
        let auth = {};
        if (sessionID) auth.sessionID = sessionID;
        if (this.tokenpath.token_path)
          auth.token_path = this.tokenpath.token_path;
        if (Object.keys(auth).length > 0) this.socket.auth = auth;

        await this.socket.connect();

        // client-side
        this.socket.on("connect", () => {
          console.log("socket connected");
          this.connected = true;
          console.log("connect " + this.socket.id);
          this.$eventHub.$emit("socketio.connect", {
            socketid: this.socket.id,
          });
          this.rejoinRooms();
          if (this.is_tracking_users) this.getAndTrackUsers();
        });

        this.socket.on("session", ({ sessionID, userID }) => {
          // attach the session ID to the next reconnection attempts
          this.socket.auth = {
            ...(this.socket.auth || {}),
            sessionID,
          };
          this.self_user_id = userID;
          localStorage.setItem("sessionID", sessionID);
          this.setAuthorizationHeader();
        });
        this.socket.on("connect_error", (reason) => {
          console.log("socket connect error");
          this.$eventHub.$emit("socketio.connect_error", reason);
        });
        this.socket.on("disconnect", (reason) => {
          console.log("socket disconnected");

          this.connected = false;
          this.markAllStoreStale();
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
          // if (this.debug_mode)
          //   this.$alertify.delay(4000).log(
          //     `⤓ ` + eventName
          //   );
        });
        this.socket.on("folderCreated", this.folderCreated);
        this.socket.on("folderUpdated", this.folderUpdated);
        this.socket.on("folderRemoved", this.folderRemoved);

        this.socket.on("fileCreated", this.fileCreated);
        this.socket.on("fileUpdated", this.fileUpdated);
        this.socket.on("fileRemoved", this.fileRemoved);
        this.socket.on("filesRemoved", this.filesRemoved);

        this.socket.on("taskStatus", this.taskStatus);
        this.socket.on("taskEnded", this.taskEnded);

        this.socket.on("userJoined", this.userJoined);
        this.socket.on("userUpdated", this.userUpdated);
        this.socket.on("userLeft", this.userLeft);
      },
      disconnectSocket() {
        this.socket.disconnect();
      },
      reconnectSocket() {
        this.socket.connect();
      },
      normalizeRoomPath(room) {
        if (typeof room !== "string") return "";

        const normalized_room = room
          .replaceAll("\\", "/")
          .trim()
          .replace(/^\/+/, "")
          .replace(/\/+$/, "")
          .replace(/\/{2,}/g, "/");

        return normalized_room;
      },
      markStoreFresh(store_key) {
        this.$set(this.store_meta, store_key, {
          stale: false,
          fetched_at: Date.now(),
        });
      },
      isStoreStale(store_key) {
        const meta = this.store_meta[store_key];
        return !meta || meta.stale === true;
      },
      markAllStoreStale() {
        Object.keys(this.store).forEach((store_key) => {
          if (this.store_meta[store_key]) {
            this.$set(this.store_meta[store_key], "stale", true);
          } else {
            this.$set(this.store_meta, store_key, { stale: true });
          }
        });
      },
      isRoomSubscribed(room) {
        const normalized_room = this.normalizeRoomPath(room);
        const subscription = this.rooms[normalized_room];
        return Boolean(subscription && subscription.ref_count > 0);
      },
      getSubscribedRooms() {
        return Object.entries(this.rooms)
          .filter(([, subscription]) => subscription.ref_count > 0)
          .map(([room]) => room);
      },
      async fetchAndStore(path) {
        const normalized_path = this.normalizeRoomPath(path);
        if (!normalized_path) return;

        const response = await this.$axios.get(normalized_path).catch((err) => {
          throw this.processError(err);
        });
        const content = response.data;

        if (Array.isArray(content)) {
          this.$set(this.store, normalized_path, content);
          this.markStoreFresh(normalized_path);
          return this.store[normalized_path];
        }

        if (typeof content === "object" && content !== null) {
          const store_key = content.$path || normalized_path;
          this.$set(this.store, store_key, content);
          this.markStoreFresh(store_key);
          return this.store[store_key];
        }

        return content;
      },
      async refreshStoreForRoom(room) {
        const normalized_room = this.normalizeRoomPath(room);
        if (!normalized_room || normalized_room.startsWith("task_")) return;
        if (!this.isStoreStale(normalized_room)) return;
        await this.fetchAndStore(normalized_room);
      },
      join({ room, pinned = false }) {
        const normalized_room = this.normalizeRoomPath(room);
        if (!normalized_room) return;

        if (!this.rooms[normalized_room]) {
          this.$set(this.rooms, normalized_room, {
            ref_count: 0,
            pinned: false,
          });
        }

        const subscription = this.rooms[normalized_room];
        if (pinned) subscription.pinned = true;

        const was_unsubscribed = subscription.ref_count === 0;
        subscription.ref_count++;

        if (was_unsubscribed) this.apiJoinRoom({ room: normalized_room });
      },
      leave({ room }) {
        const normalized_room = this.normalizeRoomPath(room);
        if (!normalized_room) return;

        const subscription = this.rooms[normalized_room];
        if (!subscription || subscription.pinned) return;

        subscription.ref_count = Math.max(0, subscription.ref_count - 1);

        if (subscription.ref_count === 0) {
          if (this.socket) {
            this.socket.emit("leaveRoom", { room: normalized_room });
          }
          this.$delete(this.store, normalized_room);
          this.$delete(this.store_meta, normalized_room);
          this.$delete(this.rooms, normalized_room);
        }
      },

      async rejoinRooms() {
        for (const room of this.getSubscribedRooms()) {
          await this.refreshStoreForRoom(room);
          this.apiJoinRoom({ room });
        }
      },
      apiJoinRoom({ room }) {
        const normalized_room = this.normalizeRoomPath(room);
        if (!normalized_room) return;
        if (!this.socket) return;

        let infos = { room: normalized_room };
        if (this.tokenpath.token && this.tokenpath.token_path) {
          infos.token = this.tokenpath.token;
          infos.token_path = this.tokenpath.token_path;
        }
        this.socket.emit("joinRoom", infos);
      },
      async _setAuthFromStorage() {
        // check if password
        if (window.app_infos.instance_meta.has_general_password === true) {
          const search_params = new URLSearchParams(location.href);

          let general_password;
          if (search_params && search_params.has("general_password"))
            general_password = search_params.get("general_password");
          else if (localStorage.getItem("general_password"))
            general_password = localStorage.getItem("general_password");

          if (general_password)
            await this.submitGeneralPassword({
              password: general_password,
            }).catch(() => {
              if (localStorage.getItem("general_password"))
                localStorage.removeItem("general_password");
              this.$eventHub.$emit("app.prompt_general_password");
            });
          else this.$eventHub.$emit("app.prompt_general_password");
        }

        const token_and_tokenpath = localStorage.getItem("tokenpath");
        if (token_and_tokenpath) {
          try {
            const { token, token_path } = JSON.parse(token_and_tokenpath);
            await this.submitFolderToken({
              token,
              token_path,
            });
          } catch (err) {
            localStorage.removeItem("tokenpath");
          }
        }

        // if (Object.keys(auth).length === 0) return;

        // Todo change all this? if a user has a valid token and token_path,
        // then they must also have access
        // so for users that are not logged in but have the password,
        // they should get a token with a path that looks like
        // token_path: "/"
        // --> meaning they can read content, but not update anything
      },
      setAuthorizationHeader() {
        const sessionID = localStorage.getItem("sessionID");
        this.$axios.defaults.headers.common["Authorization"] = JSON.stringify({
          token: this.tokenpath.token,
          token_path: this.tokenpath.token_path,
          general_password: this.general_password,
          sessionID,
        });
      },
      async getAllAuthors() {
        await this.getFolders({ path: "authors" }).catch((err) => {});
      },
      async getCurrentAuthor() {
        await this.getFolder({
          path: this.tokenpath.token_path,
        }).catch((err) => {
          throw err;
          // TODO catch folder no existing: author was removed, for example
        });
      },

      async getAndTrackUsers() {
        const response = await this.$axios.get("_users").catch((err) => {
          throw this.processError(err);
        });
        const users = response.data;
        this.$set(this, "users", users);
        if (!this.is_tracking_users) {
          this.is_tracking_users = true;
          this.socket.emit("trackUsers");
        }
        return this.users;
      },
      userJoined(user) {
        const user_exists = this.users.some((u) => u.id === user.id);
        if (!user_exists) this.users.push(user);
      },
      userUpdated({ id, changed_data }) {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) {
          this.getAndTrackUsers();
        } else {
          if (!this.users[index].meta) this.$set(this.users[index], "meta", {});
          Object.entries(changed_data).map(([key, value]) => {
            this.$set(this.users[index].meta, key, value);
          });
        }
      },
      userLeft(id) {
        const index = this.users.findIndex((u) => u.id === id);
        if (index !== -1) this.users.splice(index, 1);
      },
      async unTrackUsers() {
        this.socket.emit("leaveUsers");
        this.users = [];
        this.is_tracking_users = false;
      },
      async updateSelfPath(path) {
        if (!this.self_user_id) return;
        const response = await this.$axios
          .patch(`_users/${this.self_user_id}`, {
            path,
          })
          .catch((err) => {
            throw this.processError(err);
          });
        return response.data;
      },

      folderCreated({ path, path_to_type, path_to_folder, meta }) {
        // Handle both old format (path) and new format (path_to_type)
        const type_path = this.normalizeRoomPath(path_to_type || path);
        if (!type_path) return;

        // only update store if content is tracked
        if (!this.isRoomSubscribed(type_path)) {
          // console.log("folderCreated – room isnt tracked, not adding to store");
          return;
        }
        if (!Object.prototype.hasOwnProperty.call(this.store, type_path))
          this.store[type_path] = new Array();
        this.store[type_path].push(meta);
        this.markStoreFresh(type_path);
        // this.$set(this.store, meta.$path, meta);
      },

      updateProps({ changed_data, folder_to_update }) {
        Object.entries(changed_data).map(([key, value]) => {
          this.$set(folder_to_update, key, value);
        });
      },

      folderUpdated({ path, path_to_folder, changed_data }) {
        // Handle both old format (path) and new format (path_to_folder)
        const folder_path = path_to_folder || path;

        // updated folder $path
        if (Object.prototype.hasOwnProperty.call(this.store, folder_path)) {
          this.updateProps({
            changed_data,
            folder_to_update: this.store[folder_path],
          });
        }

        if (folder_path === "") return;

        // parent folder path
        const parent_folder_path = folder_path.substr(
          0,
          folder_path.lastIndexOf("/")
        );
        if (
          Object.prototype.hasOwnProperty.call(this.store, parent_folder_path)
        ) {
          const parent_folder = this.store[parent_folder_path];
          if (Array.isArray(parent_folder)) {
            const folder_to_update = parent_folder.find(
              (f) => f.$path === folder_path
            );
            if (folder_to_update) {
              this.updateProps({ changed_data, folder_to_update });
            }
          }
        }

        if (folder_path) this.markStoreFresh(folder_path);
        if (parent_folder_path) this.markStoreFresh(parent_folder_path);
      },
      folderRemoved({ path, path_to_folder }) {
        // Handle both old format (path) and new format (path_to_folder)
        const folder_path = path_to_folder || path;

        this.$delete(this.store, folder_path);
        this.$delete(this.store_meta, folder_path);

        if (Object.prototype.hasOwnProperty.call(this.store, folder_path)) {
          this.store.$delete(folder_path);
        }

        const parent_folder_path = folder_path.substr(
          0,
          folder_path.lastIndexOf("/")
        );
        if (
          Object.prototype.hasOwnProperty.call(this.store, parent_folder_path)
        ) {
          const parent_folder = this.store[parent_folder_path];
          if (Array.isArray(parent_folder)) {
            const folder_index = parent_folder.findIndex(
              (f) => f.$path === folder_path
            );
            if (folder_index !== -1) parent_folder.splice(folder_index, 1);
          }
        }

        this.$eventHub.$emit("folder.removed", { path: folder_path });
      },

      fileCreated({ path_to_folder, meta }) {
        const folder = this.store[path_to_folder];
        if (!folder)
          if (this.debug_mode)
            this.$alertify
              .delay(4000)
              .error("Folder missing in store : " + path_to_folder);
        if (!folder.$files) this.$set(folder, "$files", new Array());
        folder.$files.push(meta);
        this.$eventHub.$emit("file.created", { meta });
      },
      fileUpdated({ path_to_folder, path_to_meta, changed_data }) {
        const folder = this.store[path_to_folder];
        if (!folder || !folder.$files) return;
        const file = folder.$files.find((file) => file.$path === path_to_meta);
        if (file)
          Object.entries(changed_data).map(([key, value]) => {
            this.$set(file, key, value);
          });
      },
      fileRemoved({ path_to_folder, path_to_meta }) {
        const folder = this.store[path_to_folder];
        if (!folder) return;
        folder.$files = folder.$files.filter(
          (file) => file.$path !== path_to_meta
        );
      },
      filesRemoved({ path_to_folder, paths_to_meta }) {
        const folder = this.store[path_to_folder];
        if (!folder) return;
        const removed = new Set(paths_to_meta);
        folder.$files = folder.$files.filter(
          (file) => !removed.has(file.$path)
        );
      },

      async getStoragePath() {
        const response = await this.$axios.get(`_storagePath`);
        const storage_path = response.data.pathToUserContent;
        return storage_path;
      },
      async getLogs() {
        const response = await this.$axios.get(`_logs`);
        const logs = response.data.logs;
        return logs;
      },
      async downloadLog({ filename }) {
        const response = await this.$axios({
          url: `_logs/${encodeURIComponent(filename)}`,
          method: "GET",
          responseType: "blob",
        }).catch((err) => {
          throw this.processError(err);
        });

        saveAs(response.data, filename);
      },
      async restartApp() {
        await this.$axios.post(`_restartApp`);
      },
      taskStatus({ task_id, progress }) {
        this.$eventHub.$emit("task.status", { task_id, progress });
      },
      taskEnded({ task_id, event, message }) {
        this.$eventHub.$emit("task.ended", { task_id, event, message });
      },
      async restartDodoc() {
        return await this.$axios.post(`_admin`);
      },
      async updateStore(path) {
        return this.fetchAndStore(path);
      },
      async getFolders({ path }) {
        const normalized_path = this.normalizeRoomPath(path);
        if (
          this.store[normalized_path] &&
          !this.isStoreStale(normalized_path)
        ) {
          return this.store[normalized_path];
        }

        await this.fetchAndStore(normalized_path);

        if (!Array.isArray(this.store[normalized_path])) {
          console.error(
            `getFolders: Expected array for path "${normalized_path}" but got:`,
            this.store[normalized_path]
          );
          this.$set(this.store, normalized_path, []);
        }

        this.markStoreFresh(normalized_path);
        return this.store[normalized_path];
      },
      async getFolder({ path, no_files = false, detailed_infos = false }) {
        const use_store = detailed_infos === false && no_files === false;
        const store_path = this.normalizeRoomPath(path.split("?")[0]);
        if (
          use_store &&
          this.store[store_path] &&
          !this.isStoreStale(store_path)
        ) {
          return this.store[store_path];
        }

        let request_path = store_path;
        let queries = [];
        if (detailed_infos) queries.push("detailed=true");
        if (no_files) queries.push("no_files=true");
        if (queries.length > 0) request_path += `?${queries.join("&")}`;

        const response = await this.$axios.get(request_path).catch((err) => {
          throw this.processError(err);
        });
        let folder = response.data;

        if (
          typeof folder !== "object" ||
          folder === null ||
          Array.isArray(folder)
        ) {
          console.error(
            `getFolder: Expected object for path "${request_path}" but got:`,
            folder
          );
          folder = {};
        }

        if (use_store) {
          const store_key = folder.$path || store_path;
          this.$set(this.store, store_key, folder);
          this.markStoreFresh(store_key);
          return this.store[store_key];
        }

        return folder;
      },
      async getFoldersBySlugs({
        path,
        folder_slugs,
        no_files = false,
        detailed_infos = false,
      }) {
        const batch_size = 500;
        const normalized_path = this.normalizeRoomPath(path);
        const unique_folder_slugs = [...new Set(folder_slugs)];
        const use_store = detailed_infos === false && no_files === false;
        const all_folders = [];
        const all_failed = [];

        for (let i = 0; i < unique_folder_slugs.length; i += batch_size) {
          const folder_slugs_batch = unique_folder_slugs.slice(
            i,
            i + batch_size
          );
          const response = await this.$axios
            .post(`${normalized_path}/_getfolders`, {
              folder_slugs: folder_slugs_batch,
              no_files,
              detailed: detailed_infos,
            })
            .catch((err) => {
              throw this.processError(err);
            });

          const { folders = [], failed = [] } = response.data;
          all_folders.push(...folders);
          all_failed.push(...failed);
        }

        if (use_store) {
          for (const folder of all_folders) {
            if (folder?.$path) {
              this.$set(this.store, folder.$path, folder);
              this.markStoreFresh(folder.$path);
            }
          }
        }

        return { folders: all_folders, failed: all_failed };
      },

      async getPublicFolder({ path, superadmintoken }) {
        path += "/_public";

        let queries = [];
        if (superadmintoken) queries.push("superadmintoken=" + superadmintoken);
        if (queries.length > 0) path += `?${queries.join("&")}`;

        const response = await this.$axios.get(`${path}`).catch((err) => {
          throw this.processError(err);
        });
        const folder = response.data;
        this.$set(this.store, folder.$path, folder);
        return this.store[folder.$path];
      },
      async getBin({ path }) {
        const response = await this.$axios.get(`${path}/_bin`).catch((err) => {
          throw this.processError(err);
        });
        return response.data;
      },
      async restoreFromBin({ path }) {
        const response = await this.$axios
          .post(`${path}/_restore`)
          .catch((err) => {
            throw this.processError(err);
          });
        return response.data;
      },

      async getFile({ path }) {
        const response = await this.$axios.get(path);
        return response.data;
      },
      async getLocalNetworkInfos() {
        const response = await this.$axios.get("_networkInfos");
        return response.data;
      },
      async createFolder({ path, additional_meta }) {
        const response = await this.$axios
          .post(`${path}/_create`, additional_meta)
          .catch((err) => {
            throw this.processError(err);
          });
        this.$eventHub.$emit("hooks.createFolder", { path });
        return response.data.new_folder_slug;
      },
      async loginToFolder({ path, password }) {
        try {
          const response = await this.$axios.post(`${path}/_login`, {
            $password: password,
          });
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
      async recoverPassword({ path }) {
        try {
          const anonymous_email_used = await this.$axios.post(
            `${path}/_recoverPassword`
          );
          return anonymous_email_used;
        } catch (err) {
          throw this.processError(err);
        }
      },
      async resetPassword({ path, new_password, token }) {
        const response = await this.$axios.post(`${path}/_resetPassword`, {
          new_password,
          token,
        });
        return response.data;
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
      async submitFolderToken({ token, token_path }) {
        await this.$axios
          .get(`_tokenCheck`, {
            headers: {
              Authorization: JSON.stringify({ token, token_path }),
            },
          })
          .catch((err) => {
            throw this.processError(err);
          });

        this.tokenpath.token = token;
        this.tokenpath.token_path = token_path;
        this.setAuthorizationHeader();
        return true;
      },
      disconnectFromGeneralPassword() {
        localStorage.setItem("general_password", "");
        this.general_password = "";
        this.setAuthorizationHeader();
      },

      async uploadText({ path, filename, content = "", additional_meta }) {
        const file = new Blob([content], { type: "text/plain" });
        return await this.uploadFile({
          path,
          filename,
          file,
          additional_meta,
        });
      },
      async uploadFile({
        path,
        filename,
        file,
        additional_meta,
        onProgress,
        abort_signal,
      }) {
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
        let res = await this.$axios
          .post(`${path}/_upload`, data, {
            headers,
            signal: abort_signal,
            onUploadProgress: (progressEvent) => {
              if (onProgress) onProgress(progressEvent);
            },
          })
          .catch((err) => {
            throw this.processError(err);
          });
        this.$eventHub.$emit("hooks.uploadFile", { path });
        const { uploaded_meta, meta_filename } = res.data;
        return { uploaded_meta, meta_filename };
      },
      async copyFile({ path, new_meta = {}, path_to_destination_folder = "" }) {
        const response = await this.$axios
          .post(`${path}/_copy`, { new_meta, path_to_destination_folder })
          .catch((err) => {
            throw this.processError(err);
          });
        this.$eventHub.$emit("hooks.copyFile", { path });
        return response.data.meta_filename;
      },
      async copyFolder({
        path,
        new_meta = {},
        path_to_destination_type = "",
        is_copy_or_move = "copy",
      }) {
        const response = await this.$axios
          .post(`${path}/_copy`, {
            new_meta,
            path_to_destination_type,
            is_copy_or_move,
          })
          .catch((err) => {
            throw this.processError(err);
          });
        this.$eventHub.$emit("hooks.copyFolder", { path });
        return response.data.copy_folder_path;
      },
      async downloadFolder({ path }) {
        const response = await this.$axios({
          url: `${path}.zip`,
          method: "GET",
          responseType: "blob",
        }).catch((err) => {
          throw this.processError(err);
        });
        this.$eventHub.$emit("hooks.downloadFolder", { path });
        let filename = "download.zip";
        try {
          const contentDispositionHeader =
            response.headers["content-disposition"];
          const regExpFilename = /filename="(?<filename>.*)"/;
          filename =
            regExpFilename.exec(contentDispositionHeader)?.groups?.filename ??
            "download.zip";
        } catch (err) {}
        saveAs(response.data, filename);
      },
      async downloadSources({ path, meta_filenames }) {
        const response = await this.$axios({
          url: `${path}/_downloadSources`,
          method: "POST",
          data: { meta_filenames },
          responseType: "blob",
        }).catch((err) => {
          throw this.processError(err);
        });
        let filename = "sources.zip";
        try {
          const contentDispositionHeader =
            response.headers["content-disposition"];
          const regExpFilename = /filename="(?<filename>.*)"/;
          filename =
            regExpFilename.exec(contentDispositionHeader)?.groups?.filename ??
            "sources.zip";
        } catch (err) {}
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

        let res = await this.$axios
          .post(`${path}/_import`, data, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              if (onProgress) onProgress(progressEvent);
            },
          })
          .catch((err) => {
            throw this.processError(err);
          });
        this.$eventHub.$emit("hooks.importFolder", { path });
        return res.data.new_folder_meta;
      },
      async remixFolder({
        path,
        new_meta = {},
        path_to_destination_type = "",
      }) {
        const response = await this.$axios
          .post(`${path}/_remix`, { new_meta, path_to_destination_type })
          .catch((err) => {
            throw this.processError(err);
          });
        this.$eventHub.$emit("hooks.remixFolder", { path });
        return response.data.remix_folder_path;
      },
      async exportFolder({ path, instructions }) {
        if (instructions.export_to_parent_folder === undefined)
          instructions.export_to_parent_folder = true;
        const response = await this.$axios
          .post(`${path}/_export`, instructions)
          .catch((err) => {
            throw this.processError(err);
          });
        const task_id = response.data.task_id;
        this.$eventHub.$emit("task.started", { task_id, instructions });
        this.$eventHub.$emit("hooks.exportFolder", { path });
        return task_id;
      },
      async optimizeFile({ path, instructions }) {
        if (instructions.export_to_parent_folder === undefined)
          instructions.export_to_parent_folder = false;
        const response = await this.$axios
          .post(`${path}/_optimize`, instructions)
          .catch((err) => {
            throw this.processError(err);
          });
        const task_id = response.data.task_id;
        this.$eventHub.$emit("task.started", { task_id, instructions });
        this.$eventHub.$emit("hooks.optimizeFile", { path });
        return task_id;
      },
      async generatePreviewForPublication({ path, instructions }) {
        const response = await this.$axios
          .post(`${path}/_generatePreview`, instructions)
          .catch((err) => {
            throw this.processError(err);
          });
        this.$eventHub.$emit("hooks.generatePreviewForPublication", { path });
        const task_id = response.data.task_id;
        return task_id;
      },
      async updateMeta({ path, new_meta }) {
        const response = await this.$axios
          .patch(path, new_meta)
          .catch((err) => {
            throw this.processError(err);
          });
        const { changed_data, path_to_meta: response_path_to_meta } =
          response.data || {};
        if (changed_data && Object.keys(changed_data).length > 0) {
          const clean_path = path.split("?")[0];
          if (response_path_to_meta) {
            const path_to_meta = response_path_to_meta;
            const last_slash_index = path_to_meta.lastIndexOf("/");
            if (last_slash_index > 0) {
              const path_to_folder = path_to_meta.slice(0, last_slash_index);
              this.fileUpdated({
                path_to_folder,
                path_to_meta,
                changed_data,
              });
            }
          } else {
            this.folderUpdated({
              path_to_folder: clean_path,
              changed_data,
            });
          }
        }
        this.$eventHub.$emit("hooks.updateMeta", { path });
        return response.data;
      },
      async getFieldHistory({ path }) {
        const response = await this.$axios
          .get(`${path}/_history`)
          .catch((err) => {
            throw this.processError(err);
          });
        return response.data.entries || [];
      },
      async regenerateThumbs({ path }) {
        const response = await this.$axios
          .patch(`${path}/_regenerateThumbs`)
          .catch((err) => {
            throw this.processError(err);
          });
        this.$eventHub.$emit("hooks.regenerateThumbs", { path });
        return response.data;
      },
      async updateCover({ path, new_cover_data, onProgress }) {
        if (typeof new_cover_data === "string") {
          // its a meta filename in that same folder
          const new_meta = {
            path_to_meta: new_cover_data,
          };
          await this.$axios.patch(`${path}?cover`, new_meta).catch((err) => {
            throw this.processError(err);
          });
        } else if (typeof new_cover_data === "object") {
          let formData = new FormData();

          const original_filename = new_cover_data.name || "cover";
          formData.append("file", new_cover_data, original_filename);

          await this.$axios
            .patch(`${path}?cover`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                if (onProgress) onProgress(progressEvent);
              },
            })
            .catch((err) => {
              throw this.processError(err);
            });
        }
        this.$eventHub.$emit("hooks.updateCover", { path });
        return;
      },

      async deleteItem({ path }) {
        const response = await this.$axios.delete(path).catch((err) => {
          throw this.processError(err);
        });
        this.$eventHub.$emit("hooks.deleteItem", { path });
        return response.data;
      },
      async deleteItems({ path, meta_filenames }) {
        const response = await this.$axios
          .post(`${path}/_removefiles`, { meta_filenames })
          .catch((err) => {
            throw this.processError(err);
          });
        const { success, failed } = response.data;
        this.$eventHub.$emit("hooks.deleteItems", { path, success, failed });
        if (failed.length > 0)
          this.$alertify
            .delay(4000)
            .error(`${failed.length} file(s) could not be deleted.`);
        return { success, failed };
      },
      async deleteFolders({ path, folder_slugs }) {
        const response = await this.$axios
          .post(`${path}/_removefolders`, { folder_slugs })
          .catch((err) => {
            throw this.processError(err);
          });
        const { success, failed } = response.data;
        this.$eventHub.$emit("hooks.deleteFolders", { path, success, failed });
        if (failed.length > 0)
          this.$alertify
            .delay(4000)
            .error(`${failed.length} folder(s) could not be deleted.`);
        return { success, failed };
      },

      resetToken() {
        this.tokenpath.token = "";
        this.tokenpath.token_path = "";
        localStorage.setItem("tokenpath", undefined);
      },

      processError(err) {
        const response_data = err?.response?.data || {};
        let { code, err_infos } = response_data;
        if (!code && err?.code) code = err.code;

        if (code) {
          if (code === "ERR_CANCELED") {
            // Request cancellation is expected in some UX flows (e.g. interrupted upload).
          } else if (code === "token_does_not_exist") {
            this.resetToken();
          } else if (code === "token_expired") {
            this.resetToken();
          } else if (code === "submitted_general_password_is_wrong") {
            this.$eventHub.$emit("app.prompt_general_password");
          } else if (code === "no_general_password_submitted") {
            this.$eventHub.$emit("app.prompt_general_password");
          } else if (code === "not_allowed") {
            this.$eventHub.$emit("app.notify_error", code);
          } else if (code === "file_size_limit_exceeded") {
            let msg = "File size limit exceeded. Maximum file size is ";
            msg +=
              err_infos.upload_max_file_size_in_mo +
              " Mo. Please try again with a smaller file.";
            this.$eventHub.$emit("app.file_size_limit_exceeded", msg);
          } else if (code === "ENOENT") code = "folder_is_missing";
          if (code !== "ERR_CANCELED") {
            // this.$alertify.delay(4000).error("Message d'erreur : " + code);
            console.error("processError – " + code);
          }
        } else console.error("processError – NO ERROR CODES");

        this.setAuthorizationHeader();

        return { code, err_infos };
        // this.$alertify.delay(4000).error(err);
      },
    },
    computed: {
      all_devices_connected() {
        return this.users.map((u) => ({
          ...u,
          is_self: u.id === this.self_user_id,
        }));
      },
      other_devices_connected() {
        return this.all_devices_connected.filter((u) => !u.is_self);
      },
    },
  });
}
