<template>
  <div class="_projectView">
    <transition name="fade_fast" mode="out-in">
      <div class="u-divCentered" v-if="is_loading" key="loader">
        <div class="u-loader">
          <div class="_spinner"></div>
          <span v-if="has_been_loading_for_a_while">
            &nbsp;
            {{ $t("creating_thumb").toLowerCase() }}
          </span>
        </div>
      </div>
      <div class="_errNotice" v-else-if="fetch_project_error_message" key="err">
        <NotFound v-if="fetch_project_error_message === 'not_found'" />
        <div v-else class="u-instructions _errNotice">
          {{ fetch_project_error_message }}
        </div>
      </div>
      <div v-else key="project">
        <div class="_topContent">
          <ProjectPresentation
            :project="project"
            context="full"
            :display_as_public.sync="display_as_public"
            :can_contribute_to_project="can_contribute_to_project"
            :can_edit="can_edit_project && !display_as_public"
          />
        </div>

        <div class="_projectPanesAndList">
          <PaneList2
            v-if="can_contribute_to_project && !display_as_public"
            class="_paneList"
            :can_edit="can_contribute_to_project && !display_as_public"
            :project="project"
            :panes.sync="projectpanes"
          />
          <!-- <hr v-else class="_separator" /> -->
          <div class="_panes">
            <ProjectPanes
              :projectpanes="projectpanes"
              :project="project"
              :can_edit_project="can_edit_project && !display_as_public"
              :can_contribute_to_project="
                can_contribute_to_project && !display_as_public
              "
              @update:projectpanes="projectpanes = $event"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";
import PaneList2 from "@/components/nav/PaneList2.vue";
import ProjectPanes from "@/components/ProjectPanes.vue";
import NotFound from "@/components/NotFound.vue";
import DynamicTitle from "@/mixins/DynamicTitle.js";

export default {
  props: {},
  mixins: [DynamicTitle],
  components: {
    ProjectPresentation,
    PaneList2,
    ProjectPanes,
    NotFound,
  },
  data() {
    return {
      is_loading: true,
      has_been_loading_for_a_while: false,

      fetch_project_error_message: null,
      project: null,

      display_as_public: false,

      projectpanes: [],
    };
  },
  async created() {
    this.$api.updateSelfPath(this.project_path);
    await this.listProject();
    await this.getSpace();

    this.$eventHub.$emit("received.project", this.project);
    this.$eventHub.$on("folder.removed", this.closeOnRemove);
    this.$api.join({ room: this.project.$path });
    //
  },
  mounted() {
    setTimeout(() => {
      this.has_been_loading_for_a_while = true;
    }, 2000);
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
    display_as_public: {
      handler() {
        if (this.display_as_public) {
          // if one pane enabled and it is publish, dont change anything
          if (
            this.projectpanes.length !== 1 ||
            this.projectpanes.some((pp) => pp.type !== "publish")
          )
            this.projectpanes = [
              {
                type: "publish",
                size: 100,
              },
            ];
        }
      },
    },
    // is_identified: {
    //   handler() {
    //     if (!this.is_identified)
    //       if (this.projectpanes.length === 0)
    //         this.projectpanes = [
    //           {
    //             type: "Publier",
    //             pad: {},
    //             size: 100,
    //           },
    //         ];
    //   },
    //   immediate: true,
    // },
  },
  computed: {
    project_path() {
      return this.createPath({
        space_slug: this.$route.params.space_slug,
        project_slug: this.$route.params.project_slug,
      });
    },
    can_edit_project() {
      return this.canLoggedinEditFolder({ folder: this.project });
    },
    can_contribute_to_project() {
      return this.canLoggedinContributeToFolder({ folder: this.project });
    },
  },
  methods: {
    async listProject() {
      const project = await this.$api
        .getFolder({
          path: this.project_path,
        })
        .catch((err) => {
          if (err.code === "folder_private")
            this.fetch_project_error_message = this.$t("project_is_private");
          else this.fetch_project_error_message = err.code;
          this.is_loading = false;
          return;
        });

      this.is_loading = false;
      this.project = project;

      // Update document title with actual project name
      if (this.project) {
        this.updateDocumentTitle(this.project.title);
      }
    },
    async getSpace() {
      const path = this.createPath({
        space_slug: this.$route.params.space_slug,
      });

      const space = await this.$api
        .getFolder({
          path,
        })
        .catch(() => {
          return;
        });

      this.$eventHub.$emit("received.space", space);
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
      this.$router.replace({ query });
    },
    closeOnRemove({ path }) {
      if (path === this.project.$path) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t("project_was_removed"));

        this.$router.push(
          this.getParent(this.createURLFromPath(this.project.$path))
        );
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._projectView {
  position: relative;
  min-height: calc(100vh - 60px);
}
._projectPanesAndList {
  position: relative;
  z-index: 6;
  // height: 100vh;

  display: flex;
  flex-flow: column nowrap;

  ._paneList {
    flex: 0 0 auto;
  }
  ._panes {
    flex: 1 1 auto;
    // overflow-y: auto;
    // -webkit-overflow-scrolling: touch;
  }
}
._errNotice {
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: 0 auto;
}

._topContent {
  position: relative;
}

._publicView {
  text-align: right;
  margin: 0 auto;
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

._separator {
  margin: 0;
}

._errNotice {
  padding: calc(var(--spacing) / 2);
}
</style>
