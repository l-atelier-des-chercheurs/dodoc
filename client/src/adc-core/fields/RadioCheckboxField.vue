<template>
  <div
    class="_radioCheckboxField"
    :class="{
      'is--beingEdited': edit_mode,
    }"
  >
    <DLabel
      v-if="label && show_label"
      class="_label"
      :str="label"
      :instructions="can_edit ? instructions : ''"
    />
    <div class="_previewContainer">
      <slot name="preview" v-if="input_type === 'radio'" :item="current_option">
        <template v-if="current_option && current_option.hasOwnProperty('key')">
          <img
            v-if="current_option.thumb_src"
            :src="current_option.thumb_src"
            class="_option_preview"
          />
          <span :class="{ _emptyOption: current_option.key === '' }">
            {{ current_option.label }}
          </span>
        </template>
      </slot>
      <slot
        name="preview"
        v-if="input_type === 'checkbox'"
        :items="current_options"
      >
        <div v-for="option in current_options" :key="option.key">
          {{ option.label }}
        </div>
      </slot>
      <EditBtn
        v-if="can_edit && !edit_mode"
        class="_edit"
        @click="enableEditMode"
      />
    </div>

    <BaseModal2 v-if="edit_mode" @close="cancel" :title="label">
      <div class="u-spacingBottom u-instructions" v-if="instructions">
        {{ instructions }}
      </div>

      <div class="u-spacingBottom">
        <RadioCheckboxInput
          :value.sync="new_content"
          :input_type="input_type"
          :options="options"
          :can_edit="can_edit && edit_mode"
          :allow_custom_option="allow_custom_option"
          :custom_option_label="custom_option_label"
          :custom_option_placeholder="custom_option_placeholder"
        />
      </div>

      <SaveCancelButtons
        slot="footer"
        :is_saving="is_saving"
        @save="updateSelect"
        @cancel="cancel"
      />
    </BaseModal2>
  </div>
</template>
<script>
export default {
  props: {
    label: String,
    show_label: Boolean,
    instructions: String,
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
    allow_custom_option: {
      type: Boolean,
      default: false,
    },
    custom_option_label: {
      type: String,
      default: "",
    },
    custom_option_placeholder: {
      type: String,
      default: "",
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
    current_options() {
      const filtered_options = this.options.filter((o) =>
        this.content.includes(o.key)
      );
      return filtered_options;
    },
    current_option() {
      const from_options = this.options.find((o) => o.key === this.content);
      if (from_options) return from_options;
      if (
        this.allow_custom_option &&
        this.content &&
        typeof this.content === "string" &&
        !this.options.some((o) => o.key === this.content)
      ) {
        return { key: "custom", label: this.content };
      }
      return null;
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
      const value_to_save =
        this.new_content === "__custom__" ? "" : this.new_content;

      try {
        const new_meta = {
          [this.field_name]: value_to_save,
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
          .error(this.$t("couldntbesaved"));
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

._previewContainer {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}

._option_preview {
  display: inline-block;
  vertical-align: middle;
  height: 1em;
  aspect-ratio: 1;
  object-fit: cover;
}
._emptyOption {
  font-size: var(--sl-font-size-small);
}

._edit {
  /* Hide edit button by default on devices that support hover */
  @media (hover: hover) {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  /* Always show on touch devices */
  @media (hover: none) {
    opacity: 1;
  }
}

/* Show edit button on hover for devices that support hover */
._radioCheckboxField:hover ._edit {
  @media (hover: hover) {
    opacity: 1;
  }
}
</style>
