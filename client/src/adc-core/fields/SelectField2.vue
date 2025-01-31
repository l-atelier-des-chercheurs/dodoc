<template>
  <div class="_selectField">
    <div class="u-sameRow">
      <select
        v-model="new_value"
        @change="selectChanged"
        :size="size"
        :disabled="!can_edit"
      >
        <option
          v-for="option in options"
          :key="option.key"
          :value="option.key"
          :disabled="option.disabled === true"
          v-text="option.text || option.key"
        />
      </select>
    </div>

    <div class="u-instructions" v-if="instructions">
      <small v-html="instructions" />
    </div>

    <div class="_footer" v-if="hide_validation !== true && value !== new_value">
      <SaveCancelButtons
        class="_scb"
        :is_saving="is_saving"
        @save="updateSelect"
        @cancel="cancel"
      />
    </div>
    <transition v-else name="fade">
      <LoaderSpinner v-if="is_saving" />
    </transition>

    <!-- {{ value }} / {{ new_value }} -->
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: [Number, String],
      default: "",
      required: true,
    },
    field_name: {
      type: String,
    },
    path: {
      type: String,
    },
    options: {
      type: Array,
    },
    size: String,
    can_edit: {
      type: Boolean,
    },
    hide_validation: Boolean,
  },
  components: {},
  data() {
    return {
      is_saving: false,
      new_value: this.value ? this.value : "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    value() {
      this.new_value = this.value || "";
    },
  },
  computed: {
    instructions() {
      const new_opt = this.options.find((o) => o.key === this.new_value);
      if (new_opt) return new_opt.instructions;
      return false;
    },
  },
  methods: {
    cancel() {
      this.new_value = this.value;
    },
    selectChanged() {
      this.$emit("change", this.new_value);
      if (this.hide_validation === true) this.updateSelect();
    },
    async updateSelect() {
      this.$emit("update", this.new_value);

      if (this.path && this.field_name) {
        this.is_saving = true;

        const new_meta = {
          [this.field_name]: this.new_value,
        };
        try {
          await this.$api.updateMeta({
            path: this.path,
            new_meta,
          });
          this.edit_mode = false;
        } catch (e) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("couldntbesaved"));
          this.$alertify.closeLogOnClick(true).error(e.response.data);
        }

        setTimeout(() => {
          this.is_saving = false;
        }, 100);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._selectField {
  position: relative;
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}
</style>
