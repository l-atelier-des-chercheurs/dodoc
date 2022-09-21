<template>
  <span class="">
    <sl-input
      :label="label"
      :readonly="!edit_mode"
      :filled="!edit_mode"
      v-sl-model="new_content"
      :help-text="help_text"
    >
      <sl-tooltip :content="$t('edit')">
        <sl-icon-button
          name="pencil-fill"
          label="Edit"
          slot="suffix"
          @click="edit_mode = !edit_mode"
        />
      </sl-tooltip>
    </sl-input>
  </span>
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
    },
    async updateField() {
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
._titleField {
  display: flex;
}

sl-input::part(base) {
  font-size: inherit;
  font-weight: inherit;
}
</style>
