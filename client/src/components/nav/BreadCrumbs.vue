<template>
  <nav aria-label="Fil d’ariane" class="u-breadcrumb">
    <div class="_logo">
      <router-link :to="`/`">
        <img :src="`${$root.publicPath}i_logo.svg`" class="" />
      </router-link>
    </div>
    <template v-if="$route.path.includes('/+')">
      <sl-icon name="arrow-right-short" label="" />
      <div>
        <router-link
          class="_spaceName"
          :to="{ path: '/+' + $route.params.space_slug }"
          :disabled="$route.name === 'Espace'"
        >
          <button type="button" class="u-buttonLink">
            {{ $t("space") }}
          </button>
          <div>{{ (space && space.title) || "–" }}</div>
        </router-link>
      </div>
      <template v-if="$route.name === 'Projet'">
        <sl-icon name="arrow-right-short" label="" />
        <div>
          <router-link
            class="_spaceName"
            :to="{
              path:
                '/+' +
                $route.params.space_slug +
                '/' +
                $route.params.project_slug,
            }"
          >
            <button type="button" class="u-buttonLink">
              {{ $t("project") }}
            </button>
            <div>{{ (project && project.title) || "–" }}</div>
          </router-link>
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
      space: undefined,
      project: undefined,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("received.project", this.setProject);
    this.$eventHub.$on("received.space", this.setSpace);
  },
  beforeDestroy() {
    this.$eventHub.$off("received.project", this.setProject);
    this.$eventHub.$off("received.space", this.setSpace);
  },
  watch: {},
  computed: {},
  methods: {
    setSpace(space) {
      this.space = space;
    },
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

._spaceName {
  color: inherit;
  text-decoration: none;

  ::v-deep a,
  button {
    text-decoration: none;
  }
}
</style>
