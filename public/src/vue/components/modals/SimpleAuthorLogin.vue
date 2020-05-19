<template>
  <Modal
    ref="modal"
    @close="$emit('close')"
    :typeOfModal="'SmallAndScroll'"
    :prevent_close="true"
    :is_loading="is_sending_content_to_server"
  >
    <template slot="header">
      <span class>{{ $t("account") }}</span>
    </template>

    <template slot="preview">
      <div class="">
        <p class="margin-medium">
          <template
            v-if="$root.current_publication.editing_limited_to === 'everybody'"
          >
            {{ $t("create_an_account_or_login_to_participate") }}
          </template>
          <template v-else>
            {{ $t("login_to_edit_existing_participation") }}
          </template>
        </p>
        <div
          class="m_sideBySideSwitches"
          v-if="$root.current_publication.editing_limited_to !== 'only_authors'"
        >
          <label for="CreateAccount">
            <input
              type="radio"
              id="CreateAccount"
              value="CreateAccount"
              v-model="current_mode"
            />
            {{ $t("create_account") }}
          </label>
          <label for="Login">
            <input
              type="radio"
              id="Login"
              value="Login"
              v-model="current_mode"
            />
            {{ $t("login") }}
          </label>
        </div>
        <div v-else class="margin-medium"></div>

        <div class="margin-medium">
          <transition name="fade_fast" mode="out-in" :duration="250">
            <div v-if="current_mode === 'CreateAccount'">
              <CreateAuthor
                @close="show_create_author_panel = false"
                :read_only="read_only"
                :mode="'simple_login'"
              />
            </div>
            <form
              v-else-if="current_mode === 'Login'"
              @submit.prevent="loginAs"
            >
              <!-- Human name -->
              <div class="margin-bottom-small">
                <label>{{ $t("name_or_pseudo") }}</label>
                <input
                  type="text"
                  v-model.trim="login_author_name"
                  required
                  autofocus
                />
              </div>

              <input type="email" disabled="disabled" style="display: none;" />

              <div class="margin-bottom-small">
                <label>{{ $t("password") }}</label>
                <input
                  type="password"
                  ref="passwordField"
                  required
                  autofocus
                  placeholder="…"
                />
              </div>

              <div class="ta-ce">
                <button
                  type="submit"
                  :disabled="is_sending_content_to_server"
                  class="button button-bg_rounded bg-bleuvert"
                >
                  <img src="/images/i_enregistre.svg" draggable="false" />
                  <span class="text-cap font-verysmall">
                    {{ $t("send") }}
                  </span>
                </button>
              </div>
            </form>
          </transition>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import CreateAuthor from "./../subcomponents/CreateAuthor.vue";

export default {
  props: {},
  components: {
    Modal,
    CreateAuthor,
  },
  data() {
    return {
      show_create_author_panel: false,
      is_sending_content_to_server: false,
      current_mode: "CreateAccount",
      login_author_name: "",
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
    "$root.current_author": {
      handler() {
        this.$emit("loggedInAs", this.$root.current_author.slugFolderName);
      },
    },
    "$root.current_publication": {
      handler() {
        if (
          this.$root.current_publication.editing_limited_to === "only_authors"
        ) {
          this.current_mode = "Login";
        } else {
          this.current_mode = "CreateAccount";
        }
      },
      immediate: true,
    },
  },
  computed: {},
  methods: {
    loginAs() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`Author • METHODS / submitPassword`);

      const author = Object.values(this.$root.store.authors).find(
        (a) => a.name === this.login_author_name
      );
      const password = this.$auth.hashCode(this.$refs.passwordField.value);

      if (!author) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t("notifications.account_does_not_exist:") +
              " <i>" +
              this.login_author_name +
              "</i>"
          );
        return false;
      }

      this.submitPassword({ slugFolderName: author.slugFolderName, password });
    },
    submitPassword({ slugFolderName, password }) {
      this.is_sending_content_to_server = true;

      this.$auth.removeAllFoldersPassword({
        type: "authors",
      });
      this.$auth.updateFoldersPasswords({
        authors: {
          [slugFolderName]: password,
        },
      });
      this.$socketio.sendAuth();

      // check if password matches or not
      this.checkResultsFromLogin({
        slugFolderName: slugFolderName,
      })
        .then(() => {
          this.is_sending_content_to_server = false;
          // this.$alertify
          //   .closeLogOnClick(true)
          //   .delay(4000)
          //   .success(
          //     this.$t("notifications.connected_as") +
          //       "<i>" +
          //       this.login_author_name +
          //       "</i>"
          //   );
          // this.$emit("loggedInAs", slugFolderName);
        })
        .catch(() => {
          this.is_sending_content_to_server = false;
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.wrong_password"));
          this.$refs.passwordField.value = "";
          this.$refs.passwordField.focus();
        });
    },
    checkResultsFromLogin({ slugFolderName }) {
      return new Promise((resolve, reject) => {
        this.$eventHub.$once("socketio.authentificated", () => {
          if (
            this.$root.state.list_authorized_folders.some(
              (f) =>
                f.type === "authors" &&
                f.allowed_slugFolderNames.includes(slugFolderName)
            )
          ) {
            return resolve();
          } else {
            return reject();
          }
        });
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
