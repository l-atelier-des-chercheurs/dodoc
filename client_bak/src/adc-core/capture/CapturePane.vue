<template>
  <div class="_capturePane" :data-type="pane_type">
    <div class="_topbar">
      <div class="_topbar--title">
        <h3 class>
          {{ label }}
        </h3>
        <button
          type="button"
          class="u-button u-button_icon _close_button"
          @click="$emit('close')"
        >
          <b-icon icon="x-lg" :label="$t('close')" />
        </button>
      </div>
    </div>

    <slot />
  </div>
</template>
<script>
export default {
  props: {
    label: String,
    pane_type: String,
  },
  components: {},
  data() {
    return {};
  },

  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._capturePane {
  position: relative;
  flex: 1 0 200px;
  max-width: 280px;
  overflow: auto;

  display: flex;
  flex-flow: column nowrap;

  &[data-type="settings"] {
    background-color: var(--c-rouge);

    ._topbar {
      border-color: var(--c-rouge_fonce);
    }
  }
  &[data-type="effects"] {
    background-color: var(--c-bleumarine);

    ._topbar {
      border-color: var(--c-bleumarine_fonce);
    }
  }
}

._topbar {
  flex: 0 0 auto;
  border-bottom: 2px solid white;
  padding: calc(var(--spacing) / 2);
  // margin-bottom: calc(var(--spacing) / 2);
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;
}

._topbar--title {
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
</style>
