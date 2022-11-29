<template>
  <div class="_topbar" v-if="$route.path !== '/'">
    <BreadCrumbs />
    <button
      type="button"
      class="_subscribeBtn"
      @click="show_authors_modal = true"
    >
      <template v-if="$api.tokenpath.path">
        {{ $api.tokenpath.path }}
        ///
        {{ $api.tokenpath.token }}
      </template>
      <template v-else> Inscription </template>
    </button>
    <AuthorList v-if="show_authors_modal" @close="show_authors_modal = false" />

    <div class="_socketStatus">
      <SocketStatus />
    </div>
  </div>
</template>
<script>
import SocketStatus from "@/components/SocketStatus.vue";
import AuthorList from "@/adc-core/author/AuthorList.vue";
import BreadCrumbs from "@/components/nav/BreadCrumbs.vue";

export default {
  props: {},
  components: {
    SocketStatus,
    AuthorList,
    BreadCrumbs,
  },
  data() {
    return {
      show_authors_modal: true,
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
  gap: calc(var(--spacing) * 2);
  align-items: center;

  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  min-height: 60px;
  user-select: none;

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

._socketStatus {
  display: flex;
  justify-content: flex-end;
}
</style>
