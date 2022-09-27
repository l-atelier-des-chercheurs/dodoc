<template>
  <sl-button-group>
    <sl-button :size="pill_size" pill variant="info" @click="$emit('cancel')">
      <sl-icon name="x-circle" />
      {{ $t("cancel") }}
    </sl-button>
    <sl-button
      :size="pill_size"
      pill
      variant="success"
      :loading="is_saving"
      :disabled="!allow_save"
      @click="$emit('save')"
    >
      <sl-icon name="check-circle-fill" />
      {{ $t(save_text) }}
    </sl-button>
  </sl-button-group>
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
sl-button-group::part(base) {
  // text-align: right;
}
</style>
