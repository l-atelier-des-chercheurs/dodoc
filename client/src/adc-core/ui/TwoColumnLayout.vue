<template>
  <div
    class="_twoColumnLayout"
    :class="{
      'is--mobile': $root.is_mobile_view,
      'is--sidebarHidden': !showSidebar,
    }"
  >
    <div class="_sidebarToggle">
      <button
        type="button"
        class="u-button u-button_icon"
        :class="{
          'is--active': showSidebar,
        }"
        @click="$emit('update:showSidebar', !showSidebar)"
        :aria-label="showSidebar ? $t('hide_sidebar') : $t('show_sidebar')"
      >
        <b-icon
          :icon="showSidebar ? 'arrow-left' : 'list-ul'"
          :aria-label="showSidebar ? $t('hide') : $t('show')"
        />
      </button>
    </div>
    <transition name="fade">
      <div class="_colLeft" v-if="showSidebar">
        <slot name="sidebar" />
      </div>
    </transition>

    <transition name="fade">
      <div
        class="_colOverlay"
        v-if="showSidebar && $root.is_mobile_view"
        @click="$emit('update:showSidebar', false)"
      />
    </transition>

    <div class="_colRight">
      <slot name="content" />
    </div>
  </div>
</template>

<script>
export default {
  name: "TwoColumnLayout",
  props: {
    sidebarWidth: {
      type: String,
      default: "400px",
    },
    sidebarMobileWidth: {
      type: String,
      default: "250px",
    },
    contentPadding: {
      type: Boolean,
      default: true,
    },
    showSidebar: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss" scoped>
._twoColumnLayout {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  justify-content: stretch;
  gap: 0;
  min-height: 70vh;
  // height: 100%;
  padding: 0;

  &.is--mobile {
    ._colLeft {
      position: absolute;
    }
  }
}

._sidebarToggle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  flex: 0 0 auto;
  align-self: flex-start;
  pointer-events: none;

  > button {
    position: absolute;
    left: 0;
    // color: black;
    color: white;
    background-color: var(--h-900);
    border-radius: 0;
    width: 2rem;
    height: 2rem;
    pointer-events: auto;

    align-items: center;

    transition: none;

    &.is--active {
      &:not(:hover) {
        background-color: var(--active-color);
        color: black;
      }
      left: calc(v-bind(sidebarWidth) - 2rem);
    }
  }
}

._colLeft {
  position: relative;
  z-index: 3;
  flex: 0 0 v-bind(sidebarWidth);
  max-width: v-bind(sidebarWidth);
  background-color: var(--body-bg);
  margin: 0;
  border-right: 1px solid var(--h-200);
  overflow-y: auto;
  overflow-x: hidden;
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100%;
}

._twoColumnLayout ._colLeft {
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 2);
}

._twoColumnLayout.is--sidebarHidden {
  ._sidebarToggle {
    border-right: none;
  }
}

._colRight {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  overflow: auto;
  position: relative;
  min-width: 0;
}

._content {
}

._colOverlay {
  position: absolute;
  inset: 0;
  background-color: var(--body-bg);
  opacity: 0.8;
  z-index: 2;
  cursor: pointer;
}
</style>
