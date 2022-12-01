<template>
  <div
    class="_topbar"
    :class="{
      'is--homepage': $route.path === '/',
    }"
  >
    <BreadCrumbs />
    <button
      type="button"
      class="_subscribeBtn"
      @click="show_authors_modal = true"
    >
      <template v-if="connected_as">
        {{ connected_as.name }}
      </template>
      <template v-else>Inscription</template>
    </button>
    <AuthorList v-if="show_authors_modal" @close="show_authors_modal = false" />

    <div class="_topRightButtons">
      <button type="button" @click="show_admin_panel = !show_admin_panel">
        <svg
          enable-background="new 0 0 168 168"
          viewBox="0 0 168 168"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m122.7 88.8v-10c0-1.1.6-2.1 1.6-2.6l9.6-4.9-2-5.8-11 1.6c-1.1.2-2.2-.3-2.9-1.2l-6-8.1c-.7-.9-.8-2.1-.3-3l4.8-9.6-5.2-3.6-7.7 7.5c-.8.8-2 1-3.1.7l-9.9-3c-1.1-.3-1.9-1.3-2.1-2.4l-1.7-10.4h-6.4l-1.7 10.4c-.2 1.1-.9 2-2 2.4l-9.9 3.2c-1.1.3-2.2.1-3.1-.7l-7.8-7.3-5.1 3.7 4.9 9.4c.5 1 
        .4 2.1-.2 3l-6 8.2c-.6.9-1.8 1.4-2.9 1.2l-10.8-1.5-1.8 5.8 9.7 4.8c1 .5 1.7 1.5 1.7 2.6v10c0 1.1-.6 2.1-1.6 2.6l-9.6 4.9 2 5.9 10.9-1.6c1.1-.2 2.2.3 2.9 1.2l6 8.1c.7.9.8 2.1.3 3l-4.8 9.6 5.1 3.6 7.7-7.5c.8-.8 2-1 3.1-.7l9.9 3c1.1.3 1.9 1.3 2.1 2.4l1.9 10.4h6.4l1.7-10.4c.2-1.1.9-2 
        2-2.4l9.9-3.2c1.1-.3 2.2-.1 3.1.7l7.8 7.3 5.1-3.7-4.9-9.4c-.5-1-.4-2.1.2-3l6-8.1c.7-.9 1.8-1.4 2.9-1.2l10.8 1.5 1.8-5.9-9.7-4.8c-1.1-.6-1.7-1.6-1.7-2.7zm-38.7 15.7c-11.7 0-21.1-9.2-21.1-20.5s9.5-20.5 21.1-20.5 21.1 9.2 21.1 20.5-9.4 20.5-21.1 20.5z"
          />
        </svg>
      </button>
      <AdminPanel v-if="show_admin_panel" @close="show_admin_panel = false" />
    </div>
  </div>
</template>
<script>
import AuthorList from "@/adc-core/author/AuthorList.vue";
import BreadCrumbs from "@/components/nav/BreadCrumbs.vue";
import AdminPanel from "@/adc-core/AdminPanel.vue";

export default {
  props: {},
  components: {
    AuthorList,
    BreadCrumbs,
    AdminPanel,
  },
  data() {
    return {
      show_authors_modal: false,
      show_admin_panel: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    $route: {
      handler() {},
      immediate: true,
    },
  },
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._topbar {
  position: relative;
  z-index: 5;
  // position: absolute;
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  align-items: center;

  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  min-height: 60px;
  user-select: none;

  &.is--homepage {
    background: transparent;
    box-shadow: none;
  }

  > * {
    flex: 1 1 0;
  }

  > ._subscribeBtn {
    flex-grow: 0;
  }
}

._subscribeBtn {
  background: var(--c-bleumarine_clair);
  padding: calc(var(--spacing) / 2);
  border-radius: 4px;
}

._topRightButtons {
  display: flex;
  justify-content: flex-end;

  button {
    width: 3rem;
    height: 3rem;
  }
}
</style>
