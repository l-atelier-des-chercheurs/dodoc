<template>
  <button
    type="button"
    class="u-button u-button_verysmall u-button_bleuvert u-floatingFsButton"
    @click="$emit('click')"
  >
    <span>
      {{ $t("edit") }}
    </span>
    <sl-icon :name="icon" :label="label" />
  </button>
</template>
<script>
export default {
  props: {
    icon: String,
    label: String,
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
._editBtn {
  --color1: transparent;
  // --color1: white;
  --color2: var(--c-bleuvert);
  --color-hover-icon: white;

  position: relative;
  display: inline-block;
  background: var(--color1);
  color: var(--color2);

  margin-top: -0.5rem;
  margin-bottom: -0.5rem;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;

  backdrop-filter: blur(5px);
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  sl-icon {
    font-size: 140%;
  }

  span {
    position: absolute;
    top: 0;
    left: 0;
    // left: 50%;
    height: 100%;

    background: var(--color2);
    color: var(--color1);

    padding: calc(var(--spacing) / 2);
    padding-left: 100%;
    display: flex;
    align-items: center;
    border-radius: 0.9rem;
    // border-bottom-right-radius: 0.9rem;

    pointer-events: none;
    transform: translateX(-5px);
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

  @media print {
    display: none;
  }
}
</style>
