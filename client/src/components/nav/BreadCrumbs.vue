<template>
  <nav aria-label="Fil d’ariane" class="u-breadcrumb">
    <div class="_logo">
      <router-link :to="`/`">
        <img :src="`${$root.publicPath}i_logo.svg`" class="" />
      </router-link>
    </div>
    <template v-if="$route.path !== '/'">
      <sl-icon name="arrow-right-short" label="" />
      <div>
        <router-link
          class="u-buttonLink"
          :to="{ path: '/+' + $route.params.space_slug }"
          :disabled="$route.name === 'Espace'"
        >
          {{ $t("space") }}
        </router-link>
      </div>
      <template v-if="$route.name === 'Projet'">
        <sl-icon name="arrow-right-short" label="" />
        <div>
          <sl-spinner style="--indicator-color: currentColor" v-if="!project" />
          <span v-else>
            {{ project.title }}
          </span>
        </div>
      </template>
    </template>
  </nav>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      project: null,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("received.project", this.setProject);
  },
  beforeDestroy() {
    this.$eventHub.$off("received.project", this.setProject);
  },
  watch: {},
  computed: {},
  methods: {
    setProject(project) {
      this.project = project;
    },
  },
};
</script>
<style lang="scss" scoped>
._logo {
  flex: 0 0 auto;

  img {
    width: 8em;
    height: 2.6em;
  }
}
</style>
