<template>
  <span class="_titleField">
    <DLabel
      v-if="label && show_label"
      class="_label"
      :str="label"
      :instructions="can_edit ? instructions : ''"
    />

    <div class="_container">
      <div class="_content">
        <component :is="tag">
          <span v-if="content && content.length > 0" v-html="clean_content" />
          <EditBtn v-if="can_edit" class="_edit" @click="enableEditMode" />
        </component>
      </div>
    </div>

    <BaseModal2
      v-if="edit_mode"
      :title="label"
      :confirm_before_closing="content_is_changed"
      @close="cancel"
      @save="updateText"
    >
      <div class="u-spacingBottom u-instructions" v-if="instructions">
        <span v-html="instructions" />
      </div>

      <component :is="tag">
        <TextInput
          ref="TextInput"
          :content.sync="new_content"
          :required="required"
          :input_type="input_type"
          :autofocus="true"
          :autocomplete="input_type === 'email' ? 'email' : undefined"
          :minlength="minlength"
          :maxlength="maxlength"
          :key="edit_mode + content"
          @toggleValidity="($event) => (allow_save = $event)"
          @onEnter="updateText"
        />
      </component>

      <SaveCancelButtons
        slot="footer"
        :is_saving="is_saving"
        :allow_save="allow_save && new_content !== content"
        @save="updateText"
        @cancel="cancel"
      />
    </BaseModal2>
  </span>
</template>
<script>
import DOMPurify from "dompurify";

export default {
  props: {
    field_name: String,
    label: {
      type: String,
      default: "",
    },
    show_label: {
      type: Boolean,
      default: true,
    },
    instructions: {
      type: String,
      default: "",
    },
    input_type: {
      type: String,
      default: "text",
    },
    content: {
      type: [String, Number],
      default: "",
    },
    path: String,
    tag: {
      type: String,
      default: "div",
    },
    required: {
      type: Boolean,
      default: false,
    },
    minlength: {
      type: [Boolean, Number],
      default: false,
    },
    maxlength: {
      type: [Boolean, Number],
      default: false,
    },
    can_edit: {
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      new_content: this.content,

      current_character_count: undefined,
      allow_save: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    content() {
      // content was changed somewhere else, let's reload component
      // todo: do not override content, ask in a modal what to do?
      this.new_content = this.content;
    },
  },
  computed: {
    content_is_changed() {
      return this.new_content !== this.content;
    },
    clean_content() {
      return DOMPurify.sanitize(this.content);
    },
  },
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.new_content = this.content;

      this.$nextTick(() => {
        // this.content = "";
        // this.$nextTick(() => {
        // this.content = this.new_content;
        // });
      });

      // todo interrupt updateMeta
    },
    async updateText() {
      if (this.input_type === "number")
        this.new_content = Number(this.new_content);
      else this.new_content = this.cleanUpString(this.new_content);

      if (!this.path) {
        this.$emit("save", this.new_content);
        this.edit_mode = false;
        this.is_saving = false;
        return;
      }

      this.is_saving = true;
      await new Promise((r) => setTimeout(r, 50));
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
      } catch ({ code }) {
        this.is_saving = false;
        if (code === "unique_field_taken") {
          this.$alertify.delay(4000).error(this.$t("name_taken"));
          this.$refs.TextInput.$refs.field.select();
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._titleField {
  // width: 100%;

  ._content {
    display: block;
    margin-right: calc(var(--spacing) / 2);
    overflow-wrap: break-word;

    > * {
      margin: 0;
    }

    span {
      white-space: break-spaces;
    }
  }
}

._footer {
  display: flex;
  justify-content: flex-start;
  flex-flow: row wrap;
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  padding: calc(var(--spacing) / 4) 0;
  gap: calc(var(--spacing) / 4);
}

._container {
  margin: 0;
  width: 100%;
  // display: flex;
  // flex-flow: row wrap;
  // align-items: baseline;
}

._cont {
  display: inline-grid;
  align-items: stretch;

  &::after,
  textarea {
    grid-area: 2/1;

    width: auto;
    min-width: 1em;
    font: inherit;
    margin: 0;
    resize: none;
    padding: 0.25em;
  }

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: break-spaces;
  }
}

._edit {
  margin-top: -4px;
}
</style>
