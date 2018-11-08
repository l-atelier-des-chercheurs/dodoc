<template>
  <div class="m_listview"
  >
    <main>
      <section class="">
        <div class="m_actionbar">
          <div>
            <div class="sectionTitle_small margin-bottom-small">              
              <div class="switch switch-xs switch_twoway">
                <label for="switch-xs">
                  <span class=""> 
                    {{ $t('projects') }}
                  </span>  
                </label>
                <input type="checkbox" id="switch-xs" v-model="show_medias_instead_of_projects">
                <label for="switch-xs">
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
                    <template v-if="$root.allKeywords.length > 0">
                      — 
                      <button type="button" class="button-nostyle text-uc button-triangle"
                        :class="{ 'is--active' : show_filters }"
                        @click="show_filters = !show_filters"
                      >{{ $t('filters') }}</button>
                    </template>
                  </template>
                  <template v-else>
                    {{ $t('showing') }} 
                    {{ Object.keys(sortedMedias).length }} 
                    {{ $t('medias_of') }} 
                    {{ Object.keys(allMedias).length }}
                  </template>

                  <div v-if="!show_medias_instead_of_projects && show_filters" class="bg-blanc border-top margin-vert-verysmall">
                    <div class="flex-wrap">
                      <div v-if="$root.allKeywords.length > 0" class="padding-sides-small">
                        <label>{{ $t('keywords') }}</label>
                        <div class="m_keywordField margin-bottom-none font-large">
                          <button
                            v-for="keyword in $root.allKeywords" 
                            :key="keyword.text"
                            :class="[keyword.classes, { 'is--active' : $root.settings.project_filter.keyword === keyword.text }]"
                            @click="setProjectKeyword(keyword.text)"
                          >
                            {{ keyword.text }}
                          </button>
                        </div>
                      </div>
                      <!-- <div v-if="Object.keys($root.store.authors).length > 0" class="padding-sides-small">
                        <label>{{ $t('author') }}</label>
                        <div class="m_authorField margin-bottom-none">
                          <span
                            type="button"
                            v-for="(author, slug) in $root.store.authors" 
                            :key="author.name" 
                            :class="{ 'is--selected' : author.name === $root.settings.media_filter.authors }"
                          >
                            <img 
                              v-if="!!author.preview"
                              :src="urlToPortrait(slug, author.preview)"
                            />
                            <div class="m_searchsidebar--author--name">{{ author.name }}</div>
                          </span>
                        </div>
                      </div> -->
                    </div>
                  </div>
                </template>
                <template v-else>
                  {{ $t('no_projects_yet') }}
                </template>          
              </div>
            </div>
          
            <template v-if="!show_medias_instead_of_projects">
              <!-- modal -->
              <CreateProject
                v-if="showCreateProjectModal"
                @close="showCreateProjectModal = false"
                :read_only="read_only"
              />
              <button
                class="button-inline bg-rouge"
                @click="showCreateProjectModal = true"
                :disabled="read_only"
                :key="'createButton'"
              >
                <img src="/images/i_add.svg" width="48" height="48" />
                <span class="margin-small">
                  {{ $t('create_a_project') }}
                </span>
              </button>
            </template>

          </div>
        </div>

        <template v-if="!show_medias_instead_of_projects">
          <transition-group 
            v-if="sortedProjectsSlug !== 'has-no-projects'"
            tag="div"
            name="list-complete"
            class="m_projects"
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
        </template>
      </section>
      
    </main>

    <BottomFooter>
    </BottomFooter>
  </div>
</template>
<script>
import BottomFooter from './components/BottomFooter.vue';
import Project from './components/Project.vue';
import CreateProject from './components/modals/CreateProject.vue';
import MediaCard from './components/subcomponents/MediaCard.vue';

// import FolderFilterBar from './components/FolderFilterBar.vue'
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
    // FolderFilterBar,
    BottomFooter,
    MediaCard
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
    if(this.$root.settings.project_filter.keyword !== '') {
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
        this.$root.settings.project_filter.keyword = '';
      }
    }
  },
  computed: {
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

        // if a project keyword filter is set
        if(this.$root.settings.project_filter.keyword !== '') {
          // only add to sorted array if project has this keyword
          if(this.projects[slugProjectName].hasOwnProperty('keywords') && 
          this.projects[slugProjectName].keywords.length > 0 && 
          this.projects[slugProjectName].keywords.filter(k => k.title === this.$root.settings.project_filter.keyword).length > 0) {
            sortable.push({ slugProjectName, orderBy });
          }
        } else {
          sortable.push({ slugProjectName, orderBy });
        }
      }

      // if there is no project in sortable, it is probable that filters 
      // were too restrictive
      if(sortable.length === 0) {
        // lets remove filters if there are any
        this.$nextTick(() => {
          this.$root.settings.project_filter.keyword = '';
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
    sortedMedias: function() {
      let sortedMedias = this.allMedias.filter(m => {
        return this.$root.isShownAfterMediaFilter(m)
      });
      sortedMedias = this.$_.sortBy(sortedMedias, 'date_created');
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
    setProjectKeyword(newKeywordFilter) {
      if(this.$root.settings.project_filter.keyword !== newKeywordFilter) {
        this.$root.settings.project_filter.keyword = newKeywordFilter;
      } else {
        this.$root.settings.project_filter.keyword = ''; 
      }
    },
    urlToPortrait(slug, filename) {
      if(filename === undefined) {
        return '';
      }
      return `/${this.$root.state.authorsFolder}/${slug}/${filename}`;
    },
    setAuthorFilter(author) {
      if(author.name !== this.$root.settings.media_filter.authors) {
        this.$root.setMediaFilter({ authors: author.name });
      } else {
        this.$root.unsetMediaFilter();
      }
    }
  }
};
</script>
<style>

</style>