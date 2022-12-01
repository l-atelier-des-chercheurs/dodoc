<template>
  <div>
    <form v-if="!$api.is_identified" @submit.prevent="login">
      <div class="_topLabel">
        <label for="" class="u-label">{{ $t("name_or_pseudonym") }}</label>
      </div>
      <TextInput
        :content.sync="input_slug"
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

      <button type="submit" class="u-button">{{ $t("login") }}</button>
    </form>
    <button type="button" v-else @click="logout">{{ $t("logout") }}</button>
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
      input_slug: "",
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
        this.response = await this.$api.loginToFolder({
          path: "authors/" + this.input_slug,
          auth_infos: {
            $password: this.input_password,
          },
        });
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
