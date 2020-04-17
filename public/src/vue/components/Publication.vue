<template>
  <tr @click="openPublication">
    <td>{{ publication.name }}</td>
    <td width="150px">
      <small>
        {{ $root.formatDateToHuman(publication.date_created) }}
      </small>
    </td>
    <td class="font-folder_title">
      <template v-if="attached_project">
        {{ attached_project.name }}
      </template>
      <template v-else>
        —
      </template>
    </td>
    <td>
      <button
        type="button"
        class="buttonLink"
        v-if="can_access_publi"
        @click.stop="openPublication"
      >
        {{ $t("open") }}
      </button>

      <button
        v-if="can_access_publi && publi_password"
        type="button"
        class="buttonLink _button_forgetpassword"
        @click.stop="forgetPassword"
      >
        {{ $t("forget_password") }}
      </button>

      <button
        v-if="!can_access_publi"
        type="button"
        class="buttonLink _open_pwd_input"
        :class="{ 'is--active': show_input_pwd }"
        style
        :readonly="read_only"
        @click.stop="show_input_pwd = !show_input_pwd"
      >
        {{ $t("password_required_to_open") }}
      </button>

      <form
        class="padding-verysmall _pwd_input"
        v-if="show_input_pwd && !can_access_publi"
        @submit.prevent="submitPassword"
      >
        <div class="">
          <label>{{ $t("password") }}</label>
          <input
            type="password"
            ref="passwordField"
            required
            autofocus
            placeholder="…"
          />
        </div>
        <input
          type="submit"
          class="button button-bg_rounded bg-bleuvert margin-top-small"
        />
      </form>
    </td>
  </tr>
</template>
<script>
export default {
  props: {
    publication: Object,
  },
  components: {},
  data() {
    return {
      show_input_pwd: false,
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
    },
  },
  computed: {
    attached_project() {
      return Object.values(this.$root.store.projects).find(
        (_p) => _p.slugFolderName === this.publication.attached_to_project
      );
    },
    slugPubliName() {
      return this.publication.slugFolderName;
    },
    can_access_publi() {
      return this.$root.canSeeFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
  },
  methods: {
    openPublication(slugPubliName) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • Publication: openPublication / slugPubliName = ${slugPubliName}`
        );

      if (this.can_access_publi) this.$root.openPublication(this.slugPubliName);
    },
    publi_password() {
      if (this.password !== "has_pass") return "";

      return this.$root.getFolderPassword({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
    },
    forgetPassword() {
      this.$auth.removeFolderPassword({
        type: "publications",
        slugFolderName: this.slugPubliName,
      });
      this.$socketio.sendAuth();
    },
  },
};
</script>
<style lang="scss" scoped>
.font-folder_title {
  font-size: 70%;
}
</style>
