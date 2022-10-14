<template>
  <span class="_titleField">
    <div class="_topLabel" v-if="label">
      <label for="" class="u-label">{{ label }}</label>
    </div>

    <component :is="tag" class="_container">
      <template v-if="!can_edit || (can_edit && !edit_mode)">
        <span
          class="_content"
          v-if="content && content !== ' '"
          v-text="content"
        />
      </template>
      <TextInput
        v-else
        :content.sync="new_content"
        tag="span"
        :required="required"
        :maxlength="maxlength"
        :key="edit_mode + content"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <template v-if="can_edit">
        <EditBtn v-if="!edit_mode" @click="enableEditMode" />
        <div class="_footer" v-else>
          <SaveCancelButtons
            class="_scb"
            :is_saving="is_saving"
            :allow_save="allow_save"
            @save="updateText"
            @cancel="cancel"
          />
        </div>
      </template>
    </component>
  </span>
</template>
<script>
import TextInput from "./TextInput.vue";
export default {
  props: {
    field_name: String,
    label: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    path: String,
    tag: {
      type: String,
      default: "p",
    },
    required: {
      type: Boolean,
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
  components: { TextInput },
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
      this.new_content = this.content;
    },
  },
  computed: {},
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
      this.is_saving = true;
      await new Promise((r) => setTimeout(r, 1000));

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
._titleField {
  width: 100%;

  ._content {
    white-space: break-spaces;
    margin-right: calc(var(--spacing) / 2);
  }
}
._topLabel {
  display: block;
}

._footer {
  display: flex;
  justify-content: center;
  flex-flow: row wrap;
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  padding: calc(var(--spacing) / 4) 0;
  gap: calc(var(--spacing) / 4);
}

._container {
  margin: 0;
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

._scb {
}
</style>
