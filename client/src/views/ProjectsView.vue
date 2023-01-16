<template>
  <div class="_projectsView">
    <!-- <pre>
       {{ projects }}
    </pre> -->

    <div class="_u-sidepadding">
      <div class="">
        <router-link class="u-buttonLink" :to="`/`">
          <sl-icon name="arrow-left-short" />
          {{ $root.app_infos.name_of_instance }}
          <!-- <sl-icon name="arrow-left-short" />{{ $t("general_informations") }} -->
        </router-link>
      </div>
      <br />
      <div class="_title">
        <h1>{{ $t("list_of_projects") }}</h1>
      </div>
    </div>

    <transition name="fade_fast" mode="out-in">
      <div class="u-divCentered _u-sidepadding" v-if="!projects" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else-if="fetch_projects_error" class="_u-sidepadding" key="err">
        {{ fetch_projects_error }}
      </div>

      <div v-else key="projects">
        <div class="_u-sidepadding">
          <!-- todo : translate -->
          <template v-if="!connected_as">
            Vous devez
            <button
              type="button"
              class="u-button u-button_bleumarine u-button_small"
              @click="$eventHub.$emit(`toolbar.openAuthor`)"
            >
              vous inscrire
            </button>
            pour pouvoir créer ou rejoindre un projet.
          </template>

          <CreateProject
            v-if="show_create_modal"
            @close="show_create_modal = false"
            @openNewProject="openNewProject"
          />

          <ProjectsTester v-if="is_admin && false" />
        </div>

        <br />

        <div v-if="connected_as" class="_myProjects">
          <div class="_u-sidepadding _projectsSection">
            <div class="_sectionLabel" :key="'label'">
              <h3>
                {{ $t("my_projects") }}&nbsp;
                <small>({{ my_projects.length }})</small>
              </h3>
              <button
                type="button"
                class="u-button u-button_red"
                v-if="connected_as"
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
                {{ $t("create_a_project") }}
              </button>
            </div>

            <ProjectsList :projects="my_projects" />
          </div>

          <br />
        </div>

        <div class="_u-sidepadding _projectsSection _otherProjects">
          <div class="_sectionLabel" :key="'label'">
            <h3>
              <sl-icon name="check-lg" />
              {{ $t("finished_projects") }}&nbsp;
              <small>({{ finalized_projects.length }})</small>
            </h3>
          </div>
          <ProjectsList :projects="finalized_projects" />
        </div>

        <br />

        <div class="_u-sidepadding _projectsSection _otherProjects">
          <div class="_sectionLabel" :key="'label'">
            <h3>
              <sl-icon name="cone-striped" />
              {{ $t("projects_in_progress") }}&nbsp;
              <small>({{ draft_projects.length }})</small>
            </h3>
          </div>
          <ProjectsList :projects="draft_projects" />
        </div>

        <template v-if="is_admin">
          <br />

          <div class="_u-sidepadding _projectsSection _invisibleProjects">
            <div class="_sectionLabel" :key="'label'">
              <h3>
                <sl-icon name="incognito" />
                {{ $t("invisible_nonauthor_projects") }}&nbsp;
                <small>({{ invisible_nonauthor_projects.length }})</small>
              </h3>
            </div>
            <ProjectsList :projects="invisible_nonauthor_projects" />
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>
<script>
import CreateProject from "@/components/modals/CreateProject.vue";
import ProjectsList from "@/components/ProjectsList.vue";
import ProjectsTester from "@/adc-core/tests/ProjectsTester.vue";

export default {
  props: {},
  components: {
    CreateProject,
    ProjectsTester,
    ProjectsList,
  },
  data() {
    return {
      path: `projects`,
      projects: [],
      fetch_projects_error: null,

      show_create_modal: false,
    };
  },
  created() {},
  async mounted() {
    this.projects = await this.$api
      .getFolders({
        path: this.path,
      })
      .catch((err) => {
        this.fetch_project_error = err.response;
        this.is_loading = false;
        return;
      });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    sorted_projects() {
      let _projects = this.projects.slice();
      _projects = _projects.filter((p) =>
        this.canLoggedinSeeProject({
          project: p,
        })
      );

      return _projects.sort(
        (a, b) => +new Date(b.$date_created) - +new Date(a.$date_created)
      );
    },
    finalized_projects() {
      return this.sorted_projects.filter((p) => p.$status === "finished");
    },
    draft_projects() {
      return this.sorted_projects.filter(
        (p) => p.$status !== "finished" && p.$status !== "invisible"
      );
    },
    my_projects() {
      return this.sorted_projects.filter(
        (p) =>
          Array.isArray(p.$authors) &&
          p.$authors.includes(this.connected_as.$path)
      );
    },
    invisible_nonauthor_projects() {
      return this.sorted_projects.filter(
        (p) =>
          p.$status === "invisible" &&
          (!Array.isArray(p.$authors) ||
            !p.$authors.includes(this.connected_as.$path))
      );
    },
  },
  methods: {
    openNewProject(new_folder_slug) {
      this.show_create_modal = false;
      this.$router.push(`/projects/${new_folder_slug}`);
    },
  },
};
</script>
<style lang="scss" scoped>
._projectsView {
  padding: calc(var(--spacing) * 2) 0;

  > * {
    margin-bottom: var(--spacing);
  }
}
._title {
  // text-align: center;
}

._otherProjects {
  // background: white;
  padding-top: calc(var(--spacing) / 2);
  padding-bottom: calc(var(--spacing) / 2);
}

._myProjects {
  background: var(--c-bleumarine_clair);
  // padding-top: calc(var(--spacing) / 2);
  padding-bottom: calc(var(--spacing) / 2);

  ._sectionLabel {
    // background: var(--c-bleumarine_clair);
  }
}

._u-sidepadding {
  padding-left: calc(var(--spacing) * 2);
  padding-right: calc(var(--spacing) * 2);
}

._projectsSection {
  // border-top: 12px solid white;
  // margin-top: calc(var(--spacing) * 1);
}
._sectionLabel {
  width: 100%;
  height: 100%;
  box-shadow: none;
  text-align: center;

  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;

  gap: calc(var(--spacing) / 1);

  // background: rgba(255, 255, 255, 0.1);

  // background: var(--c-bodybg);
  backdrop-filter: blur(12px);
  mask: linear-gradient(black 60%, transparent);

  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2)
    calc(var(--spacing) * 2);
  // margin-left: calc(var(--spacing) * -1);
  font-size: var(--sl-font-size-x-large);

  h3 {
    font-size: inherit;
    text-align: center;
    // margin-right: calc(var(--spacing) * -1);
    // padding-top: calc(var(--spacing) * 2);
    // padding-bottom: calc(var(--spacing) * 2);
  }
}
</style>
