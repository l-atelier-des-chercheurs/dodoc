<template>
  <div class="_topbar">
    <sl-breadcrumb>
      <sl-breadcrumb-item @click="$router.push('/')">
        <sl-icon slot="prefix" name="house-door-fill" />
        do•doc
      </sl-breadcrumb-item>
      <sl-breadcrumb-item @click="$router.push('/projects')">
        Projets
      </sl-breadcrumb-item>
      <sl-breadcrumb-item @click="$router.replace({ query: {} })">
        nom du projet
        <!-- {{ project.title }} -->
      </sl-breadcrumb-item>
    </sl-breadcrumb>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    $route: {
      handler() {
        debugger;
      },
      immediate: true,
    },
  },
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
