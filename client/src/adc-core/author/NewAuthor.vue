<template>
  <div>
    <form class="input-validation-required" @submit.prevent="createAuthor">
      <div class="_topLabel">
        <label for="" class="u-label">{{ $t("name") }}</label>
      </div>
      <TextInput
        :content.sync="new_author_name"
        :maxlength="40"
        :required="true"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <sl-button
        variant="primary"
        slot="footer"
        :loading="is_creating_author"
        type="submit"
      >
        {{ $t("create") }}
      </sl-button>

      <template v-if="error_msg">
        <br />
        <br />
        <div class="u-errorMsg" v-text="error_msg" />
      </template>
      <hr />
    </form>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      new_author_name: "",
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
        await this.$api.createFolder({
          folder_type: "authors",
          additional_meta: {
            name: this.new_author_name,
            requested_slug: this.new_author_name,
            $public: true,
            $password: "123",
          },
        });
        this.new_author_name = "";
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
<style lang="scss" scoped></style>
