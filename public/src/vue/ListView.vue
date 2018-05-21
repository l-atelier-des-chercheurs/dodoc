<template>
  <div class="m_listview"
  >
    <main>
      <section class="container">
        <div class="m_listview--topbar">
          <div class="sectionTitle_small ">
            <template v-if="sortedProjectsSlug !== 'has-no-projects'">
              {{ $t('showing') }} {{ sortedProjectsSlug.length }} {{ $t('projects_of') }} {{ Object.keys(projects).length }}
            </template>
            <template v-else>
              {{ $t('no_projects_yet') }}
            </template>          
          </div>

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

        </div>

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
            :currentSort="currentSort"
            :index="index"
          />
        </transition-group>
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
    BottomFooter
  },
  data() {
    return {
      showCreateProjectModal: false,
      currentLang: this.$root.lang.current,

      currentFilter: '',      
      currentSort: {
        field: 'date_created',
        type: 'date',
        order: 'descending'
      },
    };
  },
  mounted() {

  },
  beforeDestroy() {

  },

  watch: {
    currentLang: function() {
      this.$root.updateLocalLang(this.currentLang);
    },
    projects: function() {
      // check if there is a justCreatedFolderID val
      if (this.$root.justCreatedFolderID) {
        Object.keys(this.projects).map(slugProjectName => {
          let folder = this.projects[slugProjectName];
          // if there is, try to match it with folderID
          if (
            folder.id &&
            folder.id === this.$root.justCreatedFolderID
          ) {
            this.$root.justCreatedFolderID = false;
            this.$root.openProject(slugProjectName);
          }
        });
      }
    }
  },
  computed: {
    sortedProjectsSlug: function() {
      if(this.projects.message === 'no-folders') {
        return 'has-no-projects';
      }

      var sortable = [];

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
        sortable.push({ slugProjectName, orderBy });
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
    }
  },
  methods: {
    setSort(newSort) {
      this.currentSort = newSort;
    },
    setFilter(newFilter) {
      this.currentFilter = newFilter;
    },
  }
};
</script>
<style>

</style>