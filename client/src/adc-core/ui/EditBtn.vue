<template>
  <button
    type="button"
    class="u-button u-button_verysmall u-button_bleuvert _editBtn"
    @click="$emit('click')"
  >
    <span>
      {{ $t("edit") }}
    </span>
    <sl-icon name="pencil-fill" :label="$t('edit')" />
  </button>
</template>
<script>
export default {
  props: {},
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
  --color1: white;
  --color2: var(--c-bleuvert);

  position: relative;
  display: inline-block;
  background: var(--color1);
  color: var(--color2);

  width: 1.8rem;
  height: 1.8rem;
  flex: 0 0 1.8rem;

  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  sl-icon {
    font-size: 140%;
  }

  span {
    position: absolute;
    top: 0;
    left: 50%;
    height: 100%;

    background: var(--color2);
    color: var(--color1);

    padding: calc(var(--spacing) / 2);
    padding-left: 50%;
    display: flex;
    align-items: center;
    border-top-right-radius: 0.9rem;
    border-bottom-right-radius: 0.9rem;

    pointer-events: none;
    transform: translateX(-10px);
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }

  &:hover,
  &:active {
    background: var(--color2);
    color: var(--color1);

    span {
      transform: none;
      opacity: 1;
      pointer-events: auto;
      transition: all 0.25s 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
}
</style>
