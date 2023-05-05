<template>
  <details class="_projectCard" open>
    <summary>
      <div class="_icon">
        <sl-icon v-if="icon" :name="icon" />
      </div>
      {{ header }}
    </summary>
    <div class="_content">
      <slot />
    </div>
  </details>
</template>
<script>
export default {
  props: {
    header: String,
    icon: String,
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
._projectCard {
  border-bottom: 0px solid var(--c-gris_clair);
  // border-left: 2px solid transparent;

  background: white;
  margin-left: 2px;

  &[open] {
    border-left-color: var(--c-gris);
    margin-bottom: calc(var(--spacing) / 1);
  }

  ::marker {
    display: none;
    content: "";
  }

  summary {
    position: sticky;
    top: 0;
    z-index: 1;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    font-size: var(--sl-font-size-medium);
    padding: calc(var(--spacing) / 2);
    font-weight: 500;
    gap: calc(var(--spacing) / 2);
    cursor: pointer;

    &:hover,
    &:focus {
      background-color: var(--c-gris_clair);
    }
  }
  &[open] summary {
    background-color: var(--c-gris);
  }

  ._content {
    padding: calc(var(--spacing) / 2);
  }
}

._icon {
  font-size: 110%;
  background-color: var(--c-gris);
  border-radius: 4px;
  padding: calc(var(--spacing) / 2);
  line-height: 0;
  width: 30px;
  height: 30px;

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  ._projectCard[open] & {
    background-color: white;
  }
}
</style>
