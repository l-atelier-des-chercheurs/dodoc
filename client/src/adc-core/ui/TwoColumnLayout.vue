<template>
  <div class="_twoColumnLayout" :class="{ 'is--mobile': $root.is_mobile_view }">
    <div class="_colLeft">
      <slot name="sidebar" />
    </div>

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
    sidebarPadding: {
      type: Boolean,
      default: true,
    },
    contentPadding: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss" scoped>
._twoColumnLayout {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  justify-content: stretch;
  gap: 0;
  min-height: 70vh;
  // height: 100%;
  padding: 0;

  &.is--mobile {
    flex-flow: column nowrap;
  }
}

._colLeft {
  flex: 0 0 v-bind(sidebarWidth);
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 2);
  margin: 0;
  border-right: 1px solid var(--border-color);
  overflow: auto;

  &.is--mobile {
    flex: 0 0 v-bind(sidebarMobileWidth);
  }
}

._colRight {
  flex: 1 1 0;
  overflow: hidden;
  position: relative;
}

._content {
}
</style>
