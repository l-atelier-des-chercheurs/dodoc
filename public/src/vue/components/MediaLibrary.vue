<template>
  <div class="m_project--library">
    <div class="m_actionbar">
      <button type="button" class="barButton barButton_capture" 
        v-if="((project.password === 'has_pass' && project.authorized) || project.password !== 'has_pass') && $root.state.connected"
        @click="openCapture"
        :disabled="read_only" 
      >
        <span>    
          {{ $t('capture') }}
        </span>
      </button>      
      <button type="button" class="dz-default dz-message" 
        v-if="((project.password === 'has_pass' && project.authorized) || project.password !== 'has_pass') && $root.state.connected"
        @click="showImportModal = true"
      ><span>    
        {{ $t('import') }}
      </span></button>

      <UploadFile
        v-if="showImportModal"
        @close="showImportModal = false"
        :slugProjectName="slugProjectName"
        :read_only="read_only"
      />

      <button type="button" class="barButton barButton_text" 
        @click="createTextMedia"
      >
        <span>
          {{ $t('create_text') }}
        </span>
      </button>
    </div>

    <div class="sectionTitle_small margin-sides-medium margin-vert-small">
      {{ $t('all_medias') }}
    </div>
    <div class="m_project--library--medias">
      <MediaCard
        v-for="media in sortedMedias"
        :key="media.slugMediaName"
        :media="media"
        :metaFileName="media.metaFileName"
        :slugProjectName="slugProjectName"
      >
      </MediaCard>
    </div>
  </div>    
</template>
<script>
import MediaFilterBar from './MediaFilterBar.vue';
import UploadFile from './modals/UploadFile.vue';
import MediaCard from './subcomponents/MediaCard.vue';
import { setTimeout } from 'timers';

export default {
  props: {
    project: Object,
    slugProjectName: String,
    read_only: Boolean
  },
  components: {
    MediaFilterBar,
    MediaCard,
    UploadFile
  },
  data() {
    return {
      mediaFilter: {
        fav: false
      },
      mediaSort: {
        field: 'date_uploaded',
        type: 'date',
        order: 'descending'
      },
      showImportModal: false
    }
  },
  
  created() {
    document.addEventListener('dragover', this.fileDragover);
  },
  beforeDestroy() {
    document.removeEventListener('dragover', this.fileDragover);
  },
  watch: {
  },

  computed: {
    sortedMedias() {
      var sortable = [];

      if(!this.project.hasOwnProperty('medias')) {
        return sortable;
      }

      for (let slugMediaName in this.project.medias) {
        let mediaDataToOrderBy;
        const media = this.project.medias[slugMediaName];

        if(this.$root.isShownAfterMediaFilter(media) === false) {
          continue;
        } 

        if (this.mediaSort.type === 'date') {
          if(media.hasOwnProperty(this.mediaSort.field)) {
            mediaDataToOrderBy = +this.$moment(
              media[this.mediaSort.field],
              'YYYY-MM-DD HH:mm:ss'
            );
          }
          if(mediaDataToOrderBy === undefined || Number.isNaN(mediaDataToOrderBy)) {
            mediaDataToOrderBy = 1000;
          }
        } else if (this.mediaSort.type === 'alph') {
          mediaDataToOrderBy = media[this.mediaSort.field];
          if(mediaDataToOrderBy === undefined || Number.isNaN(mediaDataToOrderBy)) {
            mediaDataToOrderBy = 1000;
          }
          if(mediaDataToOrderBy === undefined) {
            mediaDataToOrderBy = 'z';
          }          
        }
        sortable.push({
          slugMediaName: slugMediaName,
          mediaDataToOrderBy: mediaDataToOrderBy
        });
      }

      let sortedSortable = sortable.sort(function(a, b) {
        let valA = a.mediaDataToOrderBy;
        let valB = b.mediaDataToOrderBy;
        if (
          typeof a.mediaDataToOrderBy === 'string' &&
          typeof b.mediaDataToOrderBy === 'string'
        ) {
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

      if (this.mediaSort.order === 'descending') {
        sortedSortable.reverse();
      }

      // array order is garanteed while objects properties aren’t,
      // that’s why we use an array here
      let sortedMedias = sortedSortable.reduce((accumulator, d) => {
        let sortedMediaObj = this.project.medias[d.slugMediaName];
        sortedMediaObj.slugMediaName = d.slugMediaName;

        if (Object.keys(this.mediaFilter).length > 0) {
          // filter those that contain props
          // TODO for multiple filters

          if(sortedMediaObj.fav === this.mediaFilter.fav) {
            accumulator.push(sortedMediaObj);
          }

          // let originalContentFromMedia =
          //   sortedMediaObj[this.mediaSort.field] + '';
          // if (originalContentFromMedia.indexOf(this.mediaFilter) !== -1) {
          // }
        } else {
          accumulator.push(sortedMediaObj);
        }
        return accumulator;
      }, []);
      
      return sortedMedias;
    }    
  },
  methods: {
    fileDragover() {
      this.showImportModal = true;
    },
    openMediaModal(metaFileName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • MediaLibrary: openMediaModal');
      }
      this.$root.openMedia({ slugProjectName: this.slugProjectName, metaFileName });      
    },
    createTextMedia() {
      this.$eventHub.$on('socketio.media_created_or_updated', this.newTextMediaCreated);
      this.$root.createMedia({
        slugFolderName: this.slugProjectName,
        type: 'projects',
        additionalMeta: {
          type: 'text'          
        }
      });
    },
    newTextMediaCreated(mdata) {
      if (this.$root.justCreatedMediaID === mdata.id) {
        this.$root.justCreatedMediaID = false;
        this.$eventHub.$off('socketio.media_created_or_updated', this.newTextMediaCreated);
        this.openMediaModal(mdata.metaFileName);
      }
    },
    openCapture() {
      const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
      if(iOS) {
        this.showImportModal = true;

        this.$alertify
          .closeLogOnClick(true)
          .delay(8000)
          .error(this.$t('notifications.ios_not_compatible_with_capture'));
        setTimeout(() => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(8000)
            .log(this.$t('notifications.instead_import_with_this_button'));
        },1500);

        return;
      }
      
      this.$root.do_navigation.view = 'CaptureView';
    }
  }
}
</script>
<style>

</style>