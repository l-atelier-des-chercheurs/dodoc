<template>
  <div class="_projectView">
    <sl-spinner style="--indicator-color: currentColor" v-if="!project" />
    <div class="_projectInfos u-card" v-else>
      <div
        class="_projectInfos--cover"
        ref="coverImage"
        :class="{
          'is--fullscreen': is_fullscreen,
        }"
      >
        <img :src="`${$root.publicPath}large_project_image.jpg`" />
        <button
          type="button"
          class="_fsButton u-buttonLink"
          v-text="!is_fullscreen ? 'agrandir' : 'réduire'"
          @click="toggleFs"
        />
      </div>

      <br />
      <div class="_projectInfos--meta">
        <!-- :help_text="$t('project_title_help_text')" -->
        <!-- :field_name="'title'" -->
        <h1>
          <TitleField
            :field_name="'title'"
            :content="project.title"
            :path="`/projects/${project_slug}`"
            :required="true"
            :maxlength="40"
          />
        </h1>

        <hr />

        <!-- <h1>
          {{ project.title }}
        </h1> -->

        <TextField
          :label="$t('project_description')"
          :help_text="$t('project_description_help_text')"
          :field_name="'description'"
          :content="project.description"
          :path_to_resource="`/projects/${project_slug}`"
        />
        <!-- <sl-rating label="Rating" readonly value="3"></sl-rating> -->

        <br />

        <!-- <sl-tree>
          <sl-tree-item>
            Informations
            <sl-tree-item>
              Date de création
              <sl-tree-item>
                <DateField
                  :date="project.date_created"
                  :show_detail_initially="true"
                />
              </sl-tree-item>
            </sl-tree-item>
            <sl-tree-item>
              Date de dernière modification
              <sl-tree-item>
                <DateField
                  :date="project.date_modified"
                  :show_detail_initially="true"
                />
              </sl-tree-item>
            </sl-tree-item>
            <sl-tree-item>
              Supprimer ce projet
              <sl-tree-item>
                <sl-button @click="deleteFolder" size="small"
                  >Confirmer</sl-button
                >
              </sl-tree-item>
            </sl-tree-item>
          </sl-tree-item>
        </sl-tree> -->
      </div>
    </div>

    <div class="_meta">
      <sl-card class="u-card">
        <div slot="header">
          Auteur.rice
          <sl-icon-button name="person-fill" label="Avatar"></sl-icon-button>
        </div>
        <div class="avatar-group">
          Par
          <sl-avatar
            image="https://images.unsplash.com/photo-1490150028299-bf57d78394e0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80&crop=right"
            label="Avatar 1 of 4"
          ></sl-avatar>

          <sl-avatar
            image="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80"
            label="Avatar 2 of 4"
          ></sl-avatar>
        </div>
      </sl-card>

      <sl-card class="u-card">
        <div slot="header">
          Mots-clés
          <sl-icon-button name="person-fill" label="Avatar"></sl-icon-button>
        </div>

        <div class="_label">mots-clés</div>
        <sl-badge variant="primary" pill>Primary</sl-badge>
        <sl-badge variant="success" pill>Success</sl-badge>
        <sl-badge variant="neutral" pill>Neutral</sl-badge>

        <button type="button" class="">ajouter</button>
      </sl-card>
      <sl-card class="u-card">
        <div slot="header">
          Statut
          <sl-icon-button name="person-fill" label="Avatar"></sl-icon-button>
        </div>
        <select>
          <option>En cours</option>
          <option>Finalisé</option>
        </select>
      </sl-card>

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

      <sl-card class="u-card">
        <div slot="header">
          License
          <sl-icon-button name="person-fill" label="Avatar"></sl-icon-button>
        </div>
        <div class="panel-body ng-binding">
          <strong>BY NC SA</strong>
          <br />
          Attribution + Pas d'Utilisation Commerciale + Partage dans les mêmes
          conditions
        </div>
      </sl-card>
    </div>

    <div class="_projectPanesAndList">
      <PaneList2 class="_paneList" :panes.sync="projectpanes" />
      <div class="_panes" v-if="!is_loading && !error">
        <ProjectPanes :projectpanes.sync="projectpanes" :project="project" />
      </div>
    </div>
  </div>
</template>

<script>
import PaneList2 from "@/components/nav/PaneList2.vue";
import ProjectPanes from "@/components/ProjectPanes.vue";

export default {
  props: {},
  components: {
    PaneList2,
    ProjectPanes,
  },
  data() {
    return {
      project_slug: this.$route.params.slug,
      is_loading: true,
      error: null,
      project: null,

      is_fullscreen: false,

      projectpanes: [],
    };
  },
  created() {},
  mounted() {
    document.addEventListener("fullscreenchange", this.detectFullScreen);

    this.$api
      .getFolder({
        folder_type: "projects",
        folder_slug: this.project_slug,
      })
      .then((project) => {
        this.project = project;
        this.$eventHub.$emit("nav.projectName", this.project.title);
        this.$api.join({ room: `projects/${this.project_slug}` });
      })
      .catch((err) => {
        this.error = err.response;
      })
      .then(() => (this.is_loading = false));
  },
  beforeDestroy() {
    document.removeEventListener("fullscreenchange", this.detectFullScreen);
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
    detectFullScreen() {
      if (document.fullscreenElement) {
        this.is_fullscreen = true;
        // window.addEventListener("popstate", this.quitFSOnBack);
      } else {
        this.is_fullscreen = false;
        this.$nextTick(() => {
          // window.removeEventListener("popstate", this.quitFSOnBack);
        });
      }
    },
    toggleFs() {
      const elem = this.$refs.coverImage;
      if (!this.is_fullscreen) elem.requestFullscreen().catch((err) => err);
      else document.exitFullscreen();
    },
  },
};
</script>
<style lang="scss" scoped>
._projectView {
}

._projectInfos {
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;

  margin: 0 auto;
  margin: calc(var(--spacing) * 2) auto;
  // padding: 0 calc(var(--spacing) * 2);
  background: white;
  // border-radius: var(--border-radius);
  overflow: hidden;

  // max-width: 800px;

  // min-height: 50vh;
  width: 100%;
  max-width: 80vmin;

  > * {
    flex: 1 1 200px;
  }
}

._projectInfos--cover {
  position: relative;
  overflow: hidden;
  // min-height: 50vh;
  width: 100%;
  aspect-ratio: 1/1;
  max-width: 100vh;

  img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.is--fullscreen img {
    object-fit: contain;
  }
}
._fsButton {
  position: absolute;
  bottom: 0;
  margin: calc(var(--spacing) / 1);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.7);
}

._projectInfos--meta {
  display: flex;
  flex-flow: column nowrap;
  padding: calc(var(--spacing));
  place-content: center;
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

._meta {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: calc(var(--spacing) * 2);
  margin: calc(var(--spacing) * 2) auto;

  > * {
    flex: 0 1 240px;
  }
}
</style>
