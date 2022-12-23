<template>
  <div class="_projectView">
    <!-- <pre>
      {{ $api.store }}
    </pre> -->
    <transition name="fade_fast" mode="out-in">
      <div class="_spinner" v-if="!project" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else-if="fetch_project_error" key="err">
        {{ fetch_project_error }}
      </div>
      <div v-else key="project">
        <!-- <pre>
       {{ project }}
      </pre> -->

        <div class="_topContent">
          <div class="_displayAsPublic">
            <div class="_displayAsPublic--content">
              <ToggleInput
                class="u-button u-button_bleuvert"
                v-if="can_edit_project"
                :content.sync="display_as_public"
                :label="$t('display_as_public')"
              />
            </div>
          </div>

          <ProjectPresentation
            :project="project"
            context="full"
            :can_edit_project="can_edit_project && !display_as_public"
          />
        </div>

        <div class="_projectPanesAndList">
          <PaneList2
            class="_paneList"
            v-if="can_edit_project && !display_as_public"
            :project="project"
            :panes.sync="projectpanes"
          />
          <div class="_panes">
            <ProjectPanes
              :projectpanes="projectpanes"
              :project="project"
              :can_edit_project="can_edit_project && !display_as_public"
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
      fetch_project_error: null,
      project: null,

      display_as_public: false,

      projectpanes: [],
    };
  },
  created() {},
  async mounted() {
    await this.listProject();

    if (!this.can_edit_project)
      this.projectpanes = [
        {
          type: "Publier",
          pad: {},
          size: 100,
        },
      ];

    this.$eventHub.$emit("received.project", this.project);
    this.$eventHub.$on("folder.removed", this.closeOnRemove);
    this.$api.join({ room: this.project.$path });

    //
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
        if (this.display_as_public)
          this.projectpanes = [
            {
              type: "Publier",
              pad: {},
              size: 100,
            },
          ];
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
    articles() {
      return this.project.$files.filter((f) => f.is_journal === true) || [];
    },
    can_edit_project() {
      // if (!this.connected_as) return false;
      if (this.connected_as?.role === "admin") return true;
      if (!this.project.$authors) return true;
      if (Array.isArray(this.project.$authors))
        if (this.project.$authors.length === 0) return true;
        else if (this.project.$authors.includes(this.connected_as?.$path))
          return true;
      return false;
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
._projectView {
  position: relative;
  min-height: calc(100vh - 60px);
}
._spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 100%;
  height: 100%;
}

._projectPanesAndList {
  position: relative;
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

.avatar-group sl-avatar:not(:first-of-type) {
  margin-left: -1rem;
}

.avatar-group sl-avatar::part(base) {
  border: solid 2px var(--sl-color-neutral-0);
}

._topContent {
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

._displayAsPublic {
  position: sticky;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  padding: calc(var(--spacing) / 1);

  display: flex;
  justify-content: center;

  pointer-events: none;

  > ._displayAsPublic--content {
    pointer-events: auto;
    background: var(--c-bleuvert);
    border: 2px solid var(--c-bleuvert_fonce);
    border-radius: 8px;

    > * {
      padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4);
    }
  }
}
</style>
