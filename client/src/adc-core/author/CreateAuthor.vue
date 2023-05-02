<template>
  <div class="_createAuthor">
    <form class="input-validation-required" @submit.prevent="createAuthor">
      <fieldset>
        <legend class="u-label">{{ $t("new_account") }}</legend>

        <!-- <ImageSelect
          :folder_path="'/authors'"
          @newPreview="
            (value) => {
              new_author_cover_raw = value;
            }
          "
        /> -->

        <TextInput
          :content.sync="new_author_name"
          :label_str="'name_or_pseudonym'"
          :required="true"
          :maxlength="40"
          :autocomplete="'username'"
          @toggleValidity="($event) => (allow_save = $event)"
        />

        <br />

        <TextInput
          :content.sync="new_author_email"
          :label_str="'email'"
          :required="false"
          :input_type="'email'"
          :autocomplete="'email'"
          @toggleValidity="($event) => (allow_save = $event)"
        />

        <br />

        <TextInput
          :content.sync="new_author_password"
          :label_str="$t('password')"
          :minlength="3"
          :maxlength="20"
          :required="true"
          :input_type="'password'"
          :autocomplete="'new-password'"
          @toggleValidity="($event) => (allow_save = $event)"
        />

        <br />

        <button
          slot="footer"
          :loading="is_creating_author"
          class="u-button u-button_bleuvert"
          type="submit"
        >
          {{ $t("create") }}
        </button>
      </fieldset>

      <template v-if="error_msg">
        <div class="u-errorMsg" v-text="error_msg" />
      </template>
    </form>
  </div>
</template>
<script>
export default {
  props: {
    is_first_user: Boolean,
  },
  components: {},
  data() {
    return {
      new_author_email: "",
      new_author_name: "",
      new_author_password: "",
      new_author_cover_raw: undefined,

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

      try {
        // check existing used author

        const author_slug = await this.$api.createFolder({
          path: "/authors",
          additional_meta: {
            email: this.new_author_email,
            name: this.new_author_name,
            requested_slug: this.new_author_name,
            $status: "public",
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
