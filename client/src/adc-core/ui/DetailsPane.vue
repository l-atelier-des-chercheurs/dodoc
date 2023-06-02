<template>
  <details
    class="_DetailsPane"
    :open="is_open_initially"
    @toggle="toggleDetails"
  >
    <summary>
      <div class="_icon">
        <sl-icon v-if="icon" :name="icon" />
      </div>

      <span class="_name">
        {{ header }}
      </span>

      <div
        class="_itemsNut"
        v-if="has_items !== undefined"
        :data-isfilled="has_items"
      >
        <template v-if="typeof has_items === 'number'">
          {{ has_items }}
        </template>
        <template v-else-if="has_items === true">
          <sl-icon name="check" />
        </template>
        <template v-else>–</template>
      </div>
      <sl-icon
        class="_openIcon"
        :name="!currently_open ? 'chevron-bar-expand' : 'chevron-bar-contract'"
      />
    </summary>
    <div class="_content" v-if="currently_open">
      <slot />
    </div>
  </details>
</template>
<script>
export default {
  props: {
    header: String,
    icon: String,
    has_items: undefined,
    is_open_initially: Boolean,
  },
  components: {},
  data() {
    return {
      currently_open: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    toggleDetails(event) {
      this.currently_open = event.currentTarget.open;
    },
  },
};
</script>
<style lang="scss" scoped>
._DetailsPane {
  // border-bottom: 0px solid var(--c-gris_clair);
  // border: 1px solid transparent;
  // border-left: 2px solid transparent;

  background: white;
  // margin-left: 2px;

  display: flex;
  flex-flow: row nowrap;

  ._icon {
    font-size: 110%;
    width: 30px;
    height: 30px;
    // border-radius: 4px;
    padding: calc(var(--spacing) / 2);
    // background-color: var(--c-gris);

    color: currentColor;

    line-height: 0;
    // transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    ._DetailsPane[open] & {
    }
  }

  ._name {
    flex: 1 1 auto;
  }

  ._itemsNut {
    display: flex;
    line-height: 1;
    align-items: center;
    justify-content: center;

    min-width: 18px;
    height: auto;
    aspect-ratio: 1;
    border-radius: 50%;
    font-family: "Fira Code";
    padding: calc(var(--spacing) / 8);
    margin: calc(var(--spacing) / 4);

    font-weight: 500;
    font-size: var(--sl-font-size-small);

    &[data-isfilled] {
      background: var(--c-bleumarine);
      color: white;
    }

    &:empty {
      // background: var(--c-bleuvert);
      // width: 0px;
      // height: 0px;
    }
  }

  ._openIcon {
    padding: calc(var(--spacing) / 8);
    margin: calc(var(--spacing) / 4);
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
    // font-size: var(--sl-font-size-small);
    // font-family: "Fira Code";

    // padding: calc(var(--spacing) / 8);
    // font-weight: 500;
    // gap: calc(var(--spacing) / 2);
    cursor: pointer;

    color: black;

    &:hover,
    &:focus-visible {
      // color: white;
      background-color: var(--c-gris);
    }
  }

  ._content {
    padding: calc(var(--spacing) / 2);
  }

  &[open] {
    summary {
      // color: white;
      // box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      background-color: var(--c-gris);
    }

    ._content {
      border: 2px solid var(--c-gris);
      border-top: none;
    }
  }
}
</style>
