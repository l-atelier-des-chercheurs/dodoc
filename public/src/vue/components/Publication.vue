<template>
  <div>
    <td>{{ publication.name }}</td>
    <td width="150px">
      <small>
        {{
        $root.formatDateToHuman(publication.date_created)
        }}
      </small>
    </td>

    <td>
      <button type="button" v-if="can_access_publi" @click="openPublication">{{ $t('open') }}</button>

      <button
        v-if="can_access_publi && publi_password"
        type="button"
        class="_button_forgetpassword"
        @click="forgetPassword"
      >{{ $t("forget_password") }}</button>

      <button
        v-if="!can_access_publi"
        type="button"
        class="buttonLink _open_pwd_input"
        :class="{ 'is--active': show_input_pwd }"
        style
        :readonly="read_only"
        @click="show_input_pwd = !show_input_pwd"
      >{{ $t("password_required_to_open") }}</button>

      <form
        class="padding-small _pwd_input"
        v-if="show_input_pwd && !can_access_publi"
        @submit.prevent="submitPassword"
      >
        <div class="margin-bottom-small">
          <label>{{ $t("password") }}</label>
          <input type="password" ref="passwordField" required autofocus placeholder="…" />
        </div>
        <input type="submit" class="button button-bg_rounded bg-bleuvert margin-top-small" />
      </form>
    </td>
  </div>
</template>
<script>
export default {
  props: {
    publication: Object
  },
  components: {},
  data() {
    return {
      show_input_pwd: false
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    show_input_pwd() {
      if (this.show_input_pwd) {
        this.$nextTick(() => {
          if (!!this.$refs.passwordField) this.$refs.passwordField.focus();
        });
      }
    }
  },
  computed: {
    slugPubliName() {
      return this.publication.slugFolderName;
    },
    can_access_publi() {
      return this.$root.canAccessFolder({
        type: "publications",
        slugFolderName: this.slugPubliName
      });
    },
    publi_password() {
      debugger;
      const pwds = this.$auth.getFoldersPasswords();
      if (
        pwds.hasOwnProperty("publications") &&
        pwds["publications"].hasOwnProperty(this.slugPubliName) &&
        this.publication.password === "has_pass"
      ) {
        return pwds["publications"][this.slugPubliName];
      }
      return "";
    }
  },
  methods: {
    openPublication(slugPubliName) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • Publication: openPublication / slugPubliName = ${slugPubliName}`
        );

      this.$root.openPublication(this.slugPubliName);
    },
    submitPassword() {
      console.log("METHODS • Publication: submitPassword");

      this.$auth.updateFoldersPasswords({
        publications: {
          [this.slugPubliName]: this.$refs.passwordField.value
        }
      });

      this.$socketio.sendAuth();

      // check if password matches or not
      this.$eventHub.$once("socketio.authentificated", () => {
        const has_passworded_folder = window.state.list_authorized_folders.filter(
          f =>
            f.type === "publications" &&
            f.allowed_slugFolderNames.includes(this.slugPubliName)
        );
        if (has_passworded_folder.length === 0) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              this.$t("notifications.wrong_password_for") +
                this.publication.name
            );
          this.$refs.passwordField.value = "";
          this.$refs.passwordField.focus();
        } else {
          this.show_input_pwd = false;
        }
      });
    },
    forgetPassword() {
      this.$auth.removeFolderPassword({
        type: "publications",
        slugFolderName: this.slugPubliName
      });
      this.$socketio.sendAuth();

      this.closeProject();
    }
  }
};
</script>
<style lang="scss"></style>
