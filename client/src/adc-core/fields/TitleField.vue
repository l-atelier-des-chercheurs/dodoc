<template>
  <span class="_titleField">
    <template v-if="!edit_mode">
      <span style="white-space: pre-wrap">{{ new_content }}</span>
      <sl-button
        variant="default"
        class="_editBtn"
        size="small"
        circle
        @click="edit_mode = true"
      >
        <sl-icon name="pencil-fill" :label="$t('edit')" />
      </sl-button>
    </template>

    <template v-else>
      <span class="_cont" :data-value="new_content">
        <textarea
          :placeholder="$t('add_text_here')"
          :required="required"
          v-model="new_content"
          rows="1"
        />
      </span>
      <SaveCancelButtons
        :is_saving="is_saving"
        :pill_size="''"
        @save="updateText"
        @cancel="cancel"
      />
    </template>
  </span>
</template>
<script>
export default {
  props: {
    field_name: String,
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
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.new_content = this.content;
      // todo interrupt updateMeta
    },
    async updateText() {
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
._titleField {
  width: 100%;
}
._editBtn {
  margin-left: calc(var(--spacing) / 2);
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
