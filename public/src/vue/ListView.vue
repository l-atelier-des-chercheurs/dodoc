<template>
  <div
    class="m_listview"
    :class="{ 'is--folder': !!$root.settings.opened_project_folder }"
  >
    <main class="m_projects">
      <transition name="fade_fast" :duration="150">
        <div
          class="m_listview--openedFolderLabel"
          v-if="!!$root.settings.opened_project_folder"
        >
          <div>
            <button
              class="m_listview--openedFolderLabel--backButton"
              type="button"
              @click="$root.closeFolder()"
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
              @click="$root.settings.opened_project_folder = false"
              >-->
              {{ $root.settings.opened_project_folder }}
              <!-- &nbsp;×
              </button>-->
            </label>
          </div>
        </div>
      </transition>

      <div class="m_actionbar">
        <div>
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
              <label
                for="media_switch"
                class="cursor-pointer"
                :class="{
                  'is--active': !show_medias_instead_of_projects,
                }"
              >
                <span class>{{ $t("projects") }}</span>
              </label>
              <input
                type="checkbox"
                id="media_switch"
                v-model="show_medias_instead_of_projects"
              />
              <label
                for="media_switch"
                :class="{
                  'is--active': show_medias_instead_of_projects,
                }"
              >
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
                        $root.all_authors.length > 0
                      "
                    >
                      —
                      <button
                        type="button"
                        class="button-nostyle text-uc button-triangle"
                        :class="{ 'is--active': show_order }"
                        @click="show_order = !show_order"
                      >
                        {{ $t("in_the_order") }}
                      </button>

                      <div
                        v-if="show_order"
                        class="flex-wrap tiny-width margin-left-none bg-blanc rounded padding-verysmall normal"
                      >
                        <select
                          v-model="currentSort.field"
                          class="select-xs margin-verysmall"
                        >
                          <option
                            v-for="{ field, label } in sort_options"
                            :value="field"
                            :key="field"
                            v-html="$t(label)"
                          />
                        </select>
                        <select
                          v-model="currentSort.order"
                          class="select-xs margin-verysmall"
                        >
                          <option
                            v-for="{ key, label } in sort_orders"
                            :value="key"
                            :key="key"
                            v-html="$t(label)"
                          />
                        </select>
                      </div>
                      —
                      <button
                        type="button"
                        class="button-nostyle text-uc button-triangle"
                        :class="{ 'is--active': show_filters }"
                        @click="show_filters = !show_filters"
                      >
                        {{ $t("filters") }}
                      </button>
                      <button
                        type="button"
                        class="button-nostyle text-uc padding-left-verysmall"
                        v-if="has_filters_enabled"
                        @click="removeAllFilters"
                      >
                        {{ $t("remove_filters") }}
                      </button>
                    </template>
                    <TagsAndAuthorFilters
                      v-if="show_filters"
                      :allKeywords="projectsKeywords"
                      :allAuthors="projectsAuthors"
                      :keywordFilter="$root.settings.project_filter.keyword"
                      :authorFilter="$root.settings.project_filter.author"
                      @setKeywordFilter="
                        (a) => $root.setProjectKeywordFilter(a)
                      "
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
                        style="margin-bottom: -2px"
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
                            :disabled="
                              debounce_search_project_name.length === 0
                            "
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
                      $root.allKeywords.length > 0 ||
                      $root.all_authors.length > 0
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
                    <button
                      type="button"
                      class="button-nostyle text-uc padding-left-verysmall"
                      v-if="has_filters_enabled"
                      @click="removeAllFilters"
                    >
                      {{ $t("remove_filters") }}
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
        <div class="m_displayMyContent" v-if="$root.current_author">
          <span class="font-small">{{ $t("show") }}</span>
          <select v-model="show_only_my_content" class="select-s">
            <option :value="true">
              <template v-if="!show_medias_instead_of_projects">{{
                $t("only_my_projects").toLowerCase()
              }}</template>
              <template v-else>{{
                $t("only_my_medias").toLowerCase()
              }}</template>
            </option>
            <option :value="false">
              <template v-if="!show_medias_instead_of_projects">{{
                $t("all_projects").toLowerCase()
              }}</template>
              <template v-else>{{ $t("all_medias").toLowerCase() }}</template>
            </option>
          </select>
        </div>

        <div v-if="$root.current_author" />
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
                  @click="$root.openFolder(item.name)"
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
                :context="'in_folder'"
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
      sort_options: [
        {
          field: "date_created",
          type: "date",
          label: "created",
        },
        {
          field: "date_modified",
          type: "date",
          label: "edited",
        },
        // {
        //   field: "name",
        //   type: "alph",
        //   label: "name",
        // },
      ],
      sort_orders: [
        {
          key: "descending",
          label: "most_recent_first",
        },
        {
          key: "ascending",
          label: "oldest_first",
        },
      ],

      show_filters: false,
      show_order: false,
      show_search: false,
      selected_medias: [],
      selected_projects: [],

      // show_only_my_content: this.$root.current_author ? true : false,
      show_only_my_content: false,

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
    this.$eventHub.$on("authors.newAuthorSet", this.newAuthorSet);
  },
  beforeDestroy() {
    this.$eventHub.$off("modal.prev_media", this.prevMedia);
    this.$eventHub.$off("modal.next_media", this.nextMedia);
    this.$eventHub.$off("authors.newAuthorSet", this.newAuthorSet);
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
        // this.removeAllFilters();
      }
    },
    debounce_search_project_name: function () {
      if (this.debounce_search_project_name_function)
        clearTimeout(this.debounce_search_project_name_function);
      this.debounce_search_project_name_function = setTimeout(() => {
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
    has_filters_enabled() {
      return (
        this.$root.settings.project_filter.keyword !== "" ||
        this.$root.settings.project_filter.author !== "" ||
        this.$root.settings.project_filter.name !== "" ||
        this.debounce_search_project_name !== "" ||
        this.$root.settings.media_filter.keyword !== "" ||
        this.$root.settings.media_filter.author !== "" ||
        this.$root.settings.media_filter.fav !== false ||
        this.$root.settings.media_filter.type !== ""
      );
    },
    sortedProjects: function () {
      var sortable = [];

      if (!this.projects || Object.keys(this.projects).length === 0) {
        return [];
      }

      for (let project of Object.values(this.projects)) {
        let orderBy;

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
          !!this.$root.settings.opened_project_folder &&
          (!project.hasOwnProperty("folder") ||
            project.folder !== this.$root.settings.opened_project_folder)
        ) {
          continue;
        }

        if (this.show_only_my_content && this.$root.current_author) {
          if (
            !project.hasOwnProperty("authors") ||
            !Array.isArray(project.authors) ||
            !project.authors.some(
              (k) =>
                k.slugFolderName === this.$root.current_author.slugFolderName
            )
          ) {
            continue;
          }
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
            project.keywords.some(
              (k) => k.title === this.$root.settings.project_filter.keyword
            )
          ) {
            if (
              project.hasOwnProperty("authors") &&
              typeof project.authors === "object" &&
              project.authors.some(
                (k) =>
                  k.slugFolderName === this.$root.settings.project_filter.author
              )
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
            project.keywords.some(
              (k) => k.title === this.$root.settings.project_filter.keyword
            )
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
            project.authors.some(
              (k) =>
                k.slugFolderName === this.$root.settings.project_filter.author
            )
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

      // const projects_sorted_by_folder = this.$_.groupBy(
      //   this.sortedProjects,
      //   (p) => {
      //     return !!p.folder ? p.folder : "znot-groupped";
      //   }
      // );

      // get all projects
      // group those with folder, otherwise don’t

      return this.sortedProjects.reduce((acc, p) => {
        if (p.folder && !this.$root.settings.opened_project_folder) {
          if (acc.find((pf) => pf.name === p.folder))
            acc.find((pf) => pf.name === p.folder).content.push(p);
          else
            acc.push({
              type: "folder",
              name: p.folder,
              content: [p],
            });
        } else {
          acc.push({
            type: "project",
            content: p,
          });
        }
        // this.$root.settings.opened_project_folder
        return acc;
      }, []);

      const folders_and_projects = Object.entries(projects_sorted_by_folder)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .reduce((acc, [name, content]) => {
          if (
            !!name &&
            name !== "znot-groupped" &&
            !this.$root.settings.opened_project_folder
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
      let sortedMedias = this.$_.sortBy(this.filteredMedias, "date_uploaded");
      return sortedMedias.reverse();
    },
    groupedMedias: function () {
      let mediaGroup = this.$_.groupBy(this.sortedMedias, (media) => {
        let _date;

        // if (media.hasOwnProperty("date_created") && !!media.date_created) {
        //   _date = media.date_created;
        // } else
        if (media.hasOwnProperty("date_uploaded") && !!media.date_uploaded) {
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
    removeAllFilters() {
      this.$root.settings.project_filter.keyword = "";
      this.$root.settings.project_filter.author = "";
      this.$root.settings.project_filter.name = "";
      this.debounce_search_project_name = "";
      this.$root.settings.media_filter.keyword = "";
      this.$root.settings.media_filter.author = "";
      this.$root.settings.media_filter.fav = false;
      this.$root.settings.media_filter.type = "";
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
    newAuthorSet() {
      if (this.$root.current_author) {
        // this.show_only_my_content = true;
      } else {
        // this.show_only_my_content = false;
      }
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
