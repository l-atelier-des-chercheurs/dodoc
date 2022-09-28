<template>
  <span class="_titleField">
    <label for="" v-if="label" class="u-label">
      {{ label }}
    </label>
    <span
      ref="content"
      :contenteditable="edit_mode"
      :required="edit_mode && required"
      :key="edit_mode + content"
      @input="current_character_count = $event.target.innerText.length"
      >{{ new_content }}</span
    >
    <template v-if="!edit_mode">
      <sl-button
        variant="default"
        class="_editBtn"
        size="small"
        circle
        @click="enableEditMode"
      >
        <sl-icon name="pencil-fill" :label="$t('edit')" />
      </sl-button>
    </template>

    <transition name="fade_fast" v-else>
      <!-- <span class="_cont" :data-value="new_content">
        <textarea
          :placeholder="$t('add_text_here')"
          :required="required"
          v-model="new_content"
          rows="1"
        />
      </span> -->
      <div class="_footer">
        <div v-if="maxlength">
          <small
            class="_maxlength"
            :class="{
              'is--invalid': !allow_save,
            }"
            v-if="maxlength"
          >
            {{ current_character_count }} ≤ {{ maxlength }}
          </small>
        </div>
        <SaveCancelButtons
          :is_saving="is_saving"
          :pill_size="''"
          :allow_save="allow_save"
          @save="updateText"
          @cancel="cancel"
        />
      </div>
    </transition>
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

  span {
    white-space: pre-wrap;
  }
}
label {
  display: block;
}

._editBtn {
  margin-left: calc(var(--spacing) / 2);
}

._footer {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
}

._maxlength {
  &.is--invalid {
    color: var(--c-rouge);
  }
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
</style>
