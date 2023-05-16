<template>
  <button
    type="button"
    class="u-button u-button_verysmall u-button_bleuvert _editBtn"
    @click="$emit('click')"
  >
    <span>
      {{ btn_label }}
    </span>
    <sl-icon :name="icon" :label="btn_label" />
  </button>
</template>
<script>
export default {
  props: {
    icon: {
      type: String,
      default: "pencil-fill",
    },
    label: {
      type: String,
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
    btn_label() {
      if (this.label) return this.label;
      return this.$t("edit");
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
    right: 0;
    height: calc(100% + 2px);

    background: var(--color2);
    color: var(--color1);

    margin: -1px;
    padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
    padding-right: 100%;
    display: flex;
    align-items: center;
    border-radius: 1rem;
    white-space: nowrap;

    pointer-events: none;
    transform: translateX(5px);
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
