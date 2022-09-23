<template>
  <div class="_topbar">
    <sl-breadcrumb>
      <sl-breadcrumb-item @click="$router.push('/')">
        <img :src="`${$root.publicPath}i_logo.svg`" class="_logo" />
      </sl-breadcrumb-item>
      <sl-breadcrumb-item @click="$router.push('/projects')">
        Projets
      </sl-breadcrumb-item>
      <sl-breadcrumb-item @click="$router.replace({ query: {} })">
        nom du projet
        <!-- {{ project.title }} -->
      </sl-breadcrumb-item>
    </sl-breadcrumb>
    <SocketStatus />
  </div>
</template>
<script>
import SocketStatus from "@/components/SocketStatus.vue";

export default {
  props: {},
  components: {
    SocketStatus,
  },
  data() {
    return {};
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
  // position: absolute;
  width: 100%;
  background: white;
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) * 2);
  align-content: center;

  sl-breadcrumb {
    flex: 1 1 auto;
  }
}

._logo {
  width: 4em;
  height: 2em;
}
</style>
