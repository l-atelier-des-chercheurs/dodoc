<template>
  <div class="_projectView">
    <!-- <pre>
      {{ $api.store }}
    </pre> -->
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
          <CardStatus :project="project" :can_edit_project="can_edit_project" />
          <!-- <CardAuthor :project="project" :can_edit_project="can_edit_project" /> -->
          <CardKeywords
            :project="project"
            :can_edit_project="can_edit_project"
          />

          <CardMachines
            :project="project"
            :can_edit_project="can_edit_project"
          />
          <CardLicense
            :project="project"
            :can_edit_project="can_edit_project"
          />

          <!-- <CardFiles :project="project" :can_edit_project="can_edit_project" /> -->
        </div>
      </div>

      <div class="_projectPanesAndList">
        <PaneList2
          class="_paneList"
          v-if="can_edit_project"
          :project_title="project.title"
          :panes.sync="projectpanes"
        />
        <div class="_panes">
          <ProjectPanes
            :projectpanes="projectpanes"
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
// import CardFiles from "@/components/project_cards/CardFiles.vue";

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
    // CardFiles,
  },
  data() {
    return {
      fetch_project_error: null,
      project: null,

      projectpanes: [],
    };
  },
  created() {},
  async mounted() {
    await this.listProject();
    this.$eventHub.$emit("received.project", this.project);
    this.$eventHub.$on("folder.removed", this.closeOnRemove);
    this.$api.join({ room: this.project.$path });
  },
  beforeDestroy() {
    this.$eventHub.$off("folder.removed", this.closeOnRemove);
    this.$api.leave({ room: this.project.$path });
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
    "$api.is_logged_in": {
      handler() {
        if (this.projectpanes.length === 0)
          this.projectpanes = [
            {
              type: "Publier",
              pad: {},
              size: 100,
            },
          ];
      },
      immediate: true,
    },
  },
  computed: {
    articles() {
      return this.project.$files.filter((f) => f.is_journal === true) || [];
    },
    can_edit_project() {
      return this.$api.is_logged_in;
    },
  },
  methods: {
    async listProject() {
      const project = await this.$api
        .getFolder({
          path: this.$route.path,
        })
        .catch((err) => {
          this.fetch_project_error = err.response;
          this.is_loading = false;
        });
      this.project = project;
    },
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
    closeOnRemove({ path }) {
      if (path === this.project.$path) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t("notifications.project_was_removed"));
        this.$router.push("/projects");
      }
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
  display: flex;
  flex-flow: row wrap;
  margin: 0 auto;

  > * {
    flex: 1 0 320px;

    &._projectMeta {
      flex: 0 0 240px;
    }
  }
}

._projectMeta {
  display: flex;
  flex-flow: column nowrap;

  max-height: 40vmin;
  overflow: auto;

  // padding: calc(var(--spacing) / 2);
  // gap: calc(var(--spacing) / 2);

  > * {
    border: 1px solid var(--c-gris);

    &:first-child {
      border-top: 0 solid #000;
    }
    &:not(:last-child) {
      border-bottom: 0 solid #000;
    }
  }
}

._tabButton {
  text-align: center;
  background: var(--c-gris);
  padding: calc(var(--spacing) / 2);

  > * {
    background: white;
    border-radius: 4px;
  }
}
</style>
