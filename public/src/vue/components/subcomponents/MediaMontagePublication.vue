<template>
  <div 
    class="m_mediaMontagePublication"
    ref="media"
    :style="mediaStyles"
    :data-media_type="media.type"
    :class="{ 
      'is--waitingForServerResponse' : is_waitingForServer,
    }"
  >

    <MediaContent
      ref="mediaContent"
      :context="'full'"
      :slugFolderName="media.slugProjectName"
      :media="media"
      :read_only="read_only"
      v-model="media.content"
      :audio_volume="volume"
      @volumeChanged="volumeChanged"
    />
    <p class="mediaCaption">{{ media.caption }}</p>
    
    <div class="m_metaField">
      <div>
        {{ $t('project') }}
      </div>
      <div>
        {{ $root.store.projects[media.slugProjectName].name }}
      </div>
    </div>
    <div class="m_metaField"
      v-if="origina_media_duration || enable_image_timer"
    >
      <div>
        {{ $t('duration') }}
      </div>
      <div v-if="origina_media_duration">
        {{ origina_media_duration }}
      </div>
      <div v-else-if="enable_image_timer && media.type === 'image'" class="m_mediaMontagePublication--set_props">
        <input type="number" v-model.number="seconds_per_image" step="1" />
        <span>{{ $t('seconds') }}</span>
      </div>
    </div>

    <div class="m_metaField"
      v-if="enable_set_video_volume && media.type === 'video'"
    >
      <div>
        {{ $t('volume') }}
      </div>
      <div class="m_mediaMontagePublication--set_props">
        {{ volume }} / 100
      </div>
    </div>

    <button 
      type="button" 
      class="m_mediaMontagePublication--withdraw" 
      @click.stop.prevent="removePubliMedia()"
      :title="$t('withdraw')"
      v-tippy='{ 
        placement : "top",
        delay: [600, 0]
      }'                        
    >
      <svg version="1.1" class="inline-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="37.2px"
        height="37.2px" viewBox="0 0 37.2 37.2" style="enable-background:new 0 0 37.2 37.2;" xml:space="preserve">
        <polygon class="st0" points="37.2,30.6 30.6,37.2 18.6,25.2 6.6,37.2 0,30.6 12,18.6 0,6.6 6.6,0 18.6,12 30.6,0 37.2,6.6 
        25.2,18.6 "/>
      </svg>
    </button>


    <transition name="fade_fast" :duration="150">
      <div 
        class="m_mediaPublication--buttons"
      >
        <!-- <button 
          type="button" 
          class="buttonLink _no_underline" 
          @mousedown.stop.prevent="editZIndex(+1)"
          @touchstart.stop.prevent="editZIndex(+1)"   
          :title="$t('move_to_foreground') + '<br>' + $t('layer:') + ' ' + mediaZIndex"
          v-tippy='{ 
            placement : "top",
            delay: [600, 0]
          }'                        
        >
          <svg version="1.1" class="inline-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40.3px"
            height="59.6px" viewBox="0 0 40.3 59.6" style="enable-background:new 0 0 40.3 59.6;" xml:space="preserve">
            <path class="st0" d="M35,24.4l-4.6-4.2c-2.7-2.5-4.8-4.7-6.4-7.3l0,46.7l-7.7,0l0-46.6c-1.7,2.5-3.8,4.7-6.4,7.1l-4.6,4.2L0,18.1
              L20.2,0l20.2,18.1L35,24.4z"/>
          </svg>
        </button> -->
        <!-- <button 
          type="button" 
          class="buttonLink _no_underline"         
          @mousedown.stop.prevent="editZIndex(-1)"
          @touchstart.stop.prevent="editZIndex(-1)"
          :title="$t('move_to_background') + '<br>' + $t('layer:') + ' ' + mediaZIndex"
          v-tippy='{ 
            placement : "top",
            delay: [600, 0]
          }'                        
        >
          <svg version="1.1" class="inline-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40.3px"
            height="59.6px" viewBox="0 0 40.3 59.6" style="enable-background:new 0 0 40.3 59.6;" xml:space="preserve">
            <path class="st0" d="M5.3,35.2l4.6,4.2c2.7,2.5,4.8,4.7,6.4,7.3l0-46.7L24,0l0,46.6c1.7-2.5,3.8-4.7,6.4-7.1l4.6-4.2l5.3,6.2
              L20.2,59.6L0,41.5L5.3,35.2z"/>
          </svg>
        </button> -->
        <!-- <button 
          type="button" 
          class="buttonLink _no_underline"
          @mousedown.stop.prevent="$root.openMedia({ slugProjectName: media.slugProjectName, metaFileName: media.metaFileName })"
          @touchstart.stop.prevent="$root.openMedia({ slugProjectName: media.slugProjectName, metaFileName: media.metaFileName })"
          :title="$t('edit_content')"
          v-tippy='{ 
            placement : "top",
            delay: [600, 0]
          }'                        
        >
          <svg version="1.1" class="inline-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100.7px"
            height="101px" viewBox="0 0 100.7 101" style="enable-background:new 0 0 100.7 101;" xml:space="preserve">
            <path class="st0" d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
              L19.1,91.5z"/>
          </svg>
        </button> -->
      </div>
    </transition>
  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';
import debounce from 'debounce';

export default {
  props: {
    media: Object,
    read_only: Boolean,
    enable_image_timer: {
      type: Boolean,
      default: false
    }, 
    enable_set_video_volume: {
      type: Boolean,
      default: false
    }, 
  },
  components: {
    MediaContent,
  },
  data() {
    return {
      mediaID: `${(Math.random().toString(36) + '00000000000000000').slice(2, 3 + 5)}`,
      seconds_per_image: this.media.publi_meta.duration,
      volume: this.media.publi_meta.volume ? this.media.publi_meta.volume : 100
    }
  },
  
  created() {
  },
  mounted() {
    if(this.enable_image_timer && this.seconds_per_image === undefined) {
      this.seconds_per_image = 1;
    }
  },
  beforeDestroy() {
  },
  watch: {
    'media.publi_meta.duration': function() {
      if(this.enable_image_timer) {
        this.seconds_per_image = this.media.publi_meta.duration;
      }
    },
    'seconds_per_image': function() {
      this.seconds_per_image = Math.min(999, Math.max(0, this.seconds_per_image));
      if(this.media.publi_meta.duration !== this.seconds_per_image) {
        this.updateMediaPubliMeta({
          duration: this.seconds_per_image
        })
      }
    },
    'media.publi_meta.volume': function() {
      if(this.enable_set_video_volume) {
        this.volume = this.media.publi_meta.volume;
        this.$refs.mediaContent.setVolume(this.volume);
      }
    },
    'volume': function() {
      this.volume = Math.min(100, Math.max(0, this.volume));
      if(this.media.publi_meta.volume !== this.volume) {
        this.updateMediaPubliMeta({
          volume: this.volume
        })
      }
    }
  },
  computed: {
    origina_media_duration() {
      if(this.media.duration) {
        return this.$moment.utc(this.media.duration * 1000).format('mm:ss');
      }
      return false;
    }
  },
  methods: {
    updateMediaPubliMeta(val) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: updateMediaPubliMeta`);
      }
      this.$emit('editPubliMedia', { slugMediaName: this.media.publi_meta.metaFileName, val });
    },    
    removePubliMedia() {
      this.$emit('removePubliMedia', { slugMediaName: this.media.publi_meta.metaFileName });
    },
    volumeChanged(val) {
      this.volume = val;
    }
  }
}
</script>
<style>

</style>