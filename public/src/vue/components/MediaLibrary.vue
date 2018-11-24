<template>
  <div class="m_project--library">
    <div class="m_actionbar" v-show="$root.state.connected">
      <div class="m_actionbar--buttonBar">
        <button type="button" class="barButton barButton_capture" 
          v-if="((project.password === 'has_pass' && project.authorized) || project.password !== 'has_pass')"
          @click="openCapture"
          :disabled="read_only"
        >
          <span>    
            {{ $t('capture') }}
          </span>
        </button>

        <button type="button" class="barButton barButton_import" 
          v-if="((project.password === 'has_pass' && project.authorized) || project.password !== 'has_pass')"
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

      <div class="m_actionbar--text">
        {{ $t('showing') }} 
        <span :class="{ 'c-rouge' : sortedMedias.length !== numberOfMedias }">
          {{ sortedMedias.length }} 
          {{ $t('medias_of') }} 
          {{ numberOfMedias }}
        </span>
        <template v-if="$root.allKeywords.length > 0">
          — 
          <button type="button" class="button-nostyle text-uc button-triangle"
            :class="{ 'is--active' : show_filters }"
            @click="show_filters = !show_filters"
          >{{ $t('filters') }}</button>
        </template>

        <template v-if="!show_medias_instead_of_projects && show_filters">
          <TagsAndAuthorFilters
            :allKeywords="mediaKeywords"
            :allAuthors="mediaAuthors"
            :keywordFilter="$root.settings.media_filter.keyword"
            :authorFilter="$root.settings.media_filter.author"
            :favFilter="$root.settings.media_filter.fav"
            @setKeywordFilter="a => $root.setMediaKeywordFilter(a)"
            @setAuthorFilter="a => $root.setMediaAuthorFilter(a)"
            @setFavFilter="a => $root.setFavAuthorFilter(a)"
          />
        </template>
      </div>
    </div>

    <transition-group
      class="m_project--library--medias"
      name="list-complete"
    >
      <MediaCard
        v-for="media in sortedMedias"
        :key="media.slugMediaName"
        :media="media"
        :metaFileName="media.metaFileName"
        :slugProjectName="slugProjectName"
      />
    </transition-group>
    
  </div>    
</template>
<script>
import UploadFile from './modals/UploadFile.vue';
import MediaCard from './subcomponents/MediaCard.vue';
import TagsAndAuthorFilters from './subcomponents/TagsAndAuthorFilters.vue';
import { setTimeout } from 'timers';

export default {
  props: {
    project: Object,
    slugProjectName: String,
    read_only: Boolean
  },
  components: {
    MediaCard,
    UploadFile,
    TagsAndAuthorFilters
  },
  data() {
    return {
      mediaSort: {
        field: 'date_uploaded',
        type: 'date',
        order: 'descending'
      },
      showImportModal: false,
      show_filters: false
    }
  },
  mounted() {
    if(this.$root.settings.media_filter.keyword || this.$root.settings.media_filter.author) {
      this.show_filters = true;
    }
  },
  created() {
    // document.addEventListener('dragover', this.fileDragover);
    this.$eventHub.$on('modal.prev_media', this.prevMedia);
    this.$eventHub.$on('modal.next_media', this.nextMedia);
  },
  beforeDestroy() {
    // document.removeEventListener('dragover', this.fileDragover);
    this.$root.settings.media_filter.author = false;
    this.$root.settings.media_filter.keyword = false;
    this.$root.settings.media_filter.fav = false;
    
    this.$eventHub.$off('modal.prev_media', this.prevMedia);
    this.$eventHub.$off('modal.next_media', this.nextMedia);
  },
  watch: {
  },

  computed: {
    numberOfMedias() {
      if(!this.project.hasOwnProperty('medias')) {
        return 0;
      }
      return Object.keys(this.project.medias).length;
    },
    mediaKeywords() {
      // grab all keywords from this.project.medias
      return this.$root.getAllKeywordsFrom(this.project.medias);      
    },
    mediaAuthors() {
      return this.$root.getAllAuthorsFrom(this.project.medias);      
    },
    sortedMedias() {
      var sortable = [];

      if(!this.project.hasOwnProperty('medias')) {
        return sortable;
      }

      for (let slugMediaName in this.project.medias) {
        let orderBy;
        const media = this.project.medias[slugMediaName];

        if (this.mediaSort.type === 'date') {
          if(media.hasOwnProperty(this.mediaSort.field)) {
            orderBy = +this.$moment(
              media[this.mediaSort.field],
              'YYYY-MM-DD HH:mm:ss'
            );
          }
          if(orderBy === undefined || Number.isNaN(orderBy)) {
            orderBy = 1000;
          }
        } else if (this.mediaSort.type === 'alph') {
          orderBy = media[this.mediaSort.field];
          if(orderBy === undefined || Number.isNaN(orderBy)) {
            orderBy = 1000;
          }
          if(orderBy === undefined) {
            orderBy = 'z';
          }          
        }

        if(this.$root.isMediaShown(media)) {
          sortable.push({ slugMediaName, orderBy });
        }
        
      }

      let sortedSortable = sortable.sort(function(a, b) {
        let valA = a.orderBy;
        let valB = b.orderBy;
        if (
          typeof a.orderBy === 'string' &&
          typeof b.orderBy === 'string'
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
        accumulator.push(sortedMediaObj);
        return accumulator;
      }, []);
      
      return sortedMedias;
    }    
  },
  methods: {
    fileDragover() {
      this.showImportModal = true;
    },
    prevMedia() {
      this.mediaNav(-1);
    },
    nextMedia() {
      this.mediaNav(+1);
    },
    mediaNav(relative_index) {
      const current_media_index = this.sortedMedias.findIndex(m => m.metaFileName === this.$root.media_modal.current_metaFileName);
      const new_media = this.sortedMedias[current_media_index + relative_index];
      this.$root.closeMedia();
      
      if(!!new_media) {
        this.$nextTick(() => {
          this.openMediaModal(new_media.metaFileName);
        });
      }

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