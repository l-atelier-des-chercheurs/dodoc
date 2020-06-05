<template>
  <div>
    <div v-if="edit_author_mode" class="m_authorsList--editAuthor">
      <EditAuthor
        :author="author"
        @close="edit_author_mode = false"
        :read_only="read_only"
      />
    </div>

    <div
      v-else
      class="m_author"
      :class="{
        'is--selected': is_logged_in_as_author,
        'is--editMode': edit_author_mode,
      }"
      @click.stop="
        !is_logged_in_as_author && can_login_as_author
          ? setAuthorWithoutPassword()
          : author.password === 'has_pass'
          ? (show_input_password_field = true)
          : ''
      "
    >
      <button
        v-if="
          (can_login_as_author && is_logged_in_as_author) ||
          $root.current_author_is_admin
        "
        type="button"
        class="buttonLink m_author--editButton"
        @click.stop="edit_author_mode = !edit_author_mode"
      >
        <svg
          version="1.1"
          class="inline-svg"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="100.7px"
          height="101px"
          viewBox="0 0 100.7 101"
          style="enable-background: new 0 0 100.7 101;"
          xml:space="preserve"
        >
          <path
            class="st0"
            d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
                L19.1,91.5z"
          />
        </svg>
        <span class style="display: none;">{{ $t("edit") }}</span>
      </button>

      <button
        v-if="
          (can_login_as_author && is_logged_in_as_author) ||
          $root.current_author_is_admin
        "
        type="button"
        class="buttonLink m_author--removeButton"
        @click.stop="removeAuthor(author)"
      >
        <svg
          version="1.1"
          class="inline-svg"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="91.6px"
          height="95px"
          viewBox="0 0 91.6 95"
          style="enable-background: new 0 0 91.6 95;"
          xml:space="preserve"
        >
          <path
            class="st0"
            d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
                    l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
          />
        </svg>
        <span class style="display: none;">{{ $t("remove") }}</span>
      </button>

      <div class="m_author--card">
        <img
          v-if="!!author.preview"
          width="100"
          height="100"
          :src="urlToPortrait(author.slugFolderName, author.preview)"
          draggable="false"
        />
        <div class="m_author--name">{{ author.name }}</div>
        <div class="m_author--role" v-if="author.role">
          <label>{{ $t(author.role) }}</label>
        </div>

        <div class="m_author--connected" v-if="author_is_connected" @click.stop>
          <label class="">
            <button
              type="button"
              class="button-nostyle padding-none text-uc button-triangle"
              :class="{ 'is--active': show_connection_information }"
              @click.stop="
                show_connection_information = !show_connection_information
              "
            >
              {{ $t("currently_connected") }}
            </button>
          </label>
          <div v-if="show_connection_information && author_looking_at">
            <div
              class="m_metaField"
              v-if="
                author_looking_at.looking_at_project &&
                author_looking_at.looking_at_project.slugFolderName &&
                $root.getFolder({
                  type: 'projects',
                  slugFolderName:
                    author_looking_at.looking_at_project.slugFolderName,
                })
              "
            >
              <div>{{ $t("project") }}</div>
              <div>
                <button
                  type="button"
                  @click="
                    closeAuthorAndShowProject(
                      author_looking_at.looking_at_project.slugFolderName
                    )
                  "
                  :content="$t('open_project')"
                  v-tippy="{
                    placement: 'top',
                    delay: [600, 0],
                  }"
                  style="text-transform: initial;"
                >
                  {{
                    $root.getFolder({
                      type: "projects",
                      slugFolderName:
                        author_looking_at.looking_at_project.slugFolderName,
                    }).name
                  }}

                  ↑
                </button>
              </div>
            </div>
            <div
              class="m_metaField"
              v-if="
                author_looking_at.editing_media &&
                author_looking_at.editing_media.slugFolderName &&
                author_looking_at.editing_media.metaFileName &&
                $root.getFolder({
                  type: 'projects',
                  slugFolderName:
                    author_looking_at.looking_at_project.slugFolderName,
                })
              "
            >
              <div>{{ $t("media") }}</div>
              <div>
                <button
                  type="button"
                  @click="
                    closeAuthorAndShowMedia({
                      slugFolderName:
                        author_looking_at.looking_at_project.slugFolderName,
                      metaFileName:
                        author_looking_at.editing_media.metaFileName,
                    })
                  "
                  :content="$t('open_project')"
                  v-tippy="{
                    placement: 'top',
                    delay: [600, 0],
                  }"
                  style="text-transform: initial;"
                >
                  {{
                    $root.getFolder({
                      type: "projects",
                      slugFolderName:
                        author_looking_at.looking_at_project.slugFolderName,
                    }).name
                  }}
                  / {{ author_looking_at.editing_media.metaFileName }}

                  ↑
                </button>
              </div>
            </div>
            <div
              class="m_metaField"
              v-if="
                author_looking_at.looking_at_publi &&
                author_looking_at.looking_at_publi.slugFolderName &&
                $root.getFolder({
                  type: 'publications',
                  slugFolderName:
                    author_looking_at.looking_at_publi.slugFolderName,
                })
              "
            >
              <div>{{ $t("publication") }}</div>
              <div>
                <button
                  type="button"
                  @click="
                    closeAuthorAndShowPubli(
                      author_looking_at.looking_at_publi.slugFolderName
                    )
                  "
                  :content="$t('open_project')"
                  v-tippy="{
                    placement: 'top',
                    delay: [600, 0],
                  }"
                  style="text-transform: initial;"
                >
                  {{
                    $root.getFolder({
                      type: "publications",
                      slugFolderName:
                        author_looking_at.looking_at_publi.slugFolderName,
                    }).name
                  }}

                  ↑
                </button>
              </div>
            </div>
            <div
              class="m_metaField"
              v-if="
                author_looking_at.looking_at_chat &&
                author_looking_at.looking_at_chat.slugFolderName &&
                $root.getFolder({
                  type: 'chats',
                  slugFolderName:
                    author_looking_at.looking_at_chat.slugFolderName,
                })
              "
            >
              <div>{{ $t("chat") }}</div>
              <div>
                <button
                  type="button"
                  @click="
                    closeAuthorAndShowChat(
                      author_looking_at.looking_at_chat.slugFolderName
                    )
                  "
                  :content="$t('open_project')"
                  v-tippy="{
                    placement: 'top',
                    delay: [600, 0],
                  }"
                  style="text-transform: initial;"
                >
                  {{
                    $root.getFolder({
                      type: "chats",
                      slugFolderName:
                        author_looking_at.looking_at_chat.slugFolderName,
                    }).name
                  }}
                  ↑
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          class
          v-if="
            can_login_as_author &&
            author.password === 'has_pass' &&
            context !== 'full'
          "
        >
          <label>{{ $t("protected_by_pass") }}</label>
        </div>
        <button
          v-if="!can_login_as_author"
          type="button"
          class="buttonLink _open_pwd_input"
          :class="{ 'is--active': show_input_password_field }"
          style
          :readonly="read_only"
          @click.stop="show_input_password_field = !show_input_password_field"
        >
          {{ $t("password_required_to_open") }}
        </button>

        <div
          class="padding-verysmall _pwd_input"
          v-if="show_input_password_field && !can_login_as_author"
        >
          <div class="margin-bottom-small">
            <label>{{ $t("password") }}</label>
            <input
              type="password"
              ref="passwordField"
              @keydown.enter.prevent="submitPassword"
              required
              autofocus
              placeholder="…"
            />
          </div>

          <button
            type="button"
            class="button-greenthin"
            @click="submitPassword"
          >
            {{ $t("send") }}
          </button>
        </div>

        <button
          type="button"
          v-if="
            author.slugFolderName !== $root.current_author.slugFolderName &&
            can_login_as_author
          "
          class="button-thin bg-bleumarine"
          @click.stop="setAuthorWithoutPassword()"
        >
          {{ $t("login") }}
        </button>
        <button
          type="button"
          v-if="author.slugFolderName === $root.current_author.slugFolderName"
          class="button-redthin"
          @click.stop="unsetAuthor()"
        >
          {{ $t("logout") }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import EditAuthor from "./../subcomponents/EditAuthor.vue";

export default {
  props: {
    author: Object,
  },
  components: {
    EditAuthor,
  },
  data() {
    return {
      edit_author_mode: false,
      show_input_password_field: false,
      show_connection_information: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("authors.submitPassword", this.submitPassword);
  },
  beforeDestroy() {
    this.$eventHub.$off("authors.submitPassword", this.submitPassword);
  },
  watch: {
    show_input_password_field: function () {
      if (this.show_input_password_field) {
        this.$nextTick(() => {
          this.$refs.passwordField.focus();
        });
      }
    },
  },
  computed: {
    can_login_as_author() {
      // not using root’s canEditFolder because authors have some specific props, namely that an admin cannot fake being
      // an author — this will delog him/her
      return this.canEditFolder({
        type: "authors",
        slugFolderName: this.author.slugFolderName,
      });
    },
    is_logged_in_as_author() {
      return (
        this.author.slugFolderName === this.$root.current_author.slugFolderName
      );
    },
    author_is_connected() {
      if (!this.$root.unique_clients) return false;
      return this.$root.unique_clients.find((client) => {
        return (
          client.data &&
          client.data.author &&
          client.data.author.slugFolderName === this.author.slugFolderName
        );
      });
    },
    author_looking_at() {
      if (!this.author_is_connected || !this.author_is_connected.data)
        return false;
      return this.author_is_connected.data;
    },
  },
  methods: {
    setAuthorWithoutPassword() {
      this.$auth.removeAllFoldersPassword({
        type: "authors",
      });

      this.$auth.updateFoldersPasswords({
        authors: {
          [this.author.slugFolderName]: "",
        },
      });
      this.$socketio.sendAuth();

      this.checkResultsFromLogin({
        slugFolderName: this.author.slugFolderName,
      });
    },
    canEditFolder: function ({ type, slugFolderName }) {
      if (!this.$root.store[type].hasOwnProperty(slugFolderName)) return false;

      const folder = this.$root.store[type][slugFolderName];

      // if no password && no editing limits
      if (folder.password !== "has_pass") return true;

      // if password is set
      if (folder.password === "has_pass") {
        return this.$root.state.list_authorized_folders.some((i) => {
          return (
            !!i &&
            i.hasOwnProperty("type") &&
            i.type === type &&
            i.hasOwnProperty("allowed_slugFolderNames") &&
            i.allowed_slugFolderNames.indexOf(slugFolderName) >= 0
          );
        });
      }

      return false;
    },

    submitPassword({
      slugFolderName,
      password = this.$auth.hashCode(this.$refs.passwordField.value),
    }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`Author • METHODS / submitPassword`);

      if (slugFolderName && slugFolderName !== this.author.slugFolderName)
        return;

      this.$auth.removeAllFoldersPassword({
        type: "authors",
      });
      this.$auth.updateFoldersPasswords({
        authors: {
          [this.author.slugFolderName]: password,
        },
      });
      this.$socketio.sendAuth();

      // check if password matches or not
      this.checkResultsFromLogin({
        slugFolderName: this.author.slugFolderName,
      });
    },
    checkResultsFromLogin({ slugFolderName }) {
      this.$eventHub.$once("socketio.authentificated", () => {
        if (
          this.$root.state.list_authorized_folders.some(
            (f) =>
              f.type === "authors" &&
              f.allowed_slugFolderNames.includes(slugFolderName)
          )
        ) {
          this.show_input_password_field = false;
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(
              this.$t("notifications.connected_as") +
                "<i>" +
                this.author.name +
                "</i>"
            );
          this.$emit("close");
        } else {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.wrong_password"));
          this.$refs.passwordField.value = "";
          this.$refs.passwordField.focus();
        }
      });
    },
    closeAuthorAndShowProject(slugFolderName) {
      this.$emit("close");
      this.$root.openProject(slugFolderName);
    },
    closeAuthorAndShowMedia({ slugFolderName, metaFileName }) {
      this.$emit("close");
      this.$root.openMedia({ slugProjectName: slugFolderName, metaFileName });
    },
    closeAuthorAndShowPubli(slugFolderName) {
      this.$emit("close");
      if (!this.$root.current_publication) {
        this.openPubliPanel();
        this.$eventHub.$emit("resizePanels", [
          { size: 40 },
          { size: 60 },
          { size: 0 },
        ]);
      }
      this.$nextTick(() => {
        this.$root.openPublication(slugFolderName);
      });
    },
    closeAuthorAndShowChat(slugFolderName) {
      this.$emit("close");
      if (!this.$root.current_chat) {
        this.$root.openChatPanel();
        this.$eventHub.$emit("resizePanels", [
          { size: 40 },
          { size: 0 },
          { size: 60 },
        ]);
      }
      this.$nextTick(() => {
        this.$root.openChat(slugFolderName);
      });
    },
    removeAuthor() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`Author • METHODS / removeAuthor`);

      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveAuthor"),
          () => {
            this.$root.removeFolder({
              type: "authors",
              slugFolderName: this.author.slugFolderName,
            });
          },
          () => {}
        );
    },
    unsetAuthor() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`Author • METHODS / unsetAuthor`);

      this.$root.unsetAuthor();
    },
    urlToPortrait(slug, preview) {
      if (!preview) return "";
      let pathToSmallestThumb = preview.filter((m) => m.size === 180)[0].path;
      return pathToSmallestThumb;
    },
  },
};
</script>
<style lang="scss" scoped>
._pwd_input,
._open_pwd_input {
  position: relative;
  z-index: 1;
}
</style>
