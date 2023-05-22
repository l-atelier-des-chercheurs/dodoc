<template>
  <button
    type="button"
    class="u-button u-button_verysmall _editBtn"
    :style="btn_styles"
    @click="$emit('click')"
  >
    <span>
      {{ label }}
    </span>
    <sl-icon :name="icon" :label="label" />
  </button>
</template>
<script>
export default {
  props: {
    btn_type: {
      type: String,
      default: "edit",
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
    label() {
      if (this.btn_type === "fullscreen") return this.$t("fullscreen");
      else if (this.btn_type === "fullscreen-exit")
        return this.$t("exit_fullscreen");
      return this.$t("edit");
    },
    icon() {
      if (this.btn_type === "fullscreen") return "fullscreen";
      else if (this.btn_type === "fullscreen-exit")
        return this.$t("fullscreen-exit");
      return "pencil-fill";
    },
    btn_styles() {
      if (this.btn_type === "fullscreen")
        return `
          --color2: var(--c-noir);
        `;
      if (this.btn_type === "fullscreen-exit")
        return `
          --color2: white;
          --color-hover-icon: var(--c-noir);
        `;
      return ``;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._editBtn {
  --color1: transparent;
  // --color1: white;
  --color2: var(--c-bleuvert);
  --color-hover-icon: white;

  position: relative;
  display: inline-flex;
  background: var(--color1);
  color: var(--color2);
  border: 1px solid var(--color2);

  // margin-top: -0.5rem;
  // margin-bottom: -0.5rem;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;

  backdrop-filter: blur(5px);
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  sl-icon {
    font-size: 120%;
  }

  span {
    position: absolute;
    top: 0;
    left: 0;
    height: calc(100% + 2px);

    background: var(--color2);
    color: var(--color1);

    margin: -1px;
    padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
    padding-left: 100%;
    display: flex;
    align-items: center;
    border-radius: 1rem;
    white-space: nowrap;

    pointer-events: none;
    transform: translateX(15px);
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }

  &:hover,
  &:active {
    // background: var(--color2);
    color: var(--color-hover-icon);

    span {
      transform: none;
      color: inherit;
      opacity: 1;
      pointer-events: auto;
      // transition: all 0.25s 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      transition: all 0.25s 0s cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
}
</style>
