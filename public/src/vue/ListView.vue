<template>
  <div class="m_listview">
    <main>
      <section class="container container_scroll padding-vert-medium">
        <template
          v-if="sortedFoldersSlug !== 'no-folders'"
        >
          <div class="padding-bottom-medium text-cap c-gris font-verysmall">
            Affichage de {{ sortedFoldersSlug.length }} projets sur {{ Object.keys(folders).length }}
          </div>

          <transition-group 
          tag="div"
          name="list-complete"
          class="m_folders"
          >
            <template        
              v-for="(sortedFolder, index) in sortedFoldersSlug"
            > 
              <Folder
                :key="sortedFolder.slugFolderName"
                :slugFolderName="sortedFolder.slugFolderName"
                :folder="folders[sortedFolder.slugFolderName]"
                :read_only="read_only"
                :currentSort="currentSort"
                :index="index"
              >
              </Folder>
            </template>
          </transition-group>
        </template>
      </section>

      <!-- modal -->
      <CreateFolder
        v-if="showCreateFolderModal"
        @close="showCreateFolderModal = false"
        :read_only="read_only"
      >
      </CreateFolder>

      <button
        class="button-inline bg-rouge createButton"
        @click="showCreateFolderModal = true"
        :disabled="read_only"
        :key="'createButton'"
      >
        <img src="/images/i_add.svg" width="48" height="48" />
        <span class="margin-small">
          {{ $t('create_a_folder') }}
        </span>
      </button>
      
    </main>

    <BottomFooter>
    </BottomFooter>
  </div>
</template>
<script>
import BottomFooter from './components/BottomFooter.vue';
import Folder from './components/Folder.vue';
import CreateFolder from './components/modals/CreateFolder.vue';
import VueMarkdown from 'vue-markdown';
import FolderFilterBar from './components/FolderFilterBar.vue'

export default {
  props: {
    presentationMD: Object,
    read_only: Boolean,
    folders: Object
  },
  components: {
    CreateFolder,
    Folder,
    FolderFilterBar,
    VueMarkdown,
    BottomFooter
  },
  data() {
    return {
      showCreateFolderModal: false,
      currentLang: this.$root.lang.current,

      currentFilter: '',      
      currentSort: {
        field: 'date_created',
        type: 'date',
        order: 'descending'
      }
    };
  },
  watch: {
    currentLang: function() {
      this.$root.updateLocalLang(this.currentLang);
    },
    folders: function() {
      // check if there is a justCreatedFolderID val

      if (this.$root.justCreatedFolderID) {
        Object.keys(this.folders).map(slugFolderName => {
          let folder = this.folders[slugFolderName];
          // if there is, try to match it with folderID
          if (
            folder.folderID &&
            folder.folderID === this.$root.justCreatedFolderID
          ) {
            this.$root.justCreatedFolderID = false;
            this.$root.openFolder(slugFolderName);
          }
        });
      }
    }
  },
  computed: {
    sortedFoldersSlug: function() {
      if(this.folders.message === 'no-folders') {
        return 'has-no-folders';
      }

      var sortable = [];

      for (let slugFolderName in this.folders) {
        let orderBy;

        if (this.currentSort.type === 'date') {
          orderBy = +this.$moment(
            this.folders[slugFolderName][this.currentSort.field],
            'YYYY-MM-DD HH:mm:ss'
          );
        } else if (this.currentSort.type === 'alph') {
          orderBy = this.folders[slugFolderName][this.currentSort.field];
        }
        sortable.push({ slugFolderName: slugFolderName, orderBy: orderBy });
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
    }
  }
};
</script>
<style>

</style>