<template>
  <div>
    <form v-if="!is_identified" @submit.prevent="login">
      <div class="_topLabel">
        <label for="" class="u-label">{{ $t("name_or_pseudonym") }}</label>
      </div>
      <TextInput
        :content.sync="name_of_account"
        :required="true"
        :input_type="'text'"
        @toggleValidity="($event) => (allow_save = $event)"
      />
      <br />
      <div class="_topLabel">
        <label for="" class="u-label">{{ $t("password") }}</label>
      </div>
      <TextInput
        :content.sync="input_password"
        :required="true"
        :input_type="'password'"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <button type="submit" class="u-button u-button_bleuvert">
        {{ $t("login") }}
      </button>
    </form>
    <button type="button" class="u-button u-button_red" v-else @click="logout">
      {{ $t("logout") }}
    </button>
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
    async logout() {
      try {
        this.reponse = await this.$api.logoutFromFolder();
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
