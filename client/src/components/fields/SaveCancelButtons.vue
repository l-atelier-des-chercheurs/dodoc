<template>
  <sl-button-group>
    <sl-button :size="pill_size" pill type="info" @click="$emit('cancel')">
      <sl-icon name="x-circle" />
      {{ $t("cancel") }}
    </sl-button>
    <sl-button
      :size="pill_size"
      pill
      type="success"
      :loading="is_saving"
      :disabled="!enable_save"
      submit
      ref="save"
      @click="$emit('save')"
    >
      <sl-icon name="check-circle-fill" />
      <template v-if="save_text !== undefined">{{ save_text }}</template>
      <template v-else>{{ $t("save") }}</template>
    </sl-button>
  </sl-button-group>
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
    enable_save: {
      type: [Boolean, String],
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
sl-button-group::part(base) {
  // text-align: right;
}
</style>
