<template>
  <div class="container">
    <div class="row">
      <main class="m_home">

        <header class="container">
          <div class="margin-vert-large">
            <img class="m_logo" src="/images/i_logo.svg"/>
            <!-- <vue-markdown
              :html=true
              :source="presentationText"
            ></vue-markdown> -->
          </div>
        </header>

        <section class="container">
          <FolderFilterBar
            :currentSort="currentSort"
            :currentFilter="currentFilter"
          >
          </FolderFilterBar>

          <div class="flex-wrap">
            <div class="m_leftbar flex-size-1/5">
              <div>
              AFFICHAGE
              </div>

              <div class="margin-vert-medium" style="max-width: 200px">
                <label v-html="$t('lang:')"></label>
                <select v-model="currentLang">
                  <option v-for="(name, code) in $root.lang.available" :value="code" :key="code">
                    {{ name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- modal -->
            <CreateFolder
              v-if="showCreateFolderModal"
              @close="showCreateFolderModal = false"
              :read_only="read_only"
            >
            </CreateFolder>

            <transition-group 
            tag="div"
            name="list-complete"
            class="flex-size-4/5 flex-collapse-on-mobile m_folders"
            >
              <button
              class="margin-vert-medium button-inline bg-rouge"
              @click="showCreateFolderModal = true"
              :disabled="read_only"
              :key="'createButton'"
              >
                <img src="images/i_add.svg" width="48" height="48" />
                <span class="margin-medium">
                  {{ $t('create_a_folder') }}
                </span>
              </button>

              <template
                v-if="sortedFoldersSlug !== 'no-folders'"
                v-for="(sortedFolder, index) in sortedFoldersSlug"
              >
                <div
                  class="margin-vert-medium"
                  :key="sortedFolder.slugFolderName"
                >
                  <Folder
                    :slugFolderName="sortedFolder.slugFolderName"
                    :folder="folders[sortedFolder.slugFolderName]"
                    :read_only="read_only"
                    :currentSort="currentSort"
                    :index="index"
                  >
                  </Folder>
                </div>
              </template>
            </transition-group>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>
<script>
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
    VueMarkdown
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