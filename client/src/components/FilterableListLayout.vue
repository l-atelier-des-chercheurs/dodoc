<template>
  <section class="_filterableListLayout">
    <div class="_filterSortBar">
      <div class="_filterSortBar--leftSide">
        <slot name="before-sidebar-toggle" />

        <div class="" v-if="has_sidebar">
          <button
            type="button"
            size="small"
            class="u-button u-button_small u-button_bleumarine"
            :class="{
              'is--active': show_sidebar,
            }"
            @click="show_sidebar = !show_sidebar"
            v-text="!show_sidebar ? $t('filter') : $t('hide')"
          />
        </div>

        <slot name="search" />
        <slot name="top-left" />
      </div>
      <div class="_filterSortBar--rightSide">
        <slot name="top-right" />
      </div>
    </div>

    <div class="_cont">
      <div class="_sidebar" v-if="show_sidebar && has_sidebar">
        <slot name="sidebar" />
      </div>

      <div class="_listContent">
        <slot name="active-filters" />
        <slot name="list" />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    has_sidebar: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      show_sidebar: false,
    };
  },
};
</script>

<style lang="scss" scoped>
._filterableListLayout {
  width: 100%;
  min-height: 70vh;
}
._cont {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);
}
._sidebar {
  flex: 0 0 240px;
  position: sticky;
  overflow: auto;
  max-height: 100vh;
  top: 0;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: calc(var(--spacing) / 2);

  padding: calc(var(--spacing) / 2);
  padding-left: 0;
  margin-top: 0;

  ::v-deep {
    button {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: " [..]";
    }
  }
}
._listContent {
  flex: 1 1 0;
  max-width: 100%;
  margin-top: 0;
}

._filterSortBar {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 1);
}
._filterSortBar--leftSide {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
._filterSortBar--rightSide {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
</style>
