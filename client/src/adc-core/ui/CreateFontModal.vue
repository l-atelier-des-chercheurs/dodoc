<template>
  <BaseModal2 :title="$t('add_font')" @close="close">
    <form @submit.prevent="submitAddFont">
      <TextInput
        :content.sync="new_font_title"
        :label_str="'font_name'"
        :required="true"
        :input_type="'text'"
        :autofocus="true"
        :maxlength="40"
      />

      <div class="u-spacingBottom" />
    </form>

    <template #footer>
      <SaveCancelButtons
        :allow_save="new_font_title.length > 0"
        @save="submitAddFont"
        @cancel="close"
      />
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    path: {
      type: String,
      default: "fonts",
    },
  },
  components: {},
  data() {
    return {
      new_font_title: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    close() {
      this.new_font_title = "";
      this.$emit("close");
    },
    submitAddFont() {
      if (this.new_font_title.length === 0) return;
      this.createFont();
    },
    async createFont() {
      const font_slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: this.new_font_title,
          requested_slug: this.new_font_title,
          $status: "public",
        },
      });
      const font_path = this.path + "/" + font_slug;
      this.close();
      this.$emit("created", font_path);
    },
  },
};
</script>
