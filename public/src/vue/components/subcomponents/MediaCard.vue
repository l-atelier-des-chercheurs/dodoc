<template>
  <div 
    class="m_media"
  >
    <div>
      <figure 
        @click.stop="openMediaModal()" 
        @mouseover="is_hovered = true"
        @mouseleave="is_hovered = false"
        :class="{ 'is--hovered' : is_hovered }"
      >
        <MediaContent
          v-model="media.content"
          :context="'preview'"
          :slugMediaName="slugMediaName"
          :slugProjectName="slugProjectName"
          :media="media"
        ></MediaContent>
        <figcaption
          v-if="is_hovered"
        >
          <button type="button" v-if="$root.settings.current_slugPubliName" @click.stop="addToCurrentPubli()">
            Add to publi 
          </button>
        
          <div class="m_metaField" v-if="!!media.type">
            <div>
              {{ $t('type') }}
            </div>
            <div>
              {{ media.type }}
              <!-- <img class="mediaTypeIcon" :src="mediaTypeIcon[media.type]" /> -->
            </div>
          </div>
          <div class="m_metaField" v-if="!!media.authors">
            <div>
              {{ $t('author') }}
            </div>
            <div>
              {{ media.authors }}
            </div>
          </div>
          <div class="m_metaField">
            <div>
              {{ $t('created') }}
            </div>
            <div>
              {{ formatDateToHuman(media.date_created) }}
            </div>
          </div>
          <div class="m_metaField">
            <div>
              {{ $t('edited') }}
            </div>
            <div>
              {{ formatDateToHuman(media.date_modified) }}
            </div>
          </div>
        </figcaption>
        <!-- <nav>
          <button 
            type="button" 
            class="button-redthin "
            @click.stop="openMediaModal()"
          >
            {{ $t('open') }}
          </button>
        </nav> -->
      </figure>
    </div>
  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';


export default {
  props: {
    media: Object,
    slugProjectName: String,
    slugMediaName: String
  },
  components: {
    MediaContent
  },
  data() {
    return {
      is_hovered: false,
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
    formatDateToHuman(date) {
      return this.$moment(date, 'YYYY-MM-DD HH:mm:ss').format('LLL');
    },
    openMediaModal() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaCard: openMedia = ${this.slugMediaName}`);
      }
      this.$eventHub.$emit('modal.openMedia', this.slugMediaName);
    },
    removeMedia() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • MediaCard: removeMedia');
      }
      if (window.confirm(this.$t('sureToRemoveMedia'))) {
        this.$root.removeMedia(this.slugProjectName, this.slugMediaName);
      }
    },
    addToCurrentPubli() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • MediaCard: addToPubli');
      }
      this.$eventHub.$emit('publication.addMedia', `${this.slugProjectName}/${this.slugMediaName}`);
    }
  }
}
</script>
<style>

</style>