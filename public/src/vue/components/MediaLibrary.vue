<template>
    <div class="m_folder--library"
    >

      <MediaFilterBar
        :currentSort="mediaSort"
        :currentFilter="mediaFilter"
      >
      </MediaFilterBar>

      <div
        v-for="media in sortedMedias"
        v-if="media.hasOwnProperty(mediaSort.field) && media[mediaSort.field] !== ''"
        :key="media.slugMediaName"
        :title="media.slugMediaName"
      >
        <div class="m_media">
          <MediaContent
            v-model="media.content"
            :context="'Library'"
            :slugMediaName="media.slugMediaName"
            :slugFolderName="slugFolderName"
            :media="media"
          ></MediaContent>
          <button 
            type="button" 
            class="m_media--open border-circled button-thin button-wide padding-verysmall margin-verysmall flex-wrap flex-vertically-centered c-noir"
            @click.stop="openMediaModal(media.slugMediaName)"
          >
            {{ $t('open') }}
          </button>
        </div>
      </div>

      <FileUpload
        v-if="((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass') && $root.state.connected"
        :slugFolderName="slugFolderName"
        :disabled="read_only"
      >
      </FileUpload>
      <button type="button" class="m_folder--captureBtn"
        @click="showCaptureModal = true"
        :disabled="read_only" 
      >
        Capture
      </button>

      <Capture
        v-if="showCaptureModal && !read_only"
        :folder="folder"
        @close="showCaptureModal = false"
      >
      </Capture>

      <EditMedia
        v-if="showMediaModalFor !== ''"
        :slugFolderName="slugFolderName"
        :slugMediaName="showMediaModalFor"
        :media="folder.medias[showMediaModalFor]"
        @close="showMediaModalFor = ''"
        :read_only="read_only"
      >
      </EditMedia>        
    </div>    
</template>
<script>
import MediaFilterBar from './MediaFilterBar.vue';
import EditMedia from './modals/EditMedia.vue';
import FileUpload from './FileUpload.vue';
import MediaContent from './subcomponents/MediaContent.vue';
import Capture from './modals/Capture.vue';

export default {
  props: {
    folder: Object,
    slugFolderName: String,
    read_only: Boolean
  },
  components: {
    MediaFilterBar,
    EditMedia,
    Capture,
    FileUpload,
    MediaContent
  },
  data() {
    return {
      showMediaModalFor: '',
      mediaFilter: '',
      mediaSort: {
        field: 'date_created',
        type: 'date',
        order: 'descending'
      }
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    sortedMedias() {
      var sortable = [];
      for (let slugMediaName in this.folder.medias) {
        let mediaDataToOrderBy;

        if (this.mediaSort.type === 'date') {
          mediaDataToOrderBy = +this.$moment(
            this.folder.medias[slugMediaName][this.mediaSort.field],
            'YYYY-MM-DD HH:mm:ss'
          );
        } else if (this.mediaSort.type === 'alph') {
          mediaDataToOrderBy = this.folder.medias[slugMediaName][
            this.mediaSort.field
          ];
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
      let sortedMedias = sortedSortable.reduce((result, d) => {
        let sortedMediaObj = this.folder.medias[d.slugMediaName];
        sortedMediaObj.slugMediaName = d.slugMediaName;

        if (this.mediaFilter.length > 0) {
          // if there is a mediaFilter set, let’s only return medias whose mediaDataToOrderBy contain that string
          let originalContentFromMedia =
            sortedMediaObj[this.mediaSort.field] + '';
          if (originalContentFromMedia.indexOf(this.mediaFilter) !== -1) {
            result.push(sortedMediaObj);
          }
        } else {
          result.push(sortedMediaObj);
        }

        return result;
      }, []);
      return sortedMedias;
    }    
  },
  methods: {
    openMediaModal(slugMediaName) {
      debugger;
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • TimelineMedia: openMedia');
      }
      this.showMediaModalFor = slugMediaName;
    }
  }
}
</script>
<style>

</style>