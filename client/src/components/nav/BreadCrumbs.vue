<template>
  <nav aria-label="Breadcrumb" class="_breadcrumb">
    <ul>
      <li class="_logo">
        <router-link :to="`/`">
          <img :src="`${$root.publicPath}i_logo.svg`" class="" />
        </router-link>
      </li>
      <template v-if="$route.path !== '/'">
        <sl-icon-button name="arrow-right-short" label="" />
        <li>
          <router-link
            class="u-buttonLink"
            :to="`/projects`"
            :disabled="$route.name === 'Projets'"
          >
            {{ $t("list_of_projects") }}
          </router-link>
        </li>
        <template v-if="$route.name === 'Projet'">
          <sl-icon-button name="arrow-right-short" label="" />
          <li>
            <!-- <router-link class="u-buttonLink" :to="$route.path" replace> -->
            <sl-spinner
              style="--indicator-color: currentColor"
              v-if="!project"
            />
            <span v-else>
              {{ project.title }}
            </span>
            <!-- </router-link> -->
          </li>
        </template>
      </template>
    </ul>
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
._breadcrumb {
  padding: 0 calc(var(--spacing) / 4);
  ul {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    align-items: center;

    // &:not(:last-child)::after {
    //   display: inline-block;
    //   margin: 0 0.25rem;
    //   content: "→";
    // }
  }
}
._logo {
  flex: 0 0 auto;

  img {
    width: 8em;
    height: 2.6em;
  }
}
</style>
