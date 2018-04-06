<template>
  <div class="m_folder--library"
  >

    <MediaFilterBar
      :currentSort="mediaSort"
      :currentFilter="mediaFilter"
    >
    </MediaFilterBar>

    <div class="m_folder--library--medias">
      <div 
        class="m_media"
        v-for="media in sortedMedias"
        v-if="media.hasOwnProperty(mediaSort.field) && media[mediaSort.field] !== ''"
        :key="media.slugMediaName"
        :title="media.slugMediaName"
      >
        <figure>
          <div @click.stop="openMediaModal(media.slugMediaName)">
            <MediaContent
              v-model="media.content"
              :context="'Library'"
              :slugMediaName="media.slugMediaName"
              :slugFolderName="slugFolderName"
              :media="media"
            ></MediaContent>
          </div>
          <figcaption>
            <a>
              <img class="mediaTypeIcon" :src="mediaTypeIcon[media.type]" />
              <span>
                {{ media.date_created }}
              </span>
            </a>
          </figcaption>
          <nav>
            <button 
              type="button" 
              class="m_media--open border-circled button-thin button-wide padding-verysmall margin-verysmall flex-wrap flex-vertically-centered c-noir"
              @click.stop="openMediaModal(media.slugMediaName)"
            >
              {{ $t('open') }}
            </button>
            <button 
              type="button" 
              class="m_media--open border-circled button-thin button-wide padding-verysmall margin-verysmall flex-wrap flex-vertically-centered c-noir"
              @click.stop="removeMedia(media.slugMediaName)"
            >
              {{ $t('remove') }}
            </button>
          </nav>
        </figure>


      </div>
    </div>

    <FileUpload
      v-if="((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass') && $root.state.connected"
      :slugFolderName="slugFolderName"
      :disabled="read_only"
    >
    </FileUpload>

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

export default {
  props: {
    folder: Object,
    slugFolderName: String,
    read_only: Boolean
  },
  components: {
    MediaFilterBar,
    EditMedia,
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
      },
      mediaTypeIcon: {
        image: '/images/i_icone-dodoc_image.svg',
        video: '/images/i_icone-dodoc_video.svg',
        stopmotion: '/images/i_icone-dodoc_anim.svg',
        audio: '/images/i_icone-dodoc_audio.svg'
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
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • MediaLibrary: openMedia');
      }
      this.showMediaModalFor = slugMediaName;
    },
    removeMedia(slugMediaName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • MediaLibrary: removeMedia');
      }
      if (window.confirm(this.$t('sureToRemoveMedia'))) {
        this.$root.removeMedia(this.slugFolderName, slugMediaName);
      }
    }
  }
}
</script>
<style>

</style>