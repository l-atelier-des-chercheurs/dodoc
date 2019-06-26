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
      :context="'full'"
      :slugFolderName="media.slugProjectName"
      :media="media"
      :read_only="read_only"
      v-model="media.content"
      :style="media.publi_meta.custom_css"
    />
    <p class="mediaCaption">{{ media.caption }}</p>

    <hr>

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
  },
  components: {
    MediaContent,
  },
  data() {
    return {
      mediaID: `${(Math.random().toString(36) + '00000000000000000').slice(2, 3 + 5)}`,
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
    updateMediaPubliMeta(val) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: updateMediaPubliMeta`);
      }
      this.$emit('editPubliMedia', { slugMediaName: this.media.publi_meta.metaFileName, val });
    },    
    removePubliMedia() {
      this.$emit('removePubliMedia', { slugMediaName: this.media.publi_meta.metaFileName });
    },
  }
}
</script>
<style>

</style>