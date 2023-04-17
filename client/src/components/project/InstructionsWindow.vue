<template>
  <transition name="fade">
    <div
      class="_floatingMsg"
      :key="`${type}`"
      v-if="show_instructions"
      @click.self="closeInstructions"
    >
      <div>
        <span v-html="$t(`instructions.pane.${type}`)"></span>
        <sl-icon-button
          name="x-circle-fill"
          label="Fermer"
          @click.stop="closeInstructions"
        />
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: {
    type: String,
    path: String,
  },
  components: {},
  data() {
    return {
      show_instructions: true,
      local_storage_path: this.path + "/instructions_shown_for_" + this.type,
    };
  },
  created() {
    if (localStorage.getItem(this.local_storage_path) === "true")
      this.show_instructions = false;
    debugger;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    closeInstructions() {
      this.show_instructions = false;
      localStorage.setItem(this.local_storage_path, "true");
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._floatingMsg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);

  z-index: 1000;
  text-align: center;
  padding: calc(var(--spacing) * 2);

  cursor: pointer;

  > div {
    position: relative;
    background: var(--color-type);
    background: white;
    max-width: 54ch;
    padding: calc(var(--spacing) / 2);
    margin: 0 auto;
    border: 2px solid var(--c-gris);
    border-radius: 4px;
    pointer-events: auto;

    cursor: default;
  }

  sl-icon-button {
    position: absolute;
    top: -1em;
    right: -1em;
    color: currentColor;

    &::part(base) {
      color: currentColor;
    }
  }
}
</style>
