<template>
  <div class="_projectView">
    <sl-spinner style="--indicator-color: currentColor" v-if="!project" />
    <div v-else-if="fetch_project_error">
      {{ fetch_project_error }}
    </div>
    <template v-else>
      <div class="_topContent">
        <ProjectPreview
          :project="project"
          context="full"
          :can_edit_project="can_edit_project"
        />

        <div class="_projectMeta">
          <CardAuthor :project="project" :can_edit_project="can_edit_project" />
          <CardMachines
            :project="project"
            :can_edit_project="can_edit_project"
          />
          <CardStatus :project="project" :can_edit_project="can_edit_project" />
          <CardLicense
            :project="project"
            :can_edit_project="can_edit_project"
          />

          <sl-card class="u-card">
            <div slot="header">
              Fichiers à télécharger
              <sl-icon-button
                name="file-earmark-fill"
                label="Avatar"
              ></sl-icon-button>
            </div>
            <div class="">
              <ul class="widget-content list-group list-group-lg no-bg auto">
                <li
                  ng-repeat="file in project.project_caos_attributes"
                  class="list-group-item no-b clearfix ng-scope"
                >
                  <a
                    target="_blank"
                    ng-href="/uploads/project_cao/101/%C3%A9l%C3%A9phant_serre_livre.svg"
                    download="/uploads/project_cao/101/%C3%A9l%C3%A9phant_serre_livre.svg"
                    class="ng-binding"
                    href="/uploads/project_cao/101/%C3%A9l%C3%A9phant_serre_livre.svg"
                    ><i class="fa fa-arrow-circle-o-down"> </i>
                    éléphant_serre_livre.svg</a
                  >
                </li>
                <li
                  ng-repeat="file in project.project_caos_attributes"
                  class="list-group-item no-b clearfix ng-scope"
                >
                  <a
                    target="_blank"
                    ng-href="/uploads/project_cao/102/%C3%A9l%C3%A9phant.svg"
                    download="/uploads/project_cao/102/%C3%A9l%C3%A9phant.svg"
                    class="ng-binding"
                    href="/uploads/project_cao/102/%C3%A9l%C3%A9phant.svg"
                  >
                    <sl-icon-button
                      name="file-earmark-arrow-down-fill"
                      label="Avatar"
                    />
                    éléphant.svg
                  </a>
                </li>
                <li
                  ng-repeat="file in project.project_caos_attributes"
                  class="list-group-item no-b clearfix ng-scope"
                >
                  <a
                    target="_blank"
                    ng-href="/uploads/project_cao/103/%C3%A9l%C3%A9phant_serre_livre_base.svg"
                    download="/uploads/project_cao/103/%C3%A9l%C3%A9phant_serre_livre_base.svg"
                    class="ng-binding"
                    href="/uploads/project_cao/103/%C3%A9l%C3%A9phant_serre_livre_base.svg"
                    ><i class="fa fa-arrow-circle-o-down"> </i>
                    éléphant_serre_livre_b...</a
                  >
                </li>
                <!-- end ngRepeat: file in project.project_caos_attributes -->
              </ul>
            </div>
          </sl-card>

          <sl-card class="u-card">
            <div slot="header">
              Machines et matériaux
              <sl-icon-button name="nut-fill" label="Avatar"></sl-icon-button>
            </div>
            <ul class="widget-content list-group list-group-lg no-bg auto">
              <li
                ng-repeat="machine in project.machines"
                class="list-group-item no-b clearfix ng-scope"
              >
                <a
                  ui-sref="app.public.machines_show({id: machine.id})"
                  class="ng-binding"
                  href="#!/machines/1"
                  >Découpeuse laser Speedy 300</a
                >
              </li>
              <li
                ng-repeat="component in project.components"
                class="list-group-item no-b clearfix ng-binding ng-scope"
              >
                Bois Medium
              </li>
            </ul>
          </sl-card>
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
            @update:projectpanes="projectpanes = $event"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import ProjectPreview from "@/components/ProjectPreview.vue";
import PaneList2 from "@/components/nav/PaneList2.vue";
import ProjectPanes from "@/components/ProjectPanes.vue";
import CardAuthor from "@/components/CardAuthor.vue";
import CardMachines from "@/components/CardMachines.vue";
import CardStatus from "@/components/CardStatus.vue";
import CardLicense from "@/components/CardLicense.vue";

export default {
  props: {},
  components: {
    ProjectPreview,
    PaneList2,
    ProjectPanes,
    CardAuthor,
    CardMachines,
    CardStatus,
    CardLicense,
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
      return this.project.files.filter((f) => f.is_journal === true) || [];
    },
    can_edit_project() {
      return this.$api.is_logged_in;
    },
    current_projectpanes() {
      if (this.can_edit_project) return this.projectpanes;
      return [
        {
          type: "Documenter",
          pad: {},
          size: 100,
        },
      ];
    },
  },
  methods: {
    async deleteFolder() {
      await this.$api.deleteFolder({
        folder_type: "projects",
        folder_slug: this.project_slug,
      });
      this.$router.push("/projects");
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
  },
};
</script>
<style lang="scss" scoped>
._projectView {
}

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

._projectMeta {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: calc(var(--spacing) * 1);
  margin: 0 auto;
  padding: calc(var(--spacing) * 1);

  > * {
    flex: 0 1 240px;
  }
}

._topContent {
  max-width: 120vh;
  margin: 0 auto;
}
</style>
