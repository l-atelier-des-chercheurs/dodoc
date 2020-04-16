<template>
  <div
    class="m_listview"
    :class="{ 'is--folder': !!$root.settings.opened_folder }"
  >
    <main class="m_projects main_scroll_panel">
      <transition name="fade_fast" :duration="150">
        <div
          class="m_listview--openedFolderLabel"
          v-if="!!$root.settings.opened_folder"
        >
          <div>
            <button
              class="m_listview--openedFolderLabel--backButton"
              type="button"
              @click="$root.settings.opened_folder = false"
            >
              ‹
              <span class>{{ $t("back") }}</span>
            </button>

            <span
              class="m_listview--openedFolderLabel--intitule"
              v-html="$t('folder_currently_open:')"
            />
            <label class="m_listview--openedFolderLabel--folderName">
              <!-- <button
              type="button"
              class="button-nostyle"
              @click="$root.settings.opened_folder = false"
              >-->
              {{ $root.settings.opened_folder }}
              <!-- &nbsp;×
              </button>-->
            </label>
          </div>
        </div>
      </transition>

      <div class="m_actionbar">
        <div class="m_actionbar--buttonBar">
          <button
            class="barButton barButton_createProject"
            @click="showCreateProjectModal = true"
            :disabled="read_only"
            :key="'createButton'"
          >
            <span>{{ $t("create_a_project") }}</span>
          </button>
          <CreateProject
            v-if="showCreateProjectModal"
            @close="showCreateProjectModal = false"
            :read_only="read_only"
          />
        </div>

        <div class="m_actionbar--text">
          <div class="switch switch-xs switch_twoway">
            <label for="media_switch" class="cursor-pointer">
              <span class>{{ $t("projects") }}</span>
            </label>
            <input
              type="checkbox"
              id="media_switch"
              v-model="show_medias_instead_of_projects"
            />
            <label for="media_switch">
              <span class>{{ $t("medias") }}</span>
            </label>
          </div>

          <div>
            <template v-if="Object.keys(projects).length > 0">
              <template v-if="!show_medias_instead_of_projects">
                <div>
                  {{ $t("showing") }}
                  <span
                    :class="{
                      'c-rouge':
                        Object.keys(sortedProjects).length !==
                        Object.keys(projects).length,
                    }"
                  >
                    {{ sortedProjects.length }}
                    <template
                      v-if="
                        sortedProjects.length === Object.keys(projects).length
                      "
                      >{{ $t("projects") }}</template
                    >
                    <template v-else>
                      {{ $t("projects_of") }}
                      {{ Object.keys(projects).length }}
                    </template>
                  </span>
                  <template
                    v-if="
                      $root.allKeywords.length > 0 ||
                      $root.allAuthors.length > 0
                    "
                  >
                    —
                    <button
                      type="button"
                      class="button-nostyle text-uc button-triangle"
                      :class="{ 'is--active': show_filters }"
                      @click="show_filters = !show_filters"
                    >
                      {{ $t("filters") }}
                    </button>
                  </template>
                  <TagsAndAuthorFilters
                    v-if="show_filters"
                    :allKeywords="projectsKeywords"
                    :allAuthors="projectsAuthors"
                    :keywordFilter="$root.settings.project_filter.keyword"
                    :authorFilter="$root.settings.project_filter.author"
                    @setKeywordFilter="(a) => $root.setProjectKeywordFilter(a)"
                    @setAuthorFilter="(a) => $root.setProjectAuthorFilter(a)"
                  />
                </div>
                <div class="m_searchProject">
                  <button
                    type="button"
                    class="button-nostyle text-uc button-triangle"
                    :class="{
                      'is--active':
                        show_search ||
                        $root.settings.project_filter.name.length > 0,
                    }"
                    @click="show_search = !show_search"
                  >
                    <svg
                      class="inline-svg"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      x="0px"
                      y="0px"
                      width="96.2px"
                      height="96.2px"
                      viewBox="0 0 96.2 96.2"
                      style="margin-bottom: -2px;"
                      xml:space="preserve"
                    >
                      <path
                        fill="currentColor"
                        class="st0"
                        d="M10.3,59.9c11.7,11.7,29.5,13.4,43,5.2l9.7,9.7l21.3,21.3l11.9-11.9L74.9,63l-9.7-9.7c8.2-13.5,6.4-31.3-5.2-43 C46.2-3.4,24-3.4,10.3,10.3C-3.4,24-3.4,46.2,10.3,59.9z M50.8,19.5c8.6,8.6,8.6,22.6,0,31.3c-8.6,8.6-22.6,8.6-31.3,0 c-8.6-8.6-8.6-22.6,0-31.3C28.1,10.8,42.1,10.8,50.8,19.5z"
                      />
                    </svg>
                    {{ $t("search") }}
                  </button>

                  <div
                    v-if="
                      show_search || debounce_search_project_name.length > 0
                    "
                    class="rounded"
                  >
                    <div>{{ $t("project_name_to_find") }}</div>

                    <div class="input-group">
                      <input
                        type="text"
                        class
                        v-model="debounce_search_project_name"
                      />
                      <span
                        class="input-addon"
                        v-if="debounce_search_project_name.length > 0"
                      >
                        <button
                          type="button"
                          :disabled="debounce_search_project_name.length === 0"
                          @click="debounce_search_project_name = ''"
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                {{ $t("showing") }}
                <span
                  :class="{
                    'c-rouge':
                      Object.keys(sortedMedias).length !==
                      Object.keys(allMedias).length,
                  }"
                >
                  {{ Object.keys(sortedMedias).length }}
                  {{ $t("medias_of") }}
                  {{ Object.keys(allMedias).length }}
                </span>
                <template
                  v-if="
                    $root.allKeywords.length > 0 || $root.allAuthors.length > 0
                  "
                >
                  —
                  <button
                    type="button"
                    class="button-nostyle text-uc button-triangle"
                    :class="{ 'is--active': show_filters }"
                    @click="show_filters = !show_filters"
                  >
                    {{ $t("filters") }}
                  </button>
                </template>
                <TagsAndAuthorFilters
                  v-if="show_filters"
                  :allKeywords="mediasKeywords"
                  :allAuthors="mediasAuthors"
                  :allTypes="mediaTypes"
                  :keywordFilter="$root.settings.media_filter.keyword"
                  :authorFilter="$root.settings.media_filter.author"
                  :favFilter="$root.settings.media_filter.fav"
                  @setKeywordFilter="(a) => $root.setMediaKeywordFilter(a)"
                  @setAuthorFilter="(a) => $root.setMediaAuthorFilter(a)"
                  @setFavFilter="(a) => $root.setFavFilter(a)"
                  @setTypeFilter="(a) => $root.setTypeFilter(a)"
                />
              </template>
            </template>
            <template v-else>{{ $t("no_projects_yet") }}</template>
          </div>
        </div>
      </div>

      <transition-group
        v-if="!show_medias_instead_of_projects"
        class="m_projects--list"
        name="list-complete"
        :duration="800"
      >
        <template v-for="item in sortedFoldersAndProjects">
          <div v-if="item.type === 'folder'" class="m_folder" :key="item.name">
            <div class="m_folder--topbar">
              <label>
                <button
                  type="button"
                  class="button-nostyle"
                  @click="toggleAllInFolder({ $event, folder_name: item.name })"
                >
                  {{ item.name }} ({{ item.content.length }})
                  <label
                    :for="item.name + '_selector'"
                    class="input-selector"
                    @click.stop
                  >
                    <input
                      :id="item.name + '_selector'"
                      type="checkbox"
                      :checked="allProjectFromThatFolderAreSelected(item.name)"
                      @change="
                        toggleAllInFolder({ $event, folder_name: item.name })
                      "
                    />
                  </label>
                </button>
              </label>

              <label>
                <button
                  type="button"
                  class="button-nostyle"
                  @click="toggleFolder(item.name)"
                >
                  {{ $t("open") }}
                </button>
              </label>
              <!-- v-if="(is_hovered || is_selected)" -->
            </div>

            <div class="m_folder--projects">
              <Project
                class="is--collapsed"
                v-for="project in item.content"
                :key="project.slugFolderName"
                :project="project"
                :read_only="read_only"
                :is_selected="projectIsSelected(project.slugFolderName)"
                @toggleSelect="toggleSelectProject(project.slugFolderName)"
              />
            </div>
          </div>

          <Project
            v-else-if="item.type === 'project'"
            :key="item.content.slugFolderName"
            :project="item.content"
            :read_only="read_only"
            :is_selected="projectIsSelected(item.content.slugFolderName)"
            @toggleSelect="toggleSelectProject(item.content.slugFolderName)"
          />
        </template>
      </transition-group>
      <transition-group
        v-else-if="show_medias_instead_of_projects && !is_loading_all_medias"
        class="m_allmedias--list mini_scroll_panel"
        name="list-complete"
      >
        <div v-for="item in groupedMedias" :key="item[0]">
          <h3
            class="font-folder_title margin-sides-small margin-none margin-bottom-small"
          >
            {{ $root.formatDateToHuman(item[0]) }}
          </h3>

          <div class="m_mediaShowAll">
            <div v-for="media in item[1]" :key="media.slugMediaName">
              <MediaCard
                :key="media.slugMediaName"
                :media="media"
                :metaFileName="media.metaFileName"
                :slugProjectName="media.slugProjectName"
                :preview_size="180"
                :is_selected="
                  mediaIsSelected({
                    slugFolderName: media.slugProjectName,
                    metaFileName: media.metaFileName,
                  })
                "
                @toggleSelect="
                  toggleSelectMedia({
                    slugFolderName: media.slugProjectName,
                    metaFileName: media.metaFileName,
                  })
                "
              ></MediaCard>
            </div>
          </div>
        </div>
      </transition-group>

      <transition name="fade_fast" :duration="400">
        <SelectorBar
          v-if="selected_medias.length > 0 || selected_projects.length > 0"
          :selected_medias="selected_medias"
          :selected_projects="selected_projects"
          @deselect="
            selected_projects = [];
            selected_medias = [];
          "
        />
      </transition>
    </main>
  </div>
</template>
<script>
import BottomFooter from "./components/BottomFooter.vue";
import Project from "./components/Project.vue";
import CreateProject from "./components/modals/CreateProject.vue";
import MediaCard from "./components/subcomponents/MediaCard.vue";
import TagsAndAuthorFilters from "./components/subcomponents/TagsAndAuthorFilters.vue";
import SelectorBar from "./components/subcomponents/SelectorBar.vue";
import { setTimeout } from "timers";
import debounce from "debounce";

export default {
  props: {
    presentationMD: Object,
    read_only: Boolean,
    projects: Object,
  },
  components: {
    CreateProject,
    Project,
    BottomFooter,
    MediaCard,
    SelectorBar,
    TagsAndAuthorFilters,
  },
  data() {
    return {
      showCreateProjectModal: false,
      currentLang: this.$root.lang.current,

      show_medias_instead_of_projects: false,
      is_loading_all_medias: false,

      currentSort: {
        field: "date_created",
        type: "date",
        order: "descending",
      },

      show_filters: false,
      show_search: false,
      selected_medias: [],
      selected_projects: [],

      debounce_search_project_name: this.$root.settings.project_filter.name,
      debounce_search_project_name_function: undefined,
    };
  },
  mounted() {
    if (
      !!this.$root.settings.project_filter.keyword ||
      !!this.$root.settings.project_filter.author
    ) {
      this.show_filters = true;
    }
    this.$eventHub.$on("modal.prev_media", this.prevMedia);
    this.$eventHub.$on("modal.next_media", this.nextMedia);
  },
  beforeDestroy() {
    this.$eventHub.$off("modal.prev_media", this.prevMedia);
    this.$eventHub.$off("modal.next_media", this.nextMedia);
  },
  watch: {
    currentLang: function () {
      this.$root.updateLocalLang(this.currentLang);
    },
    show_medias_instead_of_projects: function () {
      // load all projects’ medias if it isn’t there
      if (this.show_medias_instead_of_projects) {
        this.$root.loadAllProjectsMedias();

        this.is_loading_all_medias = true;

        this.$eventHub.$once("socketio.has_finished_loading_all_medias", () => {
          this.is_loading_all_medias = false;
        });
      } else {
        this.show_filters = false;
      }

      this.selected_projects = [];
      this.selected_medias = [];
    },
    show_filters: function () {
      if (!this.show_filters) {
        this.$root.settings.project_filter.keyword = "";
        this.$root.settings.project_filter.author = "";
        this.$root.settings.project_filter.name = "";
        this.debounce_search_project_name = "";
        this.$root.settings.media_filter.keyword = "";
        this.$root.settings.media_filter.author = "";
        this.$root.settings.media_filter.fav = false;
        this.$root.settings.media_filter.type = false;
      }
    },
    debounce_search_project_name: function () {
      if (this.debounce_tweet_filter_function)
        clearTimeout(this.debounce_tweet_filter_function);
      this.debounce_tweet_filter_function = setTimeout(() => {
        this.$root.settings.project_filter.name = this.debounce_search_project_name;
      }, 340);
    },
  },
  computed: {
    projectsKeywords: function () {
      return this.$root.getAllKeywordsFrom(this.projects);
    },
    projectsAuthors: function () {
      return this.$root.getAllAuthorsFrom(this.projects);
    },
    mediasKeywords: function () {
      return this.$root.getAllKeywordsFrom(this.filteredMedias);
    },
    mediasAuthors: function () {
      return this.$root.getAllAuthorsFrom(this.filteredMedias);
    },
    mediaTypes() {
      return this.$root.getAllTypesFrom(this.filteredMedias);
    },
    sortedProjects: function () {
      var sortable = [];

      if (!this.projects || Object.keys(this.projects).length === 0) {
        return [];
      }

      for (let slugProjectName in this.projects) {
        let orderBy;
        const project = this.projects[slugProjectName];

        if (this.currentSort.type === "date") {
          orderBy = +this.$moment(
            project[this.currentSort.field],
            "YYYY-MM-DD HH:mm:ss"
          );
        } else if (this.currentSort.type === "alph") {
          orderBy = project[this.currentSort.field];
        }

        if (this.$root.settings.project_filter.name !== "") {
          if (
            !project.name
              .toLowerCase()
              .includes(this.$root.settings.project_filter.name.toLowerCase())
          )
            continue;
        }

        // if folder is opened and project is not part of it
        if (
          !!this.$root.settings.opened_folder &&
          (!project.hasOwnProperty("folder") ||
            project.folder !== this.$root.settings.opened_folder)
        ) {
          continue;
        }

        if (
          !this.$root.settings.project_filter.keyword &&
          !this.$root.settings.project_filter.author
        ) {
          sortable.push({ project, orderBy });
          continue;
        }

        if (
          !!this.$root.settings.project_filter.keyword &&
          !!this.$root.settings.project_filter.author
        ) {
          // only add to sorted array if project has this keyword
          if (
            project.hasOwnProperty("keywords") &&
            typeof project.keywords === "object" &&
            project.keywords.filter(
              (k) => k.title === this.$root.settings.project_filter.keyword
            ).length > 0
          ) {
            if (
              project.hasOwnProperty("authors") &&
              typeof project.authors === "object" &&
              project.authors.filter(
                (k) =>
                  k.slugFolderName === this.$root.settings.project_filter.author
              ).length > 0
            ) {
              sortable.push({ project, orderBy });
            }
          }
          continue;
        }
        // if a project keyword filter is set
        if (!!this.$root.settings.project_filter.keyword) {
          // only add to sorted array if project has this keyword
          if (
            project.hasOwnProperty("keywords") &&
            typeof project.keywords === "object" &&
            project.keywords.filter(
              (k) => k.title === this.$root.settings.project_filter.keyword
            ).length > 0
          ) {
            sortable.push({ project, orderBy });
          }
          continue;
        }

        if (!!this.$root.settings.project_filter.author) {
          // only add to sorted array if project has this keyword
          if (
            project.hasOwnProperty("authors") &&
            typeof project.authors === "object" &&
            project.authors.filter(
              (k) =>
                k.slugFolderName === this.$root.settings.project_filter.author
            ).length > 0
          ) {
            sortable.push({ project, orderBy });
          }
          continue;
        }
      }

      // if there is no project in sortable, it is probable that filters
      // were too restrictive
      if (sortable.length === 0) {
        // lets remove filters if there are any
        this.$nextTick(() => {
          // this.$root.settings.project_filter.keyword = false;
        });
      }

      let sortedProjects = sortable.sort(function (a, b) {
        let valA = a.orderBy;
        let valB = b.orderBy;
        if (typeof a.orderBy === "string" && typeof b.orderBy === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      });

      if (this.currentSort.order === "descending") {
        sortedProjects.reverse();
      }
      sortedProjects = sortedProjects.map((sp) => sp.project);
      return sortedProjects;
    },
    sortedFoldersAndProjects: function () {
      //  [
      //     {
      //       type: "folder",
      //       name: "Mon dossier",
      //       content: [
      //         { slugFolderName: "plop", name: "Plop" },
      //         { slugFolderName: "plip", name: "Plip" }
      //       ]
      //     },
      //     {
      //       type: "project",
      //       content: { slugFolderName: "plop", name: "Plop" }
      //     }
      //   ];

      // const get_all_folders = this.sortedProjects.reduce((acc, p) => {
      //   if (!!p.folder && !acc.includes(p.folder)) {
      //     acc.push(p.folder);
      //   }
      //   return acc;
      // }, []);

      const projects_sorted_by_folder = this.$_.groupBy(
        this.sortedProjects,
        (p) => {
          return !!p.folder ? p.folder : "znot-groupped";
        }
      );

      if (projects_sorted_by_folder.length === 0) {
        return [];
      }

      const folders_and_projects = Object.entries(projects_sorted_by_folder)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .reduce((acc, [name, content]) => {
          if (
            !!name &&
            name !== "znot-groupped" &&
            !this.$root.settings.opened_folder
          ) {
            acc.push({
              type: "folder",
              name,
              content,
            });
          } else {
            content = content.map((p) => {
              acc.push({
                type: "project",
                content: p,
              });
            });
          }

          return acc;
        }, []);

      return folders_and_projects;
    },
    presentationText: function () {
      if (this.presentationMD.hasOwnProperty(this.currentLang)) {
        return this.presentationMD[this.currentLang];
      } else if (this.presentationMD.hasOwnProperty("content")) {
        return this.presentationMD["content"];
      }
      return this.presentationMD;
    },
    allMedias: function () {
      const allMedias = this.sortedProjects.reduce((acc, project) => {
        if (!project.hasOwnProperty("medias")) {
          return acc;
        }
        Object.values(project.medias).map((media) => {
          media.slugProjectName = project.slugFolderName;
          acc.push(media);
        });

        return acc;
      }, []);
      return allMedias;
    },
    filteredMedias: function () {
      return this.allMedias.filter((m) => this.$root.filterMedia(m));
    },
    sortedMedias: function () {
      let sortedMedias = this.$_.sortBy(this.filteredMedias, "date_created");
      return sortedMedias.reverse();
    },
    groupedMedias: function () {
      let mediaGroup = this.$_.groupBy(this.sortedMedias, (media) => {
        let _date;

        if (media.hasOwnProperty("date_created") && !!media.date_created) {
          _date = media.date_created;
        } else if (
          media.hasOwnProperty("date_uploaded") &&
          !!media.date_uploaded
        ) {
          _date = media.date_uploaded;
        } else {
          return this.$t("invalid_date");
        }

        var dateMoment = this.$moment(_date);
        return dateMoment.format("YYYY-MM-DD");
      });
      mediaGroup = this.$_.pairs(mediaGroup);
      mediaGroup = this.$_.sortBy(mediaGroup);
      mediaGroup = mediaGroup.reverse();
      return mediaGroup;
    },
  },
  methods: {
    setSort(newSort) {
      this.currentSort = newSort;
    },

    toggleSelectMedia({ slugFolderName, metaFileName }) {
      if (this.mediaIsSelected({ slugFolderName, metaFileName })) {
        this.selected_medias = this.selected_medias.filter(
          (m) =>
            !(
              m.slugFolderName === slugFolderName &&
              m.metaFileName === metaFileName
            )
        );
      } else {
        this.selected_medias.push({
          slugFolderName,
          metaFileName,
        });
      }
    },
    mediaIsSelected({ slugFolderName, metaFileName }) {
      return this.selected_medias.some(
        (m) =>
          m.metaFileName === metaFileName && m.slugFolderName === slugFolderName
      );
    },

    toggleAllInFolder({ $event, folder_name }) {
      const folder = this.sortedFoldersAndProjects.find(
        (fp) => fp.type === "folder" && fp.name === folder_name
      );

      if (
        !folder ||
        !folder.hasOwnProperty("content") ||
        folder.content.length === 0
      )
        return false;

      // check si les projets sont tous select
      if (
        folder.content.some((p) => !this.projectIsSelected(p.slugFolderName))
      ) {
        // si non, on les select tous
        folder.content.map((p) => this.selectProject(p.slugFolderName));
      } else {
        // si oui, on les unselect
        folder.content.map((p) => this.unselectProject(p.slugFolderName));
      }

      // this.$nextTick(() => {
      //   $event.target.checked = false;
      // });
    },

    toggleSelectProject(slugFolderName) {
      if (!this.projectIsSelected(slugFolderName)) {
        this.selectProject(slugFolderName);
      } else {
        this.unselectProject(slugFolderName);
      }
    },
    allProjectFromThatFolderAreSelected(folder_name) {
      const folder = this.sortedFoldersAndProjects.find(
        (fp) => fp.type === "folder" && fp.name === folder_name
      );

      if (
        !folder ||
        !folder.hasOwnProperty("content") ||
        folder.content.length === 0
      )
        return false;

      return !folder.content.some(
        (p) => this.projectIsSelected(p.slugFolderName) === false
      );
    },

    selectProject(slugFolderName) {
      if (
        !this.$root.canEditFolder({
          type: "projects",
          slugFolderName,
        })
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications["enter_password_to_select"]'));
        return false;
      }

      if (!this.projectIsSelected(slugFolderName)) {
        this.selected_projects.push({
          slugFolderName,
        });
      }
    },
    unselectProject(slugFolderName) {
      this.selected_projects = this.selected_projects.filter(
        (m) => !(m.slugFolderName === slugFolderName)
      );
    },

    projectIsSelected(slugFolderName) {
      return this.selected_projects.some(
        (m) => m.slugFolderName === slugFolderName
      );
    },

    toggleFolder(folder_name) {
      if (this.$root.settings.opened_folder === folder_name)
        this.$root.settings.opened_folder = false;
      else this.$root.settings.opened_folder = folder_name;
    },

    urlToPortrait(slug, filename) {
      if (filename === undefined) {
        return "";
      }
      return `/${this.$root.state.authorsFolder}/${slug}/${filename}`;
    },
    prevMedia() {
      this.mediaNav(-1);
    },
    nextMedia() {
      this.mediaNav(+1);
    },
    mediaNav(relative_index) {
      // make sur we are on that list
      if (this.$root.do_navigation.view !== "ListView") {
        return;
      }

      const current_media_index = this.sortedMedias.findIndex(
        (m) => m.metaFileName === this.$root.media_modal.current_metaFileName
      );
      const new_media = this.sortedMedias[current_media_index + relative_index];
      this.$root.closeMedia();

      if (!!new_media) {
        this.$nextTick(() => {
          this.$root.openMedia({
            slugProjectName: new_media.slugProjectName,
            metaFileName: new_media.metaFileName,
          });
        });
      }
    },
  },
};
</script>
<style lang="scss"></style>
