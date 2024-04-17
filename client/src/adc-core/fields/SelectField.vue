<template>
  <div class="_selectField">
    <div class="u-sameRow">
      <span v-if="!edit_mode">
        <slot name="preview" :item="new_content">
          {{ new_content }}
        </slot>
      </span>
      <select v-model="new_content" v-else :size="size">
        <template v-if="options">
          <option
            v-for="option in options"
            :key="option.key"
            :value="option.key"
            v-text="option.text"
          />
        </template>
        <template v-else-if="grouped_options">
          <optgroup
            v-for="(group, index) in grouped_options"
            :key="index"
            :label="group.label"
          >
            <option
              v-for="option in group.options"
              :key="option"
              :value="option"
              v-text="option"
            />
          </optgroup>
        </template>
      </select>

      <EditBtn
        v-if="can_edit && !edit_mode"
        :label_position="'left'"
        @click="enableEditMode"
      />
    </div>

    <div class="u-instructions" v-if="instructions">
      <small v-html="instructions" />
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
      type: [Number, String],
      default: "",
    },
    options: {
      type: Array,
    },
    grouped_options: {
      type: Array,
    },
    path: String,
    can_edit: {
      type: Boolean,
    },
    size: String,
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,

      new_content: this.content !== undefined ? this.content : "draft",
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
      if (!this.options) return false;

      const new_opt = this.options.find((o) => o.key === this.new_content);
      if (new_opt) return new_opt.instruction;
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
      if (!this.path) {
        this.$emit("update", this.new_content);
        this.edit_mode = false;
        return;
      }

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
._selectField {
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}
</style>
