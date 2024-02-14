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
          <button
            type="button"
            class="u-button u-button_red u-button_small"
            v-if="can_contribute_to_space"
            @click="show_create_modal = true"
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 168 168"
              style="enable-background: new 0 0 168 168"
              xml:space="preserve"
            >
              <path
                style="fill: #fc4b60"
                d="M24.6,24.4c-32.8,32.8-32.8,86.1,0,119c32.8,32.8,85.9,32.8,118.7,0c32.8-32.8,32.8-85.9,0-118.7
		C110.5-8.2,57.5-8.2,24.6,24.4z"
              />
              <polygon
                style="fill: #ffbe32"
                points="132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 
		73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 		"
              />
            </svg>
            &nbsp;
            {{ $t("create_a_project") }}
          </button>
          <button
            type="button"
            class="u-button u-button_red u-button_small"
            v-if="can_contribute_to_space"
            @click="show_import_modal = true"
          >
            <svg width="20" height="17" viewBox="0 0 20 17">
              <path
                d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
              />
            </svg>
            &nbsp;
            {{ $t("import_a_project") }}
          </button>
        </div>

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

        <ProjectsListWithFilter
          v-if="projects !== undefined"
          :projects_pinned="space.projects_pinned"
          :space_path="space.$path"
          :projects="projects"
          :can_edit="can_edit_space"
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
