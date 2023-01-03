<template>
  <div>
    <form v-if="!connected_as" @submit.prevent="login">
      <fieldset>
        <legend class="u-label">{{ $t("your_account") }}</legend>
        <TextInput
          :content.sync="name_of_account"
          :label_str="'name_or_pseudonym'"
          :required="true"
          :input_type="'text'"
          :autocomplete="'username'"
          @toggleValidity="($event) => (allow_save = $event)"
        />
        <br />

        <TextInput
          :label_str="$t('password')"
          :content.sync="input_password"
          :required="true"
          :input_type="'password'"
          :autocomplete="'current-password'"
          @toggleValidity="($event) => (allow_save = $event)"
        />

        <button type="button" class="u-buttonLink">
          {{ $t("recover_password") }}
        </button>

        <br />
        <br />

        <button type="submit" class="u-button u-button_bleuvert">
          {{ $t("login") }}
        </button>
      </fieldset>
    </form>
  </div>
</template>
<script>
export default {
  props: {
    authors: Array,
  },
  components: {},
  data() {
    return {
      name_of_account: "",
      input_password: "",
      response: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async login() {
      this.response = "";

      try {
        const author = this.authors.find(
          (a) => a.name === this.name_of_account
        );
        const path = author.$path;

        this.response = await this.$api.loginToFolder({
          path,
          auth_infos: {
            $password: this.input_password,
          },
        });
        this.$emit("close");
      } catch (err) {
        this.response = err;
        this.$alertify.delay(4000).error(err);
        return false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
