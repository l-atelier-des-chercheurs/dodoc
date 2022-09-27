<template>
  <span>
    <template v-if="!edit_mode">
      {{ content }}

      <sl-button
        variant="default"
        size="small"
        circle
        @click="edit_mode = true"
      >
        <sl-icon name="pencil-fill" :label="$t('edit')" />
      </sl-button>
    </template>

    <template v-else>
      <input
        type="text"
        :placeholder="$t('add_text_here')"
        v-sl-model="new_content"
      />
    </template>
  </span>
</template>
<script>
export default {
  props: {
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
          path,
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
._editBtn {
  font-size: 1rem;
}
</style>
