<template>
  <div class="_createAuthor">
    <form class="input-validation-required" @submit.prevent="createAuthor">
      <div class="_topLabel">
        <label for="" class="u-label">{{ $t("email") }}</label>
      </div>
      <TextInput
        :content.sync="new_author_email"
        :maxlength="60"
        :required="true"
        :input_type="'email'"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <br />

      <div class="_topLabel">
        <label for="" class="u-label">{{ $t("name_or_pseudonym") }}</label>
      </div>
      <TextInput
        :content.sync="new_author_name"
        :maxlength="40"
        :required="true"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <br />

      <div class="_topLabel">
        <label for="" class="u-label">{{ $t("password") }}</label>
      </div>
      <TextInput
        :content.sync="new_author_password"
        :minlength="3"
        :maxlength="20"
        :required="true"
        :input_type="'password'"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <br />

      <button
        slot="footer"
        :loading="is_creating_author"
        class="u-button"
        type="submit"
      >
        {{ $t("create") }}
      </button>

      <template v-if="error_msg">
        <div class="u-errorMsg" v-text="error_msg" />
      </template>
    </form>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      new_author_email: "",
      new_author_name: "",
      new_author_password: "",
      is_creating_author: false,
      error_msg: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createAuthor() {
      this.is_creating_author = true;

      // TODO replace with $api
      try {
        const author_slug = await this.$api.createFolder({
          path: "/authors",
          additional_meta: {
            email: this.new_author_email,
            name: this.new_author_name,
            requested_slug: this.new_author_name,
            $public: true,
            $password: this.new_author_password,
          },
        });
        this.new_author_name = "";
        await this.$api.loginToFolder({
          path: "authors/" + author_slug,
          auth_infos: {
            $password: this.new_author_password,
          },
        });
        this.$emit("close");
      } catch (err) {
        this.error_msg = "Error: " + err.message;
        setTimeout(() => {
          this.error_msg = "";
        }, 5000);
      }
      this.is_creating_author = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._createAuthor {
  // border: 2px solid var(--c-gris);
  // padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 2);
  // margin: calc(var(--spacing) / 2) 0;
  // border-radius: 4px;
}
</style>
