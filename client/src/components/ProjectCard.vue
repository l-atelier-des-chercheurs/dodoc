<template>
  <details class="_projectCard">
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
  border-bottom: 1px solid var(--c-gris_clair);
  border-left: 2px solid transparent;

  &[open] {
    border-left-color: var(--c-gris_fonce);
    margin-bottom: 1px;
  }

  ::marker {
    display: none;
    content: "";
  }

  summary {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    font-size: var(--sl-font-size-medium);
    padding: calc(var(--spacing) / 2);
    font-weight: 600;
    gap: calc(var(--spacing) / 2);
    cursor: pointer;

    &:hover,
    &:focus {
      background-color: var(--c-gris_clair);
    }
  }
  ._content {
    padding: calc(var(--spacing) / 2);
  }
}

._icon {
  font-size: 144%;
  background-color: var(--c-gris);
  border-radius: 4px;
  padding: calc(var(--spacing) / 1);
  line-height: 0;
  width: 50px;
  height: 50px;

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  ._projectCard[open] & {
    background-color: var(--c-gris_fonce);
  }
}
</style>
