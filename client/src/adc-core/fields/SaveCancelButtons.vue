<template>
  <div class="_saveCancelBtns">
    <button class="u-button" @click="$emit('cancel')">
      <b-icon v-if="effective_cancel_icon" :icon="effective_cancel_icon" />
      {{ cancel_text ? cancel_text : $t("cancel") }}
    </button>
    <button
      :class="[
        'u-button',
        save_is_destructive ? 'u-button_red' : 'u-button_bleuvert',
      ]"
      :loading="is_saving"
      :disabled="!allow_save"
      @click="$emit('save')"
    >
      <b-icon v-if="effective_save_icon" :icon="effective_save_icon" />
      {{ save_text ? save_text : $t("save") }}
    </button>
  </div>
</template>
<script>
export default {
  props: {
    save_text: String,
    cancel_text: String,
    cancel_icon: {
      type: String,
      default: null,
    },
    save_icon: {
      type: String,
      default: null,
    },
    is_saving: Boolean,
    autofocus_save: {
      type: Boolean,
      default: false,
    },
    allow_save: {
      type: Boolean,
      default: true,
    },
    save_is_destructive: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    effective_cancel_icon() {
      if (this.cancel_icon === "none" || this.cancel_icon === "") return null;
      return this.cancel_icon || "x-circle";
    },
    effective_save_icon() {
      if (this.save_icon === "none" || this.save_icon === "") return null;
      return this.save_icon || "check-circle-fill";
    },
  },
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
