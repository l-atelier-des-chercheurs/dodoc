<template>
  <div
    class="_radioCheckboxField"
    :class="{
      'is--beingEdited': edit_mode,
    }"
  >
    <DLabel
      v-if="label"
      class="_label"
      :str="label"
      :instructions="can_edit ? instructions : ''"
    />
    <div>
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
    </div>
    <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />

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
</style>
