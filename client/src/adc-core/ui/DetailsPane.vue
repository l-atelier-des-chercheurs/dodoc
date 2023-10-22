<template>
  <details
    class="_detailsPane"
    :class="{
      'is--unclosable': !can_be_toggled,
    }"
    :open="is_open_initially"
    @toggle="toggleDetails"
  >
    <summary>
      <div class="_icon">
        <b-icon v-if="icon" :icon="icon" />
        <!-- <sl-icon v-if="icon" :name="icon" /> -->
      </div>
      <span class="_name">
        {{ header }}
      </span>
      <div
        class="u-nut"
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
        v-if="can_be_toggled"
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
    can_be_toggled: { type: Boolean, default: true },
  },
  components: {},
  data() {
    return {
      currently_open: this.is_open_initially || false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    toggleDetails(event) {
      if (!this.can_be_toggled) return;
      this.currently_open = event.currentTarget.open;
    },
  },
};
</script>
<style lang="scss" scoped>
._detailsPane {
  // border-bottom: 0px solid var(--c-gris_clair);
  // border: 1px solid transparent;
  // border-left: 2px solid transparent;

  background: white;
  // margin-left: 2px;

  display: flex;
  flex-flow: row nowrap;

  &.is--unclosable summary {
    pointer-events: none;
  }

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

    ._detailsPane[open] & {
    }
  }

  ._name {
    flex: 1 1 auto;
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
