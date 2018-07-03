<template>
  <div class="m_project--library"
  >

    <!-- <MediaFilterBar
      :currentSort="mediaSort"
      :currentFilter="mediaFilter"
    >
    </MediaFilterBar> -->

    <div class="m_actionbar">
      <button type="button" class="barButton barButton_capture" 
        v-if="((project.password === 'has_pass' && project.authorized) || project.password !== 'has_pass') && $root.state.connected"
        @click="$root.do_navigation.view = 'CaptureView'"
        :disabled="read_only" 
      >
        <span>    
          {{ $t('capture') }}
        </span>
      </button>      
      <FileUpload
        v-if="((project.password === 'has_pass' && project.authorized) || project.password !== 'has_pass') && $root.state.connected"
        :slugProjectName="slugProjectName"
        :disabled="read_only"
      >
      </FileUpload>
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
    <form :action="this.slugProjectName + '/file-upload'" enctype="multipart/form-data" method="post">
      <label class="file-select">
        <div class="select-button">
          <span v-if="value">Selected File: {{value.name}}</span>
          <span v-else>Select File</span>
        </div>
        <input type="file" name="upload" multiple="multiple"><br>
      </label>
      <input type="submit" value="Upload">
    </form>
    
  </div>    
</template>
<script>
import MediaFilterBar from './MediaFilterBar.vue';
import FileUpload from './FileUpload.vue';
import MediaCard from './subcomponents/MediaCard.vue';

export default {
  props: {
    project: Object,
    slugProjectName: String,
    read_only: Boolean
  },
  components: {
    MediaFilterBar,
    FileUpload,
    MediaCard
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
      }
    }
  },
  
  created() {
  },
  watch: {
    'project.medias': function() {
      let justCreatedTextMedia = Object.keys(this.project.medias).filter((m) => {
        let data = this.project.medias[m];
        return data.hasOwnProperty('id') && data.id === this.$root.justCreatedMediaID;
      });      
      if(justCreatedTextMedia.length > 0) {
        this.openMediaModal(justCreatedTextMedia[0]);
        this.$root.justCreatedMediaID = false;
      }
    }
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
    openMediaModal(metaFileName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • MediaLibrary: openMedia');
      }
      this.$root.openMedia({ slugProjectName: this.slugProjectName, metaFileName });      
    },
    createTextMedia() {
      this.$root.createMedia({
        slugFolderName: this.slugProjectName,
        type: 'projects',
        additionalMeta: {
          type: 'text'          
        }
      });
    }
  }
}
</script>
<style>

</style>