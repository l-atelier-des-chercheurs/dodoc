<template>
  <div class="_toggleField">
    <div class="_sameRow">
      <ToggleInput
        :content.sync="new_content"
        :label="label"
        :options="options"
        :disabled="!edit_mode"
      />
      <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />
    </div>

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
import ToggleInput from "../inputs/ToggleInput.vue";
export default {
  props: {
    label: String,
    field_name: String,
    content: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
    },
    path: String,
    can_edit: {
      type: Boolean,
    },
    explanations: String,
  },
  components: { ToggleInput },
  data() {
    return {
      edit_mode: false,
      is_saving: false,

      new_content: this.content ? this.content : false,
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
._toggleField {
}

._sameRow {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}
</style>
