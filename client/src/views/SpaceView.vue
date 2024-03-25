<template>
  <div class="_spaceView">
    <div v-if="space">
      <div class="_topSpace">
        <SpacePresentation
          :space="space"
          :context="'full'"
          :can_edit="can_edit_space"
        />
      </div>

      <ProjectsTester v-if="false" :path="projects_path" />

      <div class="_projectsList">
        <div class="u-sameRow u-spacingBottom">
          <DLabel :str="$t('list_of_projects')" :tag="'h2'" />
        </div>

        <ProjectsListWithFilter
          v-if="projects !== undefined"
          :projects_pinned="space.projects_pinned"
          :space_path="space.$path"
          :projects="projects"
          :can_edit="can_edit_space"
        >
          <button
            type="button"
            class="u-button u-button_red u-button_small"
            v-if="can_contribute_to_space"
            @click="show_create_modal = true"
          >
            <b-icon icon="plus" :label="$t('create')" />
            {{ $t("create") }}
          </button>
          <button
            type="button"
            class="u-button u-button_red u-button_small"
            v-if="can_contribute_to_space"
            @click="show_import_modal = true"
          >
            <b-icon icon="upload" :label="$t('import')" />
            {{ $t("import_a_project") }}
          </button>
        </ProjectsListWithFilter>
        <CreateFolder
          v-if="show_create_modal"
          :modal_name="$t('create_a_project')"
          :path="projects_path"
          :default_folder_status="'draft'"
          @close="show_create_modal = false"
          @openNew="openNewProject"
        />

        <ImportFolder
          v-if="show_import_modal"
          :modal_name="$t('import_a_project')"
          :path="projects_path"
          @close="show_import_modal = false"
          @openNew="openNewProject"
        />
      </div>
    </div>
  </div>
</template>
<script>
import ProjectsListWithFilter from "@/components/ProjectsListWithFilter.vue";
import SpacePresentation from "@/components/space/SpacePresentation.vue";

export default {
  props: {},
  components: {
    ProjectsListWithFilter,
    SpacePresentation,
    ProjectsTester: () => import("@/adc-core/tests/ProjectsTester.vue"),
  },
  data() {
    return {
      space: undefined,
      projects: undefined,
      show_create_modal: false,
      show_import_modal: false,
    };
  },
  created() {},
  async mounted() {
    await this.getSpace();
    this.$api.join({ room: this.space_path });
    this.$eventHub.$emit("received.space", this.space);

    await this.getProjects();
    this.$api.join({ room: this.projects_path });

    this.$eventHub.$on("folder.removed", this.closeOnRemove);
  },
  beforeDestroy() {
    this.$api.leave({ room: this.space_path });
    this.$api.leave({ room: this.projects_path });

    this.$eventHub.$off("folder.removed", this.closeOnRemove);
  },
  watch: {},
  computed: {
    space_path() {
      return this.createPath({ space_slug: this.$route.params.space_slug });
    },
    projects_path() {
      return this.space_path + "/projects";
    },
    can_edit_space() {
      return this.canLoggedinEditFolder({ folder: this.space });
    },
    can_contribute_to_space() {
      return this.canLoggedinContributeToFolder({ folder: this.space });
    },
  },
  methods: {
    async getSpace() {
      this.space = await this.$api
        .getFolder({
          path: this.space_path,
        })
        .catch(() => {
          return;
        });
    },
    async getProjects() {
      this.projects = await this.$api
        .getFolders({
          path: this.projects_path,
        })
        .catch(() => {
          return;
        });
    },
    openNewProject(new_folder_slug) {
      this.show_create_modal = false;
      const url = this.createURLFromPath(
        this.projects_path + "/" + new_folder_slug
      );
      this.$router.push(url);
    },
    closeOnRemove({ path }) {
      if (path === this.space.$path) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t("notifications.space_was_removed"));
        this.$router.push("/");
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._backBtn {
  margin-top: var(--spacing);
  margin-left: var(--spacing);
}

._spaceView {
  // max-width: var(--max-column-width);
  margin: 0 auto;
}

._topSpace {
  max-width: var(--max-column-width);
  margin: calc(var(--spacing) * 1) auto 0;
}

._projectsList {
  max-width: var(--max-column-width);
  margin: calc(var(--spacing) * 1) auto 0;
  // padding: calc(var(--spacing) * 1);
}
</style>
