<template>
  <div class="_saveCancelBtns">
    <button class="u-button" @click="$emit('cancel')">
      <b-icon icon="x-circle" />
      {{ cancel_text ? cancel_text : $t("cancel") }}
    </button>
    <button
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
    cancel_text: String,
    is_saving: Boolean,
    autofocus_save: {
      type: Boolean,
      default: false,
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
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 4);
  flex-grow: 1;
}
</style>
