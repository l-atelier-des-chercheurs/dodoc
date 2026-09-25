<template>
  <BaseModal2 :title="modal_title" @close="$emit('close')">
    <div class="u-inputGroup u-spacingBottom">
      <input
        type="number"
        class="_input"
        :min="1"
        :max="max_value"
        :step="1"
        v-model.number="local_value"
        @keypress="preventNonInteger($event)"
      />
      <span class="u-suffix">
        {{ $t("seconds").toLowerCase() }}
      </span>
    </div>

    <template slot="footer">
      <SaveCancelButtons
        :allow_save="true"
        :cancel_text="cancel_text"
        :save_text="$t('set_timer')"
        @save="$emit('save', normalized_value)"
        @cancel="handleCancelAction()"
      />
    </template>
  </BaseModal2>
</template>

<script>
export default {
  props: {
    mode: {
      type: String,
      default: "delay",
    },
    value: {
      type: Number,
      default: 1,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      local_value: this.value,
    };
  },
  watch: {
    value(new_value) {
      this.local_value = new_value;
    },
    mode() {
      this.local_value = this.value;
    },
  },
  computed: {
    modal_title() {
      return this.mode === "timelapse"
        ? this.$t("timelapse")
        : this.$t("delay");
    },
    max_value() {
      return this.mode === "delay" ? 60 : 3600;
    },
    normalized_value() {
      const raw_value = parseInt(this.local_value, 10) || 1;
      const bounded_min = Math.max(1, raw_value);
      return this.mode === "delay" ? Math.min(60, bounded_min) : bounded_min;
    },
    cancel_text() {
      return this.enabled ? this.$t("disable_timer") : this.$t("cancel");
    },
  },
  methods: {
    preventNonInteger(event) {
      if (event.which < 48 || event.which > 57) event.preventDefault();
    },
    handleCancelAction() {
      if (this.enabled) {
        this.$emit("disable");
      } else {
        this.$emit("close");
      }
    },
  },
};
</script>
