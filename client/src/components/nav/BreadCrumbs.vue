<template>
  <nav aria-label="Fil d’ariane" class="_breadcrumb">
    <div class="_logo">
      <router-link :to="`/`">
        <DodocLogo />
      </router-link>
    </div>

    <transition name="slideupFade" mode="out-in">
      <div v-if="$route.path.includes('/+')">
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
      </div>
    </transition>

    <transition name="slideupFade" mode="out-in">
      <div v-if="$route.name === 'Projet'">
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
      </div>
    </transition>
  </nav>
</template>
<script>
import DodocLogo from "@/components/nav/DodocLogo.vue";

export default {
  props: {},
  components: {
    DodocLogo,
  },
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
._breadcrumb {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  > * {
    display: flex;
    align-items: center;
  }
}

._logo {
  flex: 0 0 auto;

  svg {
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
