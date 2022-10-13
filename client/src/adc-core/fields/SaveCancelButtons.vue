<template>
  <div class="_saveCancelBtns">
    <sl-button
      :size="pill_size"
      variant="default"
      pill
      @click="$emit('cancel')"
    >
      <sl-icon name="x-circle" />
      {{ $t("back") }}
    </sl-button>
    <sl-button
      :size="pill_size"
      variant="success"
      pill
      :loading="is_saving"
      :disabled="!allow_save"
      @click="$emit('save')"
    >
      <sl-icon name="check-circle-fill" />
      {{ $t(save_text) }}
    </sl-button>
  </div>
</template>
<script>
export default {
  props: {
    save_text: {
      type: String,
      default: "save",
    },
    is_saving: Boolean,
    autofocus_save: {
      type: Boolean,
      default: false,
    },
    pill_size: {
      type: String,
      default: "small",
    },
    allow_save: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    // if (this.autofocus_save && this.$refs.save) this.$refs.save.focus();
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._saveCancelBtns {
  display: flex;
  gap: calc(var(--spacing) / 4);
}
</style>
