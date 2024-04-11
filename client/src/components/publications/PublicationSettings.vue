<template>
  <div v-if="show_settings" class="_publicationSettings">
    <div class="_topbar">
      <h3 class>
        {{ $t("settings") }}
      </h3>
      <button
        type="button"
        class="u-button u-button_icon _close_button"
        @click="show_settings = false"
      >
        <b-icon icon="x-lg" :label="$t('close')" />
      </button>
    </div>
    <div class="u-spacingBottom" />
    <slot />
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      show_settings: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("publication.settings.toggle", this.toggleSettings);
    this.$eventHub.$on("publication.settings.close", this.closeSettings);
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.settings.close", this.closeSettings);
  },
  watch: {},
  computed: {},
  methods: {
    toggleSettings() {
      this.show_settings = !this.show_settings;
    },
  },
};
</script>
<style lang="scss" scoped>
._publicationSettings {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1000;
  max-height: 90%;
  width: calc(100% - var(--spacing));
  max-width: 380px;
  background: white;
  overflow: auto;

  margin: calc(var(--spacing) / 2);
  border-radius: var(--panel-radius);
  padding: calc(var(--spacing) / 1);
  background: var(--panel-color);
  border: var(--panel-borders);
  box-shadow: var(--panel-shadows);
}

._topbar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  // padding: calc(var(--spacing) / 2);
}
</style>
