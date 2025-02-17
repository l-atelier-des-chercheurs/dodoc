<template>
  <div class="_spaceView">
    <div class="u-divCentered" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div v-else-if="fetch_space_error_message" key="err">
      <div class="u-instructions _errNotice">
        {{ fetch_space_error_message }}
      </div>
    </div>
    <div v-else-if="space">
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
      is_loading: true,
      fetch_space_error_message: null,
      space: undefined,
      projects: undefined,
      show_create_modal: false,
      show_import_modal: false,
    };
  },
  created() {},
  async mounted() {
    this.$api.updateSelfPath(this.space_path);

    await this.getSpace().catch(() => {
      this.is_loading = false;
      return;
    });
    this.$api.join({ room: this.space_path });
    this.$eventHub.$emit("received.space", this.space);

    await this.getProjects();
    this.$api.join({ room: this.projects_path });
    this.$eventHub.$on("folder.removed", this.closeOnRemove);

    this.is_loading = false;
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
        .catch((err) => {
          if (err.code === "folder_private")
            this.fetch_space_error_message = this.$t("space_is_private");
          else this.fetch_space_error_message = err.code;
          throw err;
        });
    },
    async getProjects() {
      this.projects = await this.$api
        .getFolders({
          path: this.projects_path,
        })
        .catch((err) => {});
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
          .log(this.$t("space_was_removed"));
        this.$router.push("/");
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._errNotice {
  padding: calc(var(--spacing) / 2);
}

._spaceView {
  // max-width: var(--max-column-width);
  margin: 0 auto;
}

._topSpace {
  max-width: min(var(--max-column-width), 1080px);
  margin: calc(var(--spacing) * 1) auto 0;
}

._projectsList {
  max-width: var(--max-column-width);
  margin: calc(var(--spacing) * 1) auto 0;
  // padding: calc(var(--spacing) * 1);
}
</style>
