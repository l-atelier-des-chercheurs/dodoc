<template>
  <div class="_projectsView">
    <!-- <pre>
       {{ projects }}
    </pre> -->
    <!-- <div class="_title">
      <h1>Les projets</h1>
    </div> -->
    <transition name="fade_fast" mode="out-in">
      <div class="u-divCentered _u-sidepadding" v-if="!projects" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else-if="fetch_projects_error" class="_u-sidepadding" key="err">
        {{ fetch_projects_error }}
      </div>

      <div v-else key="projects">
        <div class="_u-sidepadding">
          <router-link class="u-buttonLink" :to="`/`">
            <sl-icon name="arrow-left-short" />{{ $t("general_informations") }}
          </router-link>

          <br />
          <br />

          <button
            type="button"
            class="u-button u-button_red u-button_big"
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

          <!-- todo : translate -->
          <template v-else>
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

        <template v-if="connected_as">
          <div class="_myProjects _u-sidepadding">
            <h3>
              {{ $t("my_projects") }}
              <small>({{ my_projects.length }})</small>
            </h3>
            <div
              v-if="my_projects.length === 0"
              class="u-instructions"
              key="no_content"
            >
              {{ $t("no_projects") }}
            </div>
            <transition-group
              v-else
              class="_projectsList"
              tag="div"
              name="StoryModules"
              appear
              :duration="700"
            >
              <ProjectPresentation
                v-for="project in my_projects"
                :project="project"
                context="tiny"
                :key="project.$path"
              />
            </transition-group>
          </div>

          <br />
        </template>

        <div class="_u-sidepadding">
          <h3>
            {{ $t("finished_projects") }}
            <small>({{ finalized_projects.length }})</small>
          </h3>
          <div
            v-if="finalized_projects.length === 0"
            class="u-instructions"
            key="no_content"
          >
            {{ $t("no_finalized_projects") }}
          </div>
          <transition-group
            v-else
            class="_projectsList"
            tag="div"
            name="StoryModules"
            appear
            :duration="700"
          >
            <ProjectPresentation
              v-for="project in finalized_projects"
              :project="project"
              context="list"
              :key="project.$path"
            />
          </transition-group>
        </div>

        <br />

        <div class="_u-sidepadding">
          <h3>
            {{ $t("projects_in_progress") }}
            <small>({{ draft_projects.length }})</small>
          </h3>
          <transition-group
            class="_projectsList"
            tag="div"
            name="StoryModules"
            appear
            :duration="700"
          >
            <div
              v-if="draft_projects.length === 0"
              class="u-instructions"
              key="no_content"
            >
              {{ $t("no_draft_projects") }}
            </div>
            <ProjectPresentation
              v-for="project in draft_projects"
              :project="project"
              context="list"
              :key="project.$path"
            />
          </transition-group>
        </div>

        <div v-if="is_admin" class="_u-sidepadding">
          <br />
          <h3>
            {{ $t("invisible_nonauthor_projects") }}
            <small>({{ invisible_nonauthor_projects.length }})</small>
          </h3>
          <transition-group
            class="_projectsList"
            tag="div"
            name="StoryModules"
            appear
            :duration="700"
          >
            <div
              v-if="invisible_nonauthor_projects.length === 0"
              class="u-instructions"
              key="no_content"
            >
              {{ $t("no_projects") }}
            </div>
            <ProjectPresentation
              v-for="project in invisible_nonauthor_projects"
              :project="project"
              context="list"
              :key="project.$path"
            />
          </transition-group>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";
import CreateProject from "@/components/modals/CreateProject.vue";
import ProjectsTester from "@/adc-core/tests/ProjectsTester.vue";

export default {
  props: {},
  components: {
    ProjectPresentation,
    CreateProject,
    ProjectsTester,
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
        (p) => p.$status !== "finised" && p.$status !== "invisible"
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
._u-sidepadding {
  padding-left: calc(var(--spacing) * 2);
  padding-right: calc(var(--spacing) * 2);
}

._projectsList {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 1);
  align-items: flex-start;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));

  // border-radius: 6px;
  // overflow: hidden;
  margin-top: calc(var(--spacing) / 4);

  > * {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    cursor: pointer;
  }

  ::v-deep ._projectInfos {
    min-height: 100%;
  }
}

._title {
  text-align: center;
}

._myProjects {
  background: var(--c-bleumarine_clair);
  padding-top: calc(var(--spacing) / 2);
  padding-bottom: calc(var(--spacing) / 2);
}
</style>
