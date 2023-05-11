<template>
  <details class="_projectCard">
    <summary>
      <div class="_icon" :data-isfilled="has_items">
        <sl-icon v-if="icon" :name="icon" />
      </div>

      <span class="_name">
        {{ header }}
      </span>

      <div class="_itemsNut" v-if="has_items">
        <template v-if="typeof has_items === 'number'">
          {{ has_items }}
        </template>
        <template v-else>
          <sl-icon name="check" />
        </template>
      </div>
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
    has_items: {
      type: [Boolean, Number],
      default: false,
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
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._projectCard {
  border-bottom: 0px solid var(--c-gris_clair);
  border-left: 2px solid transparent;

  background: white;
  margin-left: 2px;

  display: flex;
  flex-flow: row nowrap;

  ._icon {
    font-size: 110%;
    width: 30px;
    height: 30px;
    border-radius: 4px;
    padding: calc(var(--spacing) / 2);
    background-color: var(--c-gris);

    color: black;

    line-height: 0;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    &:not([data-isfilled]) {
      ._icon {
        color: black;
      }

      // color: var(--c-rouge);
      // border-bottom: 1px solid var(--c-bleuvert);
    }
    ._projectCard[open] & {
    }
  }

  ._name {
    flex: 1 1 auto;
  }

  ._itemsNut {
    display: block;
    width: 20px;
    height: 20px;

    // font-size: 110%;
    border-radius: 50%;
    // color: white;
    // background-color: var(--c-rouge);
    background: white;

    font-family: "Fira Code";
    font-weight: 600;

    background: var(--c-bleuvert);
    color: white;

    // padding: calc(var(--spacing) / 2);
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 110%;

    &:empty {
      // background: var(--c-bleuvert);
      // width: 0px;
      // height: 0px;
    }
  }

  &[open] {
    border-left-color: var(--c-gris);
    // margin-bottom: calc(var(--spacing) / 1);
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
    font-size: var(--sl-font-size-small);
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 4);
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
</style>
