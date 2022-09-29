<template>
  <span class="_titleField">
    <div class="_topLabel" v-if="label">
      <label for="" class="u-label">{{ label }}</label>
    </div>

    <component :is="tag" class="_container">
      <template v-if="!can_be_edited">
        <span class="_content" v-text="new_content" />
      </template>

      <template v-else>
        <span
          ref="content"
          class="_content"
          :contenteditable="edit_mode"
          :required="edit_mode && required"
          :key="edit_mode + content"
          @input="current_character_count = $event.target.innerText.length"
          v-text="new_content"
        />

        <template v-if="!edit_mode">
          <sl-button
            variant="neutral"
            class="_editBtn"
            size="small"
            circle
            @click="enableEditMode"
          >
            <sl-icon name="pencil-fill" :label="$t('edit')" />
          </sl-button>
        </template>
        <transition name="fade_fast" v-else>
          <div class="_footer">
            <div
              v-if="maxlength"
              class="maxlength"
              :class="{
                'is--invalid': !allow_save,
              }"
            >
              {{ current_character_count }} ≤ {{ maxlength }}
            </div>
            <SaveCancelButtons
              class="_scb"
              :is_saving="is_saving"
              :allow_save="allow_save"
              @save="updateText"
              @cancel="cancel"
            />
          </div>
        </transition>
      </template>
    </component>
  </span>
</template>
<script>
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
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      new_content: this.content,

      current_character_count: undefined,
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
  computed: {
    can_be_edited() {
      return this.$api.is_logged_in;
    },
    allow_save() {
      if (this.maxlength && this.current_character_count > this.maxlength)
        return false;
      if (this.required && this.current_character_count === 0) return false;
      return true;
    },
  },
  methods: {
    enableEditMode() {
      this.edit_mode = true;
      this.$nextTick(() => {
        this.$nextTick(() => {
          const field = this.$refs.content;

          var range = document.createRange();
          var sel = window.getSelection();
          const l = field.childNodes[0].length;

          range.setStart(field.childNodes[0], l);
          range.collapse(true);

          sel.removeAllRanges();
          sel.addRange(range);

          this.current_character_count = this.new_content.length;
        });
      });
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
      this.new_content = this.$refs.content.innerText;

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
._titleField {
  width: 100%;

  ._content {
    white-space: pre-wrap;
  }
}
._topLabel {
  display: block;
}

._editBtn {
  margin-left: calc(var(--spacing) / 2);
}

._footer {
  display: flex;
  justify-content: space-between;
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
    white-space: pre-wrap;
  }
}

._scb {
}
</style>
