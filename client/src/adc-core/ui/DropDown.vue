<template>
  <div
    class="_dropDown"
    :class="{
      dropup: top,
    }"
    @mouseleave="mouseLeave"
    @mouseover="mouseOver"
    @mouseenter="mouseEnter"
    @click="toggleMenu"
  >
    <button
      type="button"
      class="u-button u-button_transparent _toggleDropdown"
      :class="{ 'is--active': show_dropdown, 'u-button_icon': !show_label }"
    >
      <template v-if="$slots.hasOwnProperty('trigger')">
        <slot name="trigger" />
        <span v-if="show_caret" class="b-icon bi _caret" />
      </template>
      <template v-else>
        <template v-if="show_label">
          {{ $t("options") }}
        </template>
        <b-icon icon="three-dots" :aria-label="$t('options')" />
      </template>
    </button>

    <transition name="fade_fast">
      <div
        v-show="show_dropdown"
        class="_dropDown--content"
        :class="{ '_dropDown--content_right': right }"
        :style="styles"
        @mouseleave="startTimer"
        @mouseenter="stopTimer"
        @click.stop="show_dropdown = false"
        ref="dropdown"
      >
        <slot />
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    right: {
      type: Boolean,
      default: false,
    },
    force_top: {
      type: Boolean,
      default: false,
    },
    hover: {
      type: Boolean,
      default: false,
    },
    show_caret: {
      type: Boolean,
      default: true,
    },
    hover_time: {
      type: Number,
      default: 100,
    },
    hover_timeout: {
      type: Number,
      default: 500,
    },
    styles: {
      type: Object,
      default() {
        return {};
      },
    },
    interactive: {
      //whether should stay open until clicked outside
      type: Boolean,
      default: true,
    },
    closeOnClickOutside: {
      type: Boolean,
      default: true,
    },
    show_label: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      show_dropdown: false,
      hovering: false,
      top: false,
    };
  },
  destroyed() {
    document.body.removeEventListener("click", this.closeMenu);
  },
  methods: {
    mouseEnter() {
      // console.log('mouseEnter', $event.target)
      this.stopTimer();
      if (this.hover && this.hover_time > 0 && !this.show_dropdown) {
        // console.log('start open timer', this.hover_time)
        this.hoverOpenTimer = setTimeout(() => {
          this.show_dropdown = true;

          //disable for a moment
          this.hovering = true;
          setTimeout(() => {
            this.hovering = false;
          }, this.hover_timeout);
        }, this.hover_time);
      }

      if (this.hover && !this.show_dropdown && this.hover_time === 0) {
        this.hovering = true;
        setTimeout(() => {
          this.hovering = false;
        }, this.hover_timeout);
        this.show_dropdown = true;
      }
    },
    mouseLeave() {
      // console.log('mouseLeave', $event.target)
      if (!this.hoverTimer) {
        //left the link and no time active
        this.startTimer();
      }

      if (this.hover_time > 0 && this.hover) {
        // console.log('clear hover timer')
        clearTimeout(this.hoverOpenTimer);
      }
    },
    mouseOver() {
      this.stopTimer();
      // console.log('mouseOver')
    },
    closeMenu($event) {
      if (!$event || !this.$el.contains($event.target)) {
        if (this.show_dropdown && this.closeOnClickOutside) {
          this.show_dropdown = false;
        }
      }
    },
    toggleMenu() {
      if (this.hovering) return;
      if (this.show_dropdown && this.hover) return;
      this.show_dropdown = !this.show_dropdown;
    },
    stopTimer() {
      // console.log('stop timer')
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    },
    startTimer() {
      // console.log('start timer')
      if (!this.interactive)
        this.hoverTimer = setTimeout(this.closeMenu, this.hover_timeout);
    },
  },
  watch: {
    show_dropdown(v) {
      if (this.force_top) {
        this.top = true;
        return;
      }

      if (v) {
        let vm = this;
        this.top = false;
        this.$nextTick(() => {
          let rect = vm.$refs.dropdown.getBoundingClientRect();
          let window_height =
            window.innerHeight || document.documentElement.clientHeight;
          this.top = rect.bottom > window_height && rect.top >= rect.height;
        });
      }
    },
    interactive: {
      handler(value) {
        if (typeof document === "object")
          value
            ? document.body.addEventListener("click", this.closeMenu)
            : document.body.removeEventListener("click", this.closeMenu);
      },
      immediate: true,
    },
  },
};
</script>
<style lang="scss" scoped>
._dropDown {
  position: relative;

  &.dropup {
    ._dropDown--content {
      bottom: 100%;
    }
  }
}

._toggleDropdown {
  &.is--active ._caret {
    transform: rotate(-180deg);
  }
}

._caret {
  background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='41px' height='26px' viewBox='0 0 41 26' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3C/defs%3E%3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cpolygon id='Path-3' fill='%23000000' points='0 5.38215461 19.9830489 25.3652035 40.1398855 5.20836689 34.9315186 0 19.8691842 15.0623344 4.83971338 0.0328636246'%3E%3C/polygon%3E%3C/g%3E%3C/svg%3E%0A");
  background-position: 50% 55%;
  background-repeat: no-repeat;
  background-size: 0.75rem;

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
}

._dropDown--content {
  position: absolute;
  z-index: 9999;
  left: 0;

  display: flex;
  flex-flow: column nowrap;
  // gap: 2px;
  margin-top: 2px;
  // padding: 2px;
  background: white;
  // border: 2px solid var(--c-gris);
  border-radius: 4px;
  max-width: 40ch;

  border: 1px solid var(--c-gris);
  box-shadow: 0 0 0 1px hsla(230, 13%, 9%, 0.05),
    0 0.3px 0.4px hsla(230, 13%, 9%, 0.02),
    0 0.9px 1.5px hsla(230, 13%, 9%, 0.045),
    0 3.5px 6px hsla(230, 13%, 9%, 0.09);

  ::v-deep button,
  ::v-deep a {
    padding: calc(var(--spacing) / 1.5) calc(var(--spacing) / 1.5);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    width: 100%;
    text-align: left;
    border-radius: 2px;

    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    &:hover,
    &:active,
    &:focus-visible {
      background: var(--c-gris);
    }
  }

  // > *:first-child {
  //   ::v-deep button,
  //   ::v-deep a {
  //     padding-top: calc(var(--spacing) / 2);
  //   }
  // }
  // > *:last-child {
  //   ::v-deep button,
  //   ::v-deep a {
  //     padding-bottom: calc(var(--spacing) / 2);
  //   }
  // }
}
._dropDown--content_right {
  left: auto;
  right: 0;
}
</style>
