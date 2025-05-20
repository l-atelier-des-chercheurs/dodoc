<template>
  <nav aria-label="Fil d'ariane" class="_breadcrumb">
    <button
      type="button"
      class="u-button u-button_icon _backButton"
      v-if="$root.app_infos.is_electron"
      :title="$t('back')"
      @click="goBack"
    >
      <b-icon icon="chevron-left" />
    </button>
    <template v-else>
      <div class="_emptySpace" />
    </template>

    <div class="_logo">
      <component
        :is="$route.name !== 'Accueil' ? 'router-link' : 'span'"
        :to="`/`"
        :title="$t('home')"
      >
        <DodocLogo
          class="_dodocLogo"
          v-if="instance_logo === 'dodoc'"
          :can_animate="$route.name !== 'Accueil'"
        />
        <img class="_customLogo" v-else :src="instance_logo" />
      </component>
    </div>

    <template v-for="(item, index) in breadcrumbItems">
      <div :key="index">
        <b-icon icon="arrow-right-short" label="" class="_arrowRight" />
        &nbsp;
        <component
          :is="item.isLink ? 'router-link' : 'span'"
          class="_spaceName"
          :to="item.to"
        >
          <div class="u-label" v-if="item.label">
            {{ item.label }}
          </div>
          <div class="">
            {{ item.title }}
          </div>
        </component>
      </div>
    </template>
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
      author: undefined,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("received.project", this.setProject);
    this.$eventHub.$on("received.space", this.setSpace);
    this.$eventHub.$on("received.author", this.setAuthor);
  },
  beforeDestroy() {
    this.$eventHub.$off("received.project", this.setProject);
    this.$eventHub.$off("received.space", this.setSpace);
    this.$eventHub.$off("received.author", this.setAuthor);
  },
  watch: {
    show_space_name() {
      if (!this.show_space_name) this.space = undefined;
    },
    show_project_name() {
      if (!this.show_project_name) this.project = undefined;
    },
    show_author_page() {
      if (!this.show_author_page) this.author = undefined;
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
    show_authors_page() {
      return this.$route.path.includes("/@");
    },
    show_author_page() {
      return this.$route.name === "Auteur";
    },
    breadcrumbItems() {
      const items = [];

      if (this.show_space_name) {
        items.push({
          label: this.$t("space"),
          title: (this.space && this.space.title) || "–",
          isLink: this.$route.name === "Projet",
          to: { path: "/+" + this.$route.params.space_slug },
        });
      }

      if (this.show_project_name) {
        items.push({
          label: this.$t("project"),
          title: (this.project && this.project.title) || "–",
          isLink: false,
        });
      }

      if (this.show_authors_page) {
        items.push({
          title: this.$t("list_of_accounts"),
          isLink: this.$route.name === "Auteur",
          to: { path: "/@" },
        });
      }

      if (this.show_author_page && this.author) {
        items.push({
          title: this.author.name,
          isLink: false,
        });
      }

      return items;
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
    setAuthor(author) {
      this.author = author;
    },
  },
};
</script>
<style lang="scss" scoped>
._breadcrumb {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  padding: 0 calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);
  line-height: 1.1;

  > * {
    flex: 0 0 auto;
    display: flex;
    align-items: stretch;
    overflow: hidden;
  }
}

._emptySpace {
  width: 5px;
}

._backButton {
  // background: var(--c-gris_clair);
  // border-radius: 10px;
  // padding: 4px;
}

._logo {
  flex: 0 0 auto;

  svg {
    width: 105px;
  }

  img {
    width: auto;
    border-radius: 4px;
  }

  svg,
  img {
    height: 35px;
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

._spaceName {
  color: inherit;

  // font-weight: 500;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  // align-items: center;
}

a._spaceName {
  text-decoration: none;

  > *:not(.u-label) {
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
}

.u-label {
  text-decoration: none;
  margin-bottom: calc(var(--spacing) / 4);
}

._arrowRight {
  flex: 0 0 auto;
}
</style>
