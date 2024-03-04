<template>
  <div class="_saveCancelBtns">
    <button
      :size="pill_size"
      variant="default"
      pill
      class="u-button u-button_white"
      @click="$emit('cancel')"
    >
      <b-icon icon="x-circle" />
      <!-- {{ $t("back") }} -->
    </button>
    <button
      :size="pill_size"
      variant="success"
      pill
      class="u-button u-button_bleuvert"
      :loading="is_saving"
      :disabled="!allow_save"
      @click="$emit('save')"
    >
      <b-icon icon="check-circle-fill" />
      {{ save_text ? save_text : $t("save") }}
    </button>
  </div>
</template>
<script>
export default {
  props: {
    save_text: String,
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
