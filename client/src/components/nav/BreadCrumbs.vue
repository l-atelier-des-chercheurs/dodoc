<template>
  <nav aria-label="Fil d’ariane" class="_breadcrumb">
    <div class="_logo">
      <component
        :is="$route.name !== 'Accueil' ? 'router-link' : 'span'"
        :to="`/`"
      >
        <DodocLogo />
      </component>
    </div>

    <transition name="fade" mode="out-in">
      <div v-if="$route.path.includes('/+')">
        <sl-icon name="arrow-right-short" label="" />
        &nbsp;
        <div>
          <component
            :is="$route.name === 'Projet' ? 'router-link' : 'span'"
            class="_spaceName"
            :to="{ path: '/+' + $route.params.space_slug }"
            :disabled="$route.name === 'Espace'"
          >
            <div class="u-buttonLink">
              {{ $t("space") }}
            </div>
            <div class="_name">{{ (space && space.title) || "–" }}</div>
          </component>
        </div>
      </div>
    </transition>

    <transition name="fade" mode="out-in">
      <div v-if="$route.name === 'Projet'">
        <sl-icon name="arrow-right-short" label="" />
        &nbsp;
        <div>
          <component
            :is="false ? 'router-link' : 'span'"
            class="_spaceName"
            :to="{ path: '/+' + $route.params.space_slug }"
            :disabled="$route.name === 'Espace'"
          >
            <div class="u-buttonLink">
              {{ $t("project") }}
            </div>
            <div class="_name">{{ (project && project.title) || "–" }}</div>
          </component>
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
  padding: 0 calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);
  line-height: 1.1;

  > * {
    display: flex;
    align-items: center;
    overflow: hidden;
  }
}
._name {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

._logo {
  flex: 0 0 auto;

  svg {
    width: 8em;
    height: 2.6em;
  }
}

a._spaceName {
  color: inherit;
  text-decoration: none;

  &:hover {
    font-weight: 500;
  }
}

.u-buttonLink {
  text-decoration: none;
}
</style>
