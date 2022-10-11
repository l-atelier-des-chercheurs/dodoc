<template>
  <form class="input-validation-required" @submit.prevent="updateText">
    <MetaFieldHeader
      :title="label"
      :help_text="help_text"
      :edit_mode.sync="edit_mode"
      :is_saving="is_saving"
      @cancel="cancel"
    />

    <component
      v-if="!edit_mode"
      :is="tag"
      v-html="content.replace(/(?:\r\n|\r|\n)/g, '<br />')"
    />

    <component
      v-else
      :is="tag === 'p' ? 'sl-textarea' : 'sl-input'"
      type="text"
      :placeholder="$t('add_text_here')"
      v-sl-model="new_content"
      resize="auto"
      :disabled="is_saving"
      :readonly="!edit_mode"
      :required="required"
      :maxlength="maxlength"
    />
  </form>
</template>
<script>
export default {
  props: {
    label: String,
    field_name: String,
    show_label: {
      type: Boolean,
      default: true,
    },
    help_text: String,
    content: {
      type: String,
      default: "",
    },
    path_to_resource: String,
    required: {
      type: Boolean,
      default: false,
    },
    maxlength: {
      type: [Boolean, Number],
      default: false,
    },
    tag: {
      type: String,
      default: "p",
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      new_content: this.content,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    edit_mode() {},
    content() {
      this.new_content = this.content;
    },
  },
  computed: {},
  methods: {
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.new_content = this.content;

      // todo interrupt path
    },
    async updateText() {
      this.is_saving = true;
      this.fetch_error = null;

      try {
        // TODO use updateItem
        const response = await this.$axios.patch(this.path_to_resource, {
          [this.field_name]: this.new_content,
        });

        this.response = response.data;
        this.edit_mode = false;
        this.is_saving = false;
      } catch (e) {
        this.is_saving = false;
        this.edit_mode = false;
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
sl-input::part(base) {
  font-size: inherit;
  font-weight: inherit;
}

p {
  margin: 0;
}
</style>
