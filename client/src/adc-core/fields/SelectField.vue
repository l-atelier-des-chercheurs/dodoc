<template>
  <div class="_selectField">
    <div class="_sameRow">
      <select v-model="new_content" :disabled="!edit_mode">
        <option
          v-for="option in options"
          :key="option.key"
          :value="option.key"
          v-text="$t(option.key)"
        />
      </select>

      <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />
    </div>

    <div v-if="instructions">
      <small v-html="$t(instructions)" />
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

      new_content: this.content ? this.content : "draft",
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
    instructions() {
      const new_opt = this.options.find((o) => o.key === this.new_content);
      if (new_opt) return new_opt.text;
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
._selectField {
  widows: 100%;
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
