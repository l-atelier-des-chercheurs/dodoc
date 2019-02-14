<template>
  <div class="m_listview"
  >
    <main class="m_projects main_scroll_panel">
      <div class="m_actionbar">
        <div class="m_actionbar--buttonBar">
          <button
            class="barButton barButton_createProject"
            @click="showCreateProjectModal = true"
            :disabled="read_only"
            :key="'createButton'"
          >
            <span>
              {{ $t('create_a_project') }}
            </span>
          </button>
          <CreateProject
            v-if="showCreateProjectModal"
            @close="showCreateProjectModal = false"
            :read_only="read_only"
          />
        </div>

        <div class="m_actionbar--text">
          <div class="switch switch-xs switch_twoway">
            <label for="switch-xs">
              <span class=""> 
                {{ $t('projects') }}
              </span>  
            </label>
            <input type="checkbox" id="media_switch" v-model="show_medias_instead_of_projects">
            <label for="media_switch">
              <span class=""> 
                {{ $t('medias') }}
              </span>  
            </label>
          </div>
          <div>
            <template v-if="Object.keys(projects).length > 0">
              <template v-if="!show_medias_instead_of_projects">
                {{ $t('showing') }} 
                <span :class="{ 'c-rouge' : Object.keys(sortedProjectsSlug).length !== Object.keys(projects).length }">
                  {{ sortedProjectsSlug.length }} 
                  {{ $t('projects_of') }} 
                  {{ Object.keys(projects).length }}
                </span>
                <template v-if="$root.allKeywords.length > 0 || $root.allAuthors.length > 0">
                  — 
                  <button type="button" class="button-nostyle text-uc button-triangle"
                    :class="{ 'is--active' : show_filters }"
                    @click="show_filters = !show_filters"
                  >{{ $t('filters') }}</button>
                </template>
                <TagsAndAuthorFilters
                  v-if="show_filters"
                  :allKeywords="projectsKeywords"
                  :allAuthors="projectsAuthors"
                  :keywordFilter="$root.settings.project_filter.keyword"
                  :authorFilter="$root.settings.project_filter.author"
                  @setKeywordFilter="a => $root.setProjectKeywordFilter(a)"
                  @setAuthorFilter="a => $root.setProjectAuthorFilter(a)"
                />
              </template>
              <template v-else>
                {{ $t('showing') }} 
                <span :class="{ 'c-rouge' : Object.keys(sortedMedias).length !== Object.keys(allMedias).length }">
                  {{ Object.keys(sortedMedias).length }} 
                  {{ $t('medias_of') }} 
                  {{ Object.keys(allMedias).length }}
                </span>
                <template v-if="$root.allKeywords.length > 0 || $root.allAuthors.length > 0">
                  — 
                  <button type="button" class="button-nostyle text-uc button-triangle"
                    :class="{ 'is--active' : show_filters }"
                    @click="show_filters = !show_filters"
                  >{{ $t('filters') }}</button>
                </template>

                <TagsAndAuthorFilters
                  v-if="show_filters"
                  :allKeywords="mediasKeywords"
                  :allAuthors="mediasAuthors"
                  :keywordFilter="$root.settings.media_filter.keyword"
                  :authorFilter="$root.settings.media_filter.author"
                  :favFilter="$root.settings.media_filter.fav"
                  @setKeywordFilter="a => $root.setMediaKeywordFilter(a)"
                  @setAuthorFilter="a => $root.setMediaAuthorFilter(a)"
                  @setFavFilter="a => $root.setFavAuthorFilter(a)"
                />

              </template>

            </template>
            <template v-else>
              {{ $t('no_projects_yet') }}
            </template>          
          </div>
        </div>
      </div>
        
      <template v-if="!show_medias_instead_of_projects">
        <transition-group
          class="m_projects--list"
          name="list-complete"
        >
          <Project
            v-for="(sortedProject, index) in sortedProjectsSlug"
            :key="sortedProject.slugProjectName"
            :slugProjectName="sortedProject.slugProjectName"
            :project="projects[sortedProject.slugProjectName]"
            :read_only="read_only"
            :index="index"
          />
        </transition-group>
      </template>
      <template v-else>
        <transition-group
          class="m_projects--list mini_scroll_panel"
          name="list-complete"
        >
          <div v-for="item in groupedMedias" :key="item[0]">
            <h3 class="font-folder_title margin-sides-small margin-none margin-bottom-small">
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
                >
                </MediaCard>
              </div>
            </div>
          </div>
        </transition-group>
      </template>
    </main>

  </div>
</template>
<script>
import BottomFooter from './components/BottomFooter.vue';
import Project from './components/Project.vue';
import CreateProject from './components/modals/CreateProject.vue';
import MediaCard from './components/subcomponents/MediaCard.vue';
import TagsAndAuthorFilters from './components/subcomponents/TagsAndAuthorFilters.vue';
import { setTimeout } from 'timers';

export default {
  props: {
    presentationMD: Object,
    read_only: Boolean,
    projects: Object
  },
  components: {
    CreateProject,
    Project,
    BottomFooter,
    MediaCard,
    TagsAndAuthorFilters
  },
  data() {
    return {
      showCreateProjectModal: false,
      currentLang: this.$root.lang.current,
      show_medias_instead_of_projects: false,

      currentFilter: '',      
      currentSort: {
        field: 'date_created',
        type: 'date',
        order: 'descending'
      },

      show_filters: false
    };
  },
  mounted() {
    if(this.$root.settings.project_filter.keyword || this.$root.settings.project_filter.author) {
      this.show_filters = true;
    }
  },
  beforeDestroy() {
  },
  watch: {
    currentLang: function() {
      this.$root.updateLocalLang(this.currentLang);
    },
    show_medias_instead_of_projects: function() {
      // load all projects’ medias if it isn’t there
      if(this.show_medias_instead_of_projects) {
        this.$root.loadAllProjectsMedias();
      }
    },
    show_filters: function() {
      if(!this.show_filters) {
        this.$root.settings.project_filter.keyword = false;
        this.$root.settings.project_filter.author = false;
      }
    }
  },
  computed: {
    projectsKeywords: function() {
      return this.$root.getAllKeywordsFrom(this.projects);
    },
    projectsAuthors: function() {
      return this.$root.getAllAuthorsFrom(this.projects);      
    },
    mediasKeywords: function() {
      return this.$root.getAllKeywordsFrom(this.filteredMedias);      
    },
    mediasAuthors: function() {
      return this.$root.getAllAuthorsFrom(this.filteredMedias);      
    },
    sortedProjectsSlug: function() {
      var sortable = [];

      if(!this.projects || this.projects.length === 0) {
        return [];
      }

      for (let slugProjectName in this.projects) {
        let orderBy;

        if (this.currentSort.type === 'date') {
          orderBy = +this.$moment(
            this.projects[slugProjectName][this.currentSort.field],
            'YYYY-MM-DD HH:mm:ss'
          );
        } else if (this.currentSort.type === 'alph') {
          orderBy = this.projects[slugProjectName][this.currentSort.field];
        }

        if(this.$root.settings.project_filter.keyword === false && this.$root.settings.project_filter.author === false) {
          sortable.push({ slugProjectName, orderBy });
          continue;
        }

        if(this.$root.settings.project_filter.keyword !== false && this.$root.settings.project_filter.author !== false) {
          // only add to sorted array if project has this keyword
          if(this.projects[slugProjectName].hasOwnProperty('keywords') 
            && typeof this.projects[slugProjectName].keywords === 'object' 
            && this.projects[slugProjectName].keywords.filter(k => k.title === this.$root.settings.project_filter.keyword).length > 0) {
            
            if(this.projects[slugProjectName].hasOwnProperty('authors') 
              && typeof this.projects[slugProjectName].authors === 'object' 
              && this.projects[slugProjectName].authors.filter(k => k.name === this.$root.settings.project_filter.author).length > 0) {
            
              sortable.push({ slugProjectName, orderBy });
            }
          }
          continue;
        }
        // if a project keyword filter is set
        if(this.$root.settings.project_filter.keyword !== false) {
          // only add to sorted array if project has this keyword
          if(this.projects[slugProjectName].hasOwnProperty('keywords') 
            && typeof this.projects[slugProjectName].keywords === 'object' 
            && this.projects[slugProjectName].keywords.filter(k => k.title === this.$root.settings.project_filter.keyword).length > 0) {
            sortable.push({ slugProjectName, orderBy });
          }
          continue;
        }

        if(this.$root.settings.project_filter.author !== false) {
          // only add to sorted array if project has this keyword
          if(this.projects[slugProjectName].hasOwnProperty('authors') 
            && typeof this.projects[slugProjectName].authors === 'object' 
            && this.projects[slugProjectName].authors.filter(k => k.name === this.$root.settings.project_filter.author).length > 0) {
            sortable.push({ slugProjectName, orderBy });
          }
          continue;
        }

      }

      // if there is no project in sortable, it is probable that filters 
      // were too restrictive
      if(sortable.length === 0) {
        // lets remove filters if there are any
        this.$nextTick(() => {
          // this.$root.settings.project_filter.keyword = false;
        });
      }

      let sortedSortable = sortable.sort(function(a, b) {
        let valA = a.orderBy;
        let valB = b.orderBy;
        if (typeof a.orderBy === 'string' && typeof b.orderBy === 'string') {
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

      if (this.currentSort.order === 'descending') {
        sortedSortable.reverse();
      }

      return sortedSortable;
    },
    presentationText: function() {
      if (this.presentationMD.hasOwnProperty(this.currentLang)) {
        return this.presentationMD[this.currentLang];
      } else if (this.presentationMD.hasOwnProperty('content')) {
        return this.presentationMD['content'];
      }
      return this.presentationMD;
    },
    allMedias: function() {
      let allMedias = [];
      if(this.projects === undefined || Object.keys(this.projects).length === 0) {
        return [];
      }
      Object.keys(this.projects).map(slugProjectName => {
        const folder = this.projects[slugProjectName];
        if(!folder.hasOwnProperty('medias')) {
          return;
        }
        const folder_medias = folder.medias;

        Object.keys(folder_medias).map(slugMediaName => {
          let media = JSON.parse(JSON.stringify(folder_medias[slugMediaName]));
          media.slugProjectName = slugProjectName;
          allMedias.push(media);
        });
      });
      return allMedias;
    },
    filteredMedias: function() {
      return this.allMedias.filter(m => this.$root.isMediaShown(m));
    },
    sortedMedias: function() {
      let sortedMedias = this.$_.sortBy(this.filteredMedias, 'date_created');
      return sortedMedias.reverse();
    },
    groupedMedias: function() {
      let mediaGroup = this.$_.groupBy(this.sortedMedias, (media) => {
          if(media.hasOwnProperty('date_created')) {
            var dateMoment = this.$moment(media.date_created);
            return dateMoment.format('YYYY-MM-DD');
          }
        });
      mediaGroup = this.$_.pairs(mediaGroup); 
      mediaGroup = this.$_.sortBy(mediaGroup);
      mediaGroup = mediaGroup.reverse();
      return mediaGroup;  
    }
  },
  methods: {
    setSort(newSort) {
      this.currentSort = newSort;
    },
    setFilter(newFilter) {
      this.currentFilter = newFilter;
    },
    urlToPortrait(slug, filename) {
      if(filename === undefined) {
        return '';
      }
      return `/${this.$root.state.authorsFolder}/${slug}/${filename}`;
    }
  }
};
</script>
<style>

</style>