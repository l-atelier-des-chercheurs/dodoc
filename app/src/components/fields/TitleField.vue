<template>
  <span class="_titleField">
    <span v-if="!edit_mode" v-text="new_content" />
    <sl-input v-else type="text" v-sl-model="new_content" />
    <!-- <span
      ref="content"
      v-text="new_content"
      @input="new_content = $event.target.value"
      :contenteditable="edit_mode"
    /> -->
    <!-- <sl-textarea
      v-else
      :help="help ? $t(help) : ''"
      :placeholder="$t('add_text_here')"
      v-sl-model="new_content"
      resize="auto"
      :disabled="is_saving"
      :readonly="!edit_mode"
    /> -->
    <sl-tooltip :content="$t('edit')">
      <sl-button
        size="small"
        v-if="!edit_mode"
        circle
        @click="edit_mode = true"
      >
        <sl-icon name="pencil-fill" />
        <!-- {{ $t("edit") }} -->
      </sl-button>
    </sl-tooltip>

    <SaveCancelButtons
      v-if="edit_mode"
      :is_saving="is_saving"
      @save="updateField"
      @cancel="cancel"
    />
  </span>
</template>
<script>
export default {
  props: {
    field_name: String,
    show_label: {
      type: Boolean,
      default: true,
    },
    help: String,
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
