<template>
  <div 
    class="m_media"
    :class=" { 
      'is--inPubli' : media_is_in_current_publi, 
      'is--fav' : media.fav,
      'is--ownMedia' : media_made_by_current_author
    }"
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
            :slugFolderName="slugProjectName"
            :media="media"
            :preview_size="preview_size"
          ></MediaContent>
          <button 
            type="button" 
            v-if="$root.settings.current_slugPubliName" 
            class="button_addToPubli button-greenthin button-square"
            @click.stop="addToCurrentPubli()"
            :title="$t('add_to_publication')"
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
    metaFileName: String,
    preview_size: Number
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
    media_made_by_current_author() {
      if(!this.media.authors || typeof this.media.authors !== 'object') {
        return false;
      }
      if(!this.$root.settings.current_author) {
        return false;
      }
      return this.media.authors.filter(a => a.name === this.$root.settings.current_author.name).length > 0;
    }
  },
  methods: {
    isMediaInPubli() {
      if(this.$root.settings.current_slugPubliName) {
        if(this.$root.store.publications.hasOwnProperty(this.$root.settings.current_slugPubliName)) {
          const currentPubli = this.$root.store.publications[this.$root.settings.current_slugPubliName];
          if(currentPubli.hasOwnProperty('medias') && Object.keys(currentPubli.medias).length > 0) {

            const media_in_publi = this.$_.findWhere(currentPubli.medias, {
              slugMediaName: this.metaFileName 
            });
            if(media_in_publi) {
              this.media_is_in_current_publi = true;
            } else {
              this.media_is_in_current_publi = false;
            }
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