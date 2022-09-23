<template>
  <div class="_projectView">
    <sl-spinner style="--indicator-color: currentColor" v-if="!project" />
    <div class="_projectInfos" v-else>
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
          class="_fsButton"
          v-text="!is_fullscreen ? 'agrandir' : 'réduire'"
          @click="toggleFs"
        />
      </div>
      <div class="_projectInfos--meta">
        <h1>
          {{ project.title }}
        </h1>

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

        <br />

        <TextField
          :label="$t('project_description')"
          :help_text="$t('project_description_help_text')"
          :field_name="'description'"
          :content="project.description"
          :path_to_resource="`/projects/${project_slug}`"
        />

        <br />

        <div class="_label">mots-clés</div>
        <sl-badge variant="primary" pill>Primary</sl-badge>
        <sl-badge variant="success" pill>Success</sl-badge>
        <sl-badge variant="neutral" pill>Neutral</sl-badge>

        <button type="button" class="">ajouter</button>

        <!-- <sl-tree>
          <sl-tree-item>
            Informations
            <sl-tree-item>
              Date de création
              <sl-tree-item>
                <DateField
                  :date="project.date_uploaded"
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

        <DateField :title="'date_created'" :date="project.date_created" />
      </div>
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
  align-items: center;
  margin: calc(var(--spacing) * 2) auto;
  margin: 0 auto;
  // padding: 0 calc(var(--spacing) * 2);
  background: white;
  // border-radius: var(--border-radius);
  overflow: hidden;

  // min-height: 50vh;
  width: 100%;
}

._projectInfos--cover {
  position: relative;
  width: 50%;
  aspect-ratio: 1/1;
  overflow: hidden;
  max-height: 70vh;

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
}

._projectInfos--meta {
  flex: 1 1 33ch;
  padding: calc(var(--spacing));
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
</style>
