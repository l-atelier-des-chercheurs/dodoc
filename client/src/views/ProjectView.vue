<template>
  <div class="_projectView">
    <transition name="fade_fast" mode="out-in">
      <div class="u-divCentered" v-if="is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else-if="fetch_project_error_message" key="err">
        <div class="u-instructions _errNotice">
          {{ fetch_project_error_message }}
        </div>
      </div>
      <div v-else key="project">
        <div class="_topContent">
          <div class="u-displayAsPublic" v-if="can_contribute_to_project">
            <div class="_sticky">
              <div class="_content">
                <ToggleInput
                  :content.sync="display_as_public"
                  :label="$t('display_as_public')"
                />
              </div>
            </div>
          </div>

          <ProjectPresentation
            :project="project"
            context="full"
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
          <hr v-else class="_separator" />
          <div class="_panes">
            <ProjectPanes
              :projectpanes="projectpanes"
              :project="project"
              :can_edit_project="
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

export default {
  props: {},
  components: {
    ProjectPresentation,
    PaneList2,
    ProjectPanes,
  },
  data() {
    return {
      is_loading: true,
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

    if (!this.can_edit_project)
      this.projectpanes = [
        {
          type: "publish",
          size: 100,
        },
      ];

    this.$eventHub.$emit("received.project", this.project);
    this.$eventHub.$on("folder.removed", this.closeOnRemove);
    this.$api.join({ room: this.project.$path });
    //
  },
  mounted() {},
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

._topContent {
  position: relative;
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
