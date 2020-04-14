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
        'is--selected':
          author.slugFolderName === $root.current_author.slugFolderName,
        'is--editMode': edit_author_mode,
      }"
      @click.stop="
        author.slugFolderName !== $root.current_author.slugFolderName &&
        can_login_as_author
          ? setAuthorWithoutPassword()
          : (show_input_password_field = true)
      "
    >
      <button
        v-if="can_login_as_author"
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
        v-if="can_login_as_author"
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
          <label>{{ author.role }}</label>
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
            class="button bg-bleuvert button-thin"
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
          class="buttonLink"
          @click.stop="setAuthorWithoutPassword()"
        >
          {{ $t("login") }}
        </button>
        <button
          type="button"
          v-if="author.slugFolderName === $root.current_author.slugFolderName"
          class="buttonLink"
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
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
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
      return this.$root.canEditFolder({
        type: "authors",
        slugFolderName: this.author.slugFolderName,
      });
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
      this.setAuthor();
    },

    submitPassword() {
      console.log("METHODS • Author: submitPassword");

      const pass = this.$auth.hashCode(this.$refs.passwordField.value);

      this.$auth.removeAllFoldersPassword({
        type: "authors",
      });

      this.$auth.updateFoldersPasswords({
        authors: {
          [this.author.slugFolderName]: pass,
        },
      });

      this.$socketio.sendAuth();

      // check if password matches or not
      this.$eventHub.$once("socketio.authentificated", () => {
        const has_passworded_folder = window.state.list_authorized_folders.filter(
          (f) =>
            f.type === "authors" &&
            f.allowed_slugFolderNames.includes(this.author.slugFolderName)
        );
        if (has_passworded_folder.length === 0) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              this.$t("notifications.wrong_password_for") + this.author.name
            );
          this.$refs.passwordField.value = "";
          this.$refs.passwordField.focus();
        } else {
          this.show_input_password_field = false;
          this.setAuthor();
        }
      });
    },

    removeAuthor() {
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
    setAuthor() {
      if (this.can_login_as_author) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(
            this.$t("notifications.connected_as") +
              "<i>" +
              this.author.name +
              "</i>"
          );

        this.$root.setAuthor(this.author);
        setTimeout(() => {
          this.$emit("close");
        }, 100);
      } else {
        this.show_input_password_field = !this.show_input_password_field;
      }
    },
    unsetAuthor() {
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
<style lang="scss"></style>
