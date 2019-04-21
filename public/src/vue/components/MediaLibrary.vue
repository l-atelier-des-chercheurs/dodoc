<template>
  <div class="m_project--library">
    <div class="m_actionbar" v-show="$root.state.connected">
      <div class="m_actionbar--buttonBar">
        <button type="button" class="barButton barButton_capture" 
          v-if="((project.password === 'has_pass') || project.password !== 'has_pass')"
          @click="openCapture"
          :disabled="read_only || is_iOS_device"
        >
          <span>    
            {{ $t('capture') }}
          </span>
        </button>

        <label
          v-if="((project.password === 'has_pass') || project.password !== 'has_pass')"
          :key="`add_${field.key}`"
          class="barButton barButton_import button" 
          v-for="field in input_file_fields"
          :disabled="read_only"
          :for="`add_${field.key}`"
        >
          <span>
            {{ field.label }}
            <!-- <div v-html="field.svg" /> -->
          </span>
          <input 
            type="file" 
            multiple 
            :id="`add_${field.key}`" 
            :name="field.key" 
            @change="updateInputFiles($event)"
            :accept="field.accept"
            :capture="field.capture"
            style="width: 1px; height: 1px; overflow: hidden;"
          >
        </label>

        <transition name="fade_fast" :duration="150">
          <div 
            v-if="!read_only && show_drop_container"
            @drop="dropHandler($event)"
            class="_drop_indicator"
          >
            <div>
              <img src="/images/i_importer.svg">
              <label>{{ $t('drop_here_to_import') }}</label> 
            </div>
          </div>
        </transition>

        <UploadFile
          v-if="selected_files.length > 0"
          @close="selected_files = []"
          :read_only="read_only"
          :slugFolderName="slugProjectName"
          :type="'projects'"
          :selected_files="selected_files"
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
      v-if="selected_files.length === 0"
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
import debounce from 'debounce';

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
      selected_files: [],
      is_iOS_device: !!window.navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform),
      show_filters: false,

      show_drop_container: false,

      input_file_fields: [
        {
          key: 'file',
          label: 'Importer',
          accept: '',
          capture: false,
          svg: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
              <path d="M20.89,12v4.63a1,1,0,0,0,1,1h4.63V28h-13V12h7.4m1-1H12.5V29h15V16.62H21.88V11Z" style="fill: #fff"/>
              <line x1="27" y1="17.12" x2="21.38" y2="11.5" style="fill: none;stroke: #fff;stroke-linecap: round;stroke-linejoin: round;stroke-width: 0.9900837817656861px"/>
            </svg>
          `
        },
      ]
    }
  },
  mounted() {
    if(this.$root.settings.media_filter.keyword || this.$root.settings.media_filter.author) {
      this.show_filters = true;
    }
    document.addEventListener('dragover', this.ondragover);

    this.cancelDragOver = debounce(this.cancelDragOver, 300);
    this.$eventHub.$on('modal.prev_media', this.prevMedia);
    this.$eventHub.$on('modal.next_media', this.nextMedia);
  },
  created() {
  },
  beforeDestroy() {
    this.$root.settings.media_filter.author = false;
    this.$root.settings.media_filter.keyword = false;
    this.$root.settings.media_filter.fav = false;
    
    this.$eventHub.$off('modal.prev_media', this.prevMedia);
    this.$eventHub.$off('modal.next_media', this.nextMedia);

    document.addEventListener('dragover', this.ondragover);

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
      // const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
      // if(iOS) {
      //   this.showImportModal = true;

      //   this.$alertify
      //     .closeLogOnClick(true)
      //     .delay(8000)
      //     .error(this.$t('notifications.ios_not_compatible_with_capture'));
      //   setTimeout(() => {
      //     this.$alertify
      //       .closeLogOnClick(true)
      //       .delay(8000)
      //       .log(this.$t('notifications.instead_import_with_this_button'));
      //   },1500);

      //   return;
      // }
      this.$root.do_navigation.view = 'CaptureView';
    },
    updateInputFiles($event) {
      if (this.$root.state.dev_mode === 'debug') { console.log(`METHODS • AddMedia / updateSelectedFiles`); }
      this.selected_files = Array.from($event.target.files); 
      $event.target.value = '';
    },
    ondragover() {
      if (this.$root.state.dev_mode === 'debug') { console.log(`METHODS • AddMedia / ondragover`); }

      this.show_drop_container = true;
      this.cancelDragOver();
    },
    cancelDragOver() {
      if (this.$root.state.dev_mode === 'debug') { console.log(`METHODS • AddMedia / cancelDragOver`); }
      this.show_drop_container = false;
    },
    dropHandler($event) {
      if (this.$root.state.dev_mode === 'debug') { console.log(`METHODS • AddMedia / dropHandler`); }

      // Prevent default behavior (Prevent file from being opened)
      $event.preventDefault();

      if ($event.dataTransfer.items) {
        let files = [];
        for (var i = 0; i < $event.dataTransfer.items.length; i++) {
          if ($event.dataTransfer.items[i].kind === 'file') {
            files.push($event.dataTransfer.items[i].getAsFile());
          }
        }
        this.selected_files = files;
      } else {
        for (var i = 0; i < $event.dataTransfer.files.length; i++) {
          this.selected_files = Array.from($event.dataTransfer.files); 
        }
      }

    }
  }
}
</script>
<style>

</style>