<template>
  <div class="_projectView">
    <sl-spinner style="--indicator-color: currentColor" v-if="!project" />
    <div v-else-if="fetch_project_error">
      {{ fetch_project_error }}
    </div>
    <template v-else>
      <!-- <pre>
       {{ project }}
      </pre> -->
      <div class="_topContent">
        <ProjectPresentation
          :project="project"
          context="full"
          :can_edit_project="can_edit_project"
        />

        <!-- Metadonnées, Auteurs, Mots-clés, Machines, Statut, Licence -->

        <div class="_projectMeta">
          <CardMeta :project="project" :can_edit_project="can_edit_project" />
          <!-- <CardAuthor :project="project" :can_edit_project="can_edit_project" /> -->
          <CardKeywords
            :project="project"
            :can_edit_project="can_edit_project"
          />
          <CardMachines
            :project="project"
            :can_edit_project="can_edit_project"
          />
          <CardStatus :project="project" :can_edit_project="can_edit_project" />
          <CardLicense
            :project="project"
            :can_edit_project="can_edit_project"
          />

          <CardFiles :project="project" :can_edit_project="can_edit_project" />
        </div>
      </div>

      <div class="_projectPanesAndList">
        <PaneList2
          class="_paneList"
          v-if="can_edit_project"
          :panes.sync="projectpanes"
        />
        <div class="_panes">
          <ProjectPanes
            :projectpanes="current_projectpanes"
            :project="project"
            :can_edit_project="can_edit_project"
            @update:projectpanes="projectpanes = $event"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";
import PaneList2 from "@/components/nav/PaneList2.vue";
import ProjectPanes from "@/components/ProjectPanes.vue";

import CardMeta from "@/components/project_cards/CardMeta.vue";
// import CardAuthor from "@/components/project_cards/CardAuthor.vue";
import CardKeywords from "@/components/project_cards/CardKeywords.vue";
import CardMachines from "@/components/project_cards/CardMachines.vue";
import CardStatus from "@/components/project_cards/CardStatus.vue";
import CardLicense from "@/components/project_cards/CardLicense.vue";
import CardFiles from "@/components/project_cards/CardFiles.vue";

export default {
  props: {},
  components: {
    ProjectPresentation,
    PaneList2,
    ProjectPanes,

    CardMeta,
    // CardAuthor,
    CardKeywords,
    CardMachines,
    CardStatus,
    CardLicense,
    CardFiles,
  },
  data() {
    return {
      project_slug: this.$route.params.slug,
      fetch_project_error: null,
      project: null,

      projectpanes: [],
    };
  },
  created() {},
  async mounted() {
    const project = await this.$api
      .getFolder({
        folder_type: "projects",
        folder_slug: this.project_slug,
      })
      .catch((err) => {
        this.fetch_project_error = err.response;
        this.is_loading = false;
      });

    this.project = project;
    this.$eventHub.$emit("received.project", this.project);
    this.$api.join({ room: `projects/${this.project_slug}` });
  },
  beforeDestroy() {
    this.$api.leave({ room: `projects/${this.project_slug}` });
  },
  watch: {
    $route: {
      handler() {
        let projectpanes = this.$route.query?.projectpanes;
        if (projectpanes) this.projectpanes = JSON.parse(projectpanes);
      },
      immediate: true,
    },
    projectpanes: {
      handler() {
        this.updateQueryPanes();
      },
      deep: true,
    },
  },
  computed: {
    articles() {
      return this.project.$files.filter((f) => f.is_journal === true) || [];
    },
    can_edit_project() {
      return this.$api.is_logged_in;
    },
    current_projectpanes() {
      if (this.can_edit_project) return this.projectpanes;
      return [
        {
          type: "Publier",
          pad: {},
          size: 100,
        },
      ];
    },
  },
  methods: {
    updateQueryPanes() {
      let query = {};

      if (this.projectpanes)
        query.projectpanes = JSON.stringify(this.projectpanes);
      if (
        this.$route.query &&
        JSON.stringify(this.$route.query) === JSON.stringify(query)
      )
        return false;

      this.$router.push({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._projectPanesAndList {
  position: relative;
  height: 100vh;

  display: flex;
  flex-flow: column nowrap;

  ._paneList {
    flex: 0 0 auto;
  }
  ._panes {
    flex: 1 1 auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.avatar-group sl-avatar:not(:first-of-type) {
  margin-left: -1rem;
}

.avatar-group sl-avatar::part(base) {
  border: solid 2px var(--sl-color-neutral-0);
}

._topContent {
  // max-width: 120vh;
  margin: 0 auto;
  // padding: calc(var(--spacing) / 2);
}

._projectMeta {
  display: flex;
  flex-flow: row nowrap;
  overflow-x: scroll;
  overflow-y: hidden;
  background: #999;
  background: var(--c-noir);
  background: var(--c-gris);

  padding: calc(var(--spacing) / 1);
  gap: calc(var(--spacing) / 1);

  > * {
    flex: 0 0 200px;
    max-height: 200px;
    overflow: auto;
    // flex: 0 1 240px;
  }
}
</style>
