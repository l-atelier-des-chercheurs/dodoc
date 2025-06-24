<template>
  <div class="_cellEdit">
    <!-- <TitleField
      :content="local_value"
      :input_type="input_type"
      :maxlength="60"
      :can_edit="can_edit"
      @save="save"
      @cancel="cancel"
    /> -->

    <TitleField
      :label="$t('content')"
      :show_label="false"
      :input_type="'editor'"
      :custom_formats="['bold', 'italic', 'link', 'emoji', 'align']"
      :content="cell.content"
      :can_edit="can_edit"
      @save="save({ key: 'content', value: $event })"
    />

    <!-- <ColorInput
      v-if="can_edit"
      :can_toggle="false"
      :value="cell.color"
      @save="save({ key: 'color', value: $event })"
    /> -->

    <!-- <TextInput :content.sync="local_value" :disabled="!edit_mode" /> -->
    <!-- <EditBtn
      key="editbtn"
      v-if="can_edit && !edit_mode"
      @click="enableEditMode"
    />
    <SaveCancelButtons
      v-if="local_value !== value"
      @save="update"
      @cancel="cancel"
    /> -->
  </div>
</template>
<script>
export default {
  props: {
    cell: [String, Object],
    can_edit: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},

  computed: {},
  methods: {
    save({ key, value }) {
      const new_cell = { ...this.cell, [key]: value };
      this.$emit("update", new_cell);
    },
  },
};
</script>
<style lang="scss" scoped>
._cellEdit {
  // display: flex;
  // align-items: center;
  // justify-content: center;

  ::v-deep {
    ._collaborativeEditor {
      display: flex;
      gap: calc(var(--spacing) / 2);
    }

    ._floatingEditBtn {
      order: 1;
    }
  }
}
</style>
