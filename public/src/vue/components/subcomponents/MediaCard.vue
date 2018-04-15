<template>
  <div 
    class="m_media"
    :title="media.slugMediaName"
  >
    <figure @click.stop="openMediaModal(media.slugMediaName)">
      <div>
        <MediaContent
          v-model="media.content"
          :context="'preview'"
          :slugMediaName="media.slugMediaName"
          :slugFolderName="slugFolderName"
          :media="media"
        ></MediaContent>
      </div>
      <figcaption>
        <a>
          <img class="mediaTypeIcon" :src="mediaTypeIcon[media.type]" />
        </a>
        <div class="text-small" v-if="!!media.authors">
          Média de {{ media.authors }}
        </div>
      </figcaption>
      <nav>
        <!-- <button 
          type="button" 
          class="button-redthin "
          @click.stop="openMediaModal(media.slugMediaName)"
        >
          {{ $t('open') }}
        </button> -->
      </nav>
    </figure>
  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';


export default {
  props: {
    media: Object,
    slugFolderName: String,
  },
  components: {
    MediaContent
  },
  data() {
    return {
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
  },
  methods: {
    openMediaModal(slugMediaName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaCard: openMedia = ${slugMediaName}`);
      }
      this.$eventHub.$emit('modal.openMedia', slugMediaName);
    },
    removeMedia(slugMediaName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • MediaCard: removeMedia');
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