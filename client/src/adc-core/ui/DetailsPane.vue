<template>
  <details
    class="u-card2 _detailsPane"
    :class="{
      'is--unclosable': !can_be_toggled,
    }"
    :open="is_open_initially"
    @toggle="toggleDetails"
  >
    <summary>
      <div class="_icon">
        <b-icon v-if="icon" :icon="icon" />
      </div>
      <span class="_name">
        {{ header }}
      </span>
      <div class="u-nut" v-if="has_items" :data-isfilled="has_items">
        <template v-if="typeof has_items === 'number'">
          {{ has_items }}
        </template>
        <template v-else-if="has_items === true">
          <b-icon icon="check" />
        </template>
        <template v-else>–</template>
      </div>

      <div v-if="can_be_toggled" :key="currently_open" class="_openIcon">
        <b-icon
          :icon="
            !currently_open ? 'chevron-bar-expand' : 'chevron-bar-contract'
          "
        />
      </div>
    </summary>
    <div class="">
      <transition name="fade_fast" mode="out-in">
        <div v-if="currently_open" class="_content" ref="content">
          <slot />
        </div>
      </transition>
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
      if (event.currentTarget.open) {
        this.currently_open = true;
        this.$nextTick(() => {
          this.animateDetails("0px", this.$refs.content.offsetHeight + "px");
        });
      } else {
        this.animateDetails(this.$refs.content.offsetHeight + "px", "0px");
        setTimeout(() => {
          this.currently_open = false;
        }, 250);
      }
    },
    animateDetails(start, end) {
      // Start a WAAPI animation

      this.$refs.content.style.overflow = "hidden";
      const animation = this.$refs.content.animate(
        {
          height: [start, end],
        },
        {
          duration: 250,
          easing: "ease-out",
        }
      );

      animation.onfinish = () => {
        if (this.$refs.content) {
          this.$refs.content.style.overflow = "auto";
          this.$refs.content.style.height = "";
        }
      };
      animation.oncancel = () => {
        if (this.$refs.content) {
          this.$refs.content.style.overflow = "auto";
          this.$refs.content.style.height = "";
        }
      };
    },
  },
};
</script>
<style lang="scss" scoped>
._detailsPane {
  background: white;
  // border-bottom: none;
  border-radius: var(--panel-radius);
  overflow: hidden;

  &:hover,
  &:focus-visible {
    transform: none;
  }

  &.is--unclosable summary {
    pointer-events: none;
  }

  ._icon {
    font-size: 150%;
    width: auto;
    height: auto;
    margin: calc(var(--spacing) / 4);
    padding: calc(var(--spacing) / 2);
    // background-color: var(--c-gris);
    border-radius: 50%;
    color: var(--c-noir);

    line-height: 0;
    // transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    ._detailsPane[open] & {
    }
  }

  ._name {
    flex: 1 1 auto;
  }

  ._openIcon {
    margin: calc(var(--spacing) / 4);
    padding: calc(var(--spacing) / 2);

    svg {
      display: block;
    }
  }

  summary {
    position: sticky;
    top: 0;
    z-index: 1;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    border-radius: 2px;

    padding: calc(var(--spacing) / 4);
    cursor: pointer;
    background: white;
    border-radius: var(--panel-radius);
    line-height: 1.21;

    &:hover,
    &:focus-visible {
      // color: white;
      // background-color: var(--c-gris);
    }

    &::marker {
      display: none;
      content: "";
    }
  }

  ._content {
  }

  &[open] {
    summary {
      // background-color: var(--c-gris);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom: none;
    }

    ._content {
      padding: calc(var(--spacing) / 2);
      padding-top: 0;
      // border: 2px solid var(--c-gris);
      border-top: none;

      border-radius: 4px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
}
</style>
