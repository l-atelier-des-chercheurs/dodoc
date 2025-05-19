<template>
  <nav aria-label="Fil d’ariane" class="_breadcrumb">
    <button
      type="button"
      class="u-button u-button_icon _backButton"
      v-if="$root.app_infos.is_electron"
      :title="$t('back')"
      @click="goBack"
    >
      <b-icon icon="chevron-left" />
    </button>

    <div class="_logo">
      <component
        :is="$route.name !== 'Accueil' ? 'router-link' : 'span'"
        :to="`/`"
        :title="$t('home')"
      >
        <DodocLogo class="_dodocLogo" v-if="instance_logo === 'dodoc'" />
        <img class="_customLogo" v-else :src="instance_logo" />
      </component>
    </div>

    <transition name="fade" mode="out-in">
      <div v-if="show_space_name">
        <b-icon icon="arrow-right-short" label="" class="_arrowRight" />
        &nbsp;
        <component
          :is="$route.name === 'Projet' ? 'router-link' : 'span'"
          class="_spaceName"
          :to="{ path: '/+' + $route.params.space_slug }"
          :disabled="$route.name === 'Espace'"
        >
          <!-- <div class="u-label">
            {{ $t("space") }}
          </div> -->
          <div class="_name">{{ (space && space.title) || "–" }}</div>
        </component>
      </div>
    </transition>

    <transition name="fade" mode="out-in">
      <div v-if="show_project_name">
        <b-icon icon="arrow-right-short" label="" class="_arrowRight" />
        &nbsp;
        <component
          :is="false ? 'router-link' : 'span'"
          class="_spaceName"
          :to="{ path: '/+' + $route.params.space_slug }"
          :disabled="$route.name === 'Espace'"
        >
          <!-- <div class="u-label">
            {{ $t("project") }}
          </div> -->
          <div class="_name">{{ (project && project.title) || "–" }}</div>
        </component>
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
  watch: {
    show_space_name() {
      if (!this.show_space_name) this.space = undefined;
    },
    show_project_name() {
      if (!this.show_project_name) this.project = undefined;
    },
  },
  computed: {
    instance_logo() {
      return this.$root.app_infos.instance_meta.topbar_thumb || "dodoc";
    },
    show_space_name() {
      return this.$route.path.includes("/+");
    },
    show_project_name() {
      return this.$route.name === "Projet";
    },
  },
  methods: {
    setSpace(space) {
      this.space = space;
    },
    setProject(project) {
      this.project = project;
    },
    goBack() {
      window.history.back();
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

._backButton {
}

._name {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-weight: 500;
}

._logo {
  flex: 0 0 auto;

  svg {
    width: 120px;
  }

  img {
    width: auto;
    border-radius: 4px;
  }

  svg,
  img {
    height: 40px;
    object-fit: scale-down;
    object-position: 0 0;
  }

  ._customLogo {
    border-radius: 2px;
    border: 2px solid var(--c-gris_clair);
    transition: 0.2s cubic-bezier(0.19, 1, 0.22, 1);
  }

  a {
    ._dodocLogo,
    ._customLogo {
      &:hover,
      :focus-visible {
        opacity: 0.9;
        border-color: var(--c-gris);
      }
    }
  }
}

a._spaceName {
  color: inherit;
  // text-decoration: none;

  &:hover {
    font-weight: 500;
  }
}

.u-label {
  text-decoration: none;
}

._arrowRight {
  flex: 0 0 auto;
}
</style>
