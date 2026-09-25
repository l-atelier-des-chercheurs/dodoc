<template>
  <div class="_navOverlay">
    <div
      class="_topLeftBtn"
      v-if="has_sidebar_toggle && sidebar_position === 'left'"
    >
      <button
        type="button"
        class="u-button u-button_icon u-button_glass"
        :class="{
          'is--active': show_sidebar,
        }"
        @click="$emit('update:show_sidebar', !show_sidebar)"
        :title="$t('toggle_sidebar')"
      >
        <b-icon :icon="toggle_icon" />
      </button>
    </div>

    <div class="_topRightBtn">
      <slot name="top-right" />
      <button
        v-if="has_sidebar_toggle && sidebar_position === 'right'"
        type="button"
        class="u-button u-button_icon u-button_glass"
        :class="{
          'is--active': show_sidebar,
        }"
        @click="$emit('update:show_sidebar', !show_sidebar)"
        :title="$t('toggle_sidebar')"
      >
        <b-icon :icon="toggle_icon" />
      </button>
      <button
        type="button"
        class="u-button u-button_icon u-button_glass"
        @click="$emit('close')"
        :title="$t('close')"
      >
        <b-icon icon="x-lg" />
      </button>
    </div>

    <div class="_content">
      <slot />
    </div>

    <div class="_navBtns">
      <span>
        <button
          v-if="can_prev"
          type="button"
          class="u-button u-button_icon u-button_glass _leftArrow"
          @click="$emit('prev')"
          :title="$t('previous_page')"
        >
          <b-icon icon="arrow-left-short" />
        </button>
      </span>
      <span>
        <button
          v-if="can_next"
          type="button"
          class="u-button u-button_icon u-button_glass _rightArrow"
          @click="$emit('next')"
          :title="$t('next_page')"
        >
          <b-icon icon="arrow-right-short" />
        </button>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    show_sidebar: Boolean,
    has_sidebar_toggle: {
      type: Boolean,
      default: true,
    },
    can_prev: Boolean,
    can_next: Boolean,
    sidebar_position: {
      type: String,
      default: "left",
    },
  },
  computed: {
    toggle_icon() {
      if (this.sidebar_position === "right") {
        return this.show_sidebar
          ? "layout-sidebar-inset-reverse"
          : "layout-sidebar-reverse";
      }
      return this.show_sidebar ? "layout-sidebar-inset" : "layout-sidebar";
    },
  },
};
</script>
<style lang="scss" scoped>
._navOverlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1000;

  display: flex;
  flex-direction: column;
}

._content {
  flex: 1;
  position: relative;
  pointer-events: auto;
  z-index: 800;
  overflow: hidden;
}

._topRightBtn {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);
  pointer-events: none;
  z-index: 1000;

  > * {
    pointer-events: auto;
  }
}

._topLeftBtn {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);
  pointer-events: none;
  z-index: 1000;

  > * {
    pointer-events: auto;
  }
}

._navBtns {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;

  padding: calc(var(--spacing) / 2);
  pointer-events: none;
  z-index: 900;

  display: flex;
  justify-content: space-between;
  align-items: center;

  ._leftArrow {
    &:not(:hover) {
      // margin-left: -10px;
    }
  }

  ._rightArrow {
    &:not(:hover) {
      // margin-right: -10px;
    }
  }
}

._meta {
  padding: calc(var(--spacing) * 1) calc(var(--spacing) / 1);
  background: var(--panel-color);
  border: var(--panel-borders);
  box-shadow: var(--panel-shadows);
}
</style>
