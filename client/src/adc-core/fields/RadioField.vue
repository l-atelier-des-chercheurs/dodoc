<template>
  <div class="_radioField">
    <div v-if="!edit_mode">
      <template v-if="current_option">
        {{ current_option.label }}
        <div v-if="current_option.instructions" class="u-instructions">
          <small v-html="current_option.instructions" />
        </div>
      </template>
      <template v-else>–</template>
    </div>
    <div v-else>
      <RadioInput
        :value.sync="new_content"
        :options="options"
        :can_edit="can_edit"
      />
    </div>

    <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />

    <div class="_footer" v-if="edit_mode">
      <SaveCancelButtons
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
      type: String,
      default: "",
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

      new_content: this.content ? this.content : "",
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
    current_option() {
      return this.options.find((o) => o.key === this.new_content);
    },
    instructions() {
      const new_opt = this.options.find((o) => o.key === this.new_content);
      if (new_opt) return new_opt.instructions;
      return false;
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
._radioField {
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}
</style>
