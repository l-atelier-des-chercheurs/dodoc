<template>
  <div 
    class="m_media"
    :class="{ 'is--inPubli' : media_is_in_current_publi }"
  >
    <div>
      <figure 
        @click.stop="openMediaModal()" 
        @mouseover="is_hovered = true"
        @mouseleave="is_hovered = false"
        :class="{ 'is--hovered' : is_hovered }"
      >
        <div>
          <div class="m_metaField padding-sides-small" v-if="!!media.type">
            <div>
              {{ $t(media.type) }}
            </div>
          </div>
          <MediaContent
            v-model="media.content"
            :context="'preview'"
            :slugProjectName="slugProjectName"
            :media="media"
          ></MediaContent>
          <button 
            type="button" 
            v-if="$root.settings.current_slugPubliName" 
            class="buttonLink margin-bottom-small"
            @click.stop="addToCurrentPubli()"
          >
            {{ $t('add_to_publication') }}
          </button>
          <figcaption class="m_media--caption" v-if="!!media.caption">
            {{ media.caption }}
          </figcaption>
        </div>          

        <figcaption
          v-if="is_hovered && false"
        >        
          <div class="m_metaField" v-if="!!media.type">
            <div>
              {{ $t('type') }}
            </div>
            <div>
              {{ media.type }}
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
              {{ $root.formatDateToHuman(media.date_created) }}
            </div>
          </div>
          <div class="m_metaField">
            <div>
              {{ $t('edited') }}
            </div>
            <div>
              {{ $root.formatDateToHuman(media.date_modified) }}
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
import { setTimeout } from 'timers';


export default {
  props: {
    media: Object,
    slugProjectName: String,
    metaFileName: String
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
      },
      media_is_in_current_publi: false
    }
  },
  
  created() {
    this.isMediaInPubli();
  },
  mounted() {
    this.$eventHub.$on('publication_medias_updated', this.isMediaInPubli);
  },
  beforeDestroy() {
    this.$eventHub.$off('publication_medias_updated', this.isMediaInPubli);
  },
  watch: {
  },
  computed: {
  },
  methods: {
    isMediaInPubli() {
      if(this.$root.settings.current_slugPubliName !== false) {
        if(this.$root.store.publications[this.$root.settings.current_slugPubliName].hasOwnProperty('medias_list')) {
          const publi_medias_list = this.$root.store.publications[this.$root.settings.current_slugPubliName].medias_list;
          const found_media_in_publi = publi_medias_list.filter((m) => {
            const m_slugProjectName = m.filename.split('/')[0];
            const m_slugMediaName = m.filename.split('/')[1];
            const current_media_slugProjectName = this.slugProjectName;
            const current_media_slugMediaName = this.metaFileName;

            if(m_slugProjectName === current_media_slugProjectName &&
              m_slugMediaName === current_media_slugMediaName
            ) {
              return true;
            }
            return false;
          });

          if(found_media_in_publi.length > 0) {
            this.media_is_in_current_publi = true;
          } else {
            this.media_is_in_current_publi = false;
          }
        }
      }
    },
    openMediaModal() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaCard: openMediaModal = ${this.metaFileName}`);
      }
      this.$root.openMedia({ slugProjectName: this.slugProjectName, metaFileName: this.metaFileName });
    },
    removeMedia() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • MediaCard: removeMedia');
      }
      if (window.confirm(this.$t('sureToRemoveMedia'))) {
        this.$root.removeMedia(this.slugProjectName, this.metaFileName);
      }
    },
    addToCurrentPubli() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • MediaCard: addToPubli');
      }
      this.$eventHub.$emit('publication.addMedia', { slugProjectName: this.slugProjectName, metaFileName: this.metaFileName });
    }
  }
}
</script>
<style>

</style>