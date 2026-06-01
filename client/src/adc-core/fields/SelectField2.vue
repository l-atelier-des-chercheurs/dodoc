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
      <div v-if="with_arrows" class="_arrows">
        <button
          type="button"
          class="u-button u-button_icon"
          @click="selectPrev"
          :disabled="is_first_option"
        >
          <b-icon icon="chevron-left" />
        </button>
        <button
          type="button"
          class="u-button u-button_icon"
          @click="selectNext"
          :disabled="is_last_option"
        >
          <b-icon icon="chevron-right" />
        </button>
      </div>
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
    with_arrows: Boolean,
  },
  components: {},
  data() {
    return {
      is_saving: false,
      new_value: this.value !== undefined ? this.value : "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    value() {
      this.new_value = this.value !== undefined ? this.value : "";
    },
  },
  computed: {
    instructions() {
      const new_opt = this.options.find((o) => o.key === this.new_value);
      if (new_opt) return new_opt.instructions;
      return false;
    },
    current_option_index() {
      return this.options.findIndex((o) => o.key === this.new_value);
    },
    is_first_option() {
      return this.current_option_index <= 0;
    },
    is_last_option() {
      return this.current_option_index >= this.options.length - 1;
    },
  },
  methods: {
    cancel() {
      this.new_value = this.value;
    },
    selectPrev() {
      if (this.is_first_option) return;
      const prev_opt = this.options[this.current_option_index - 1];
      this.new_value = prev_opt.key;
      this.selectChanged();
    },
    selectNext() {
      if (this.is_last_option) return;
      const next_opt = this.options[this.current_option_index + 1];
      this.new_value = next_opt.key;
      this.selectChanged();
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
._arrows {
  display: flex;
  flex-flow: row nowrap;
  gap: 1px;
}
</style>
