<template>
  <div
    class="_twoColumnLayout"
    :class="{
      'is--mobile': $root.is_mobile_view,
      'is--sidebarHidden': !showSidebar,
    }"
  >
    <template v-if="showToggleButton">
      <div class="_sidebarToggle">
        <button
          type="button"
          class="u-button u-button_icon u-button_transparent"
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
    </template>
    <transition name="fade_fast">
      <div class="_colLeft" v-if="showSidebar">
        <slot name="sidebar" />
      </div>
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
    showToggleButton: {
      type: Boolean,
      default: false,
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
    display: block;
  }
}

._sidebarToggle {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  flex: 0 0 auto;
  align-self: flex-start;

  > button {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    z-index: 8;
    // background: var(--active-color);
    border-radius: 0;
    padding: calc(var(--spacing) / 4);
  }
}

._colLeft {
  flex: 0 0 v-bind(sidebarWidth);
  margin: 0;
  border-right: 1px solid var(--h-200);
  overflow-y: auto;
  overflow-x: hidden;
  position: sticky;
  top: 0;
  align-self: flex-start;
  max-height: 100%;

  &.is--mobile {
    flex: 0 0 v-bind(sidebarMobileWidth);
  }
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
  flex: 1 1 0;
  overflow: auto;
  position: relative;
  min-width: 0;
}

._content {
}
</style>
