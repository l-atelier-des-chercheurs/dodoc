<template>
  <sl-drawer :label="$t('settings')" contained>
    <div class="_publicationSettings" v-if="show_settings">
      <!-- <div class="_publicationSettings--closeBtn">
        <button
          type="button"
          class="u-button u-button_icon"
          @click="show_settings = false"
        >
          <b-icon icon="x-circle" :aria-label="$t('close')" />
        </button>
      </div> -->

      <slot />
    </div>
  </sl-drawer>
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
    this.$eventHub.$on("publication.toggleSettings", this.toggleSettings);
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.toggleSettings", this.toggleSettings);
  },
  watch: {},
  computed: {},
  methods: {
    toggleSettings() {
      if (this.$el.open) {
        this.$el.hide();
        this.show_settings = false;
      } else {
        this.$el.show();
        this.show_settings = true;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._publicationSettings {
  // position: absolute;
  // top: 0;
  // right: 0;
  // z-index: 1000;
  // max-height: 90%;
  // width: calc(100% - var(--spacing));
  // max-width: 380px;
  // background: white;
  // overflow: auto;

  // margin: calc(var(--spacing) / 2);
  // border-radius: var(--panel-radius);
  // padding: calc(var(--spacing) / 2);
  // background: var(--panel-color);
  // border: var(--panel-borders);
  // box-shadow: var(--panel-shadows);
}

._publicationSettings--closeBtn {
  position: absolute;
  top: 0;
  right: 0;
  padding: calc(var(--spacing) / 2);
}
</style>
