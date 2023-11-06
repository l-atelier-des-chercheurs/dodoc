<template>
  <div
    class="_radioCheckboxField"
    :class="{
      'is--beingEdited': edit_mode,
    }"
  >
    <RadioCheckboxInput
      v-if="edit_mode || new_content.length > 0"
      :value.sync="new_content"
      :input_type="input_type"
      :options="options"
      :can_edit="can_edit && edit_mode"
    />
    <span v-else>
      <template v-if="current_option">
        {{ current_option.label }}
      </template>
      <template v-else></template>
    </span>
    <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />
    <div class="_footer">
      <SaveCancelButtons
        v-if="edit_mode"
        class="_scb"
        :is_saving="is_saving"
        @save="updateSelect"
        @cancel="cancel"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    field_name: String,
    content: {
      type: [String, Array],
      default: "",
    },
    input_type: {
      type: String,
      default: "radio",
    },
    options: {
      type: Array,
    },
    path: String,
    can_edit: {
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      new_content: "",
    };
  },
  created() {
    this.setNewContent();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    content() {
      this.setNewContent();
    },
  },
  computed: {
    current_option() {
      return this.options.find((o) => o.key === this.content);
    },
  },
  methods: {
    setNewContent() {
      if (this.input_type === "checkbox") {
        if (this.content)
          this.new_content = JSON.parse(JSON.stringify(this.content));
        else this.new_content = [];
      } else this.new_content = this.content || "";
    },
    enableEditMode() {
      this.edit_mode = true;
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.setNewContent();
    },
    async updateSelect() {
      this.is_saving = true;

      try {
        const new_meta = {
          [this.field_name]: this.new_content,
        };
        await this.$api.updateMeta({
          path: this.path,
          new_meta,
        });

        this.edit_mode = false;
        this.is_saving = false;
      } catch (e) {
        this.is_saving = false;
        this.edit_mode = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response.data);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._radioCheckboxField {
  &:not(.is--beingEdited) {
    // display: flex;
    // align-items: center;
    // gap: calc(var(--spacing) / 1);

    // > * {
    //   flex: 1 1 auto;
    // }

    // ._footer {
    //   flex: 0 0 auto;
    // }
  }
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}

._scb {
  width: 100%;
  text-align: center;
  justify-content: center;
}
</style>
