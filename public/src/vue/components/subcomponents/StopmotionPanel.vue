<template>
  <div class="m_stopmotionpanel">
    <div 
      v-if="!videopreview"    
      class="m_stopmotionpanel--medias"
    >
      <MediaContent
        v-for="media in medias"
        :key="media.metaFilename"
        :context="'preview'"
        :slugFolderName="stopmotiondata.slugFolderName"
        :media="media"
        :subfolder="'_stopmotions/'"
      />
    </div>

    <div 
      v-else
      class="m_stopmotionpanel--videopreview"
    >
      <MediaContent
        :context="'full'"
        :slugFolderName="slugProjectName"
        :media="videopreview"
      />
    </div>

    <div class="m_stopmotionpanel--buttons">
      <div>
        <button
          type="button"
          v-if="videopreview"
          @click="backToStopmotion"
          class="button button-bg_rounded button-outline c-blanc"
        >
          <span class="text-cap font-verysmall">
            {{ $t('back') }}
          </span>
        </button>

        <div class="">
          <label class="c-blanc">{{ $t('img_per_second') }}</label>
          <input type="number" min="0" max="100" step="1" v-model.number="frameRate" />
        </div>

        <button 
          type="button" 
          class="button button-bg_rounded bg-bleuvert"   
          @click="assembleStopmotionMedias"
          :disabled="videopreview && frameRate === previousFrameRate"
        >
          {{ $t('generate') }}
        </button>
      </div>

      <div
        v-if="videopreview"
      >
        <button
          type="button"
          :disabled="read_only"
          class="button button-bg_rounded button-outline c-rouge is--selected"
        >
          <svg version="1.1" class="" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 168 168" style="enable-background:new 0 0 168 168;" xml:space="preserve">
            <rect x="51.4" y="73.1" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -53.857 72.9892)" width="19.5" height="56.8"/>
            <rect x="53.2" y="77.3" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -31.6875 97.6563)" width="97.6" height="19.5"/>
          </svg>
          <span class="text-cap font-verysmall c-rouge">
            {{ $t('save') }}
          </span>
        </button>

      </div>
    </div>
  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';

export default {
  props: {
    stopmotiondata: Object,
    slugProjectName: String
  },
  components: {
    MediaContent
  },
  data() {
    return {
      frameRate: 4,
      previousFrameRate: 4,
      videopreview: false
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
    medias: function() {
      if(this.stopmotiondata.hasOwnProperty('medias')) {
        return Object.values(this.stopmotiondata.medias);
      } else {
        return [];
      }
    }
  },
  methods: {
    assembleStopmotionMedias: function() {
      console.log('METHODS • StopmotionPanel: assembleStopmotionMedias');
      this.$eventHub.$on('socketio.media_created_or_updated', this.newStopmotionVideo);
      this.$root.createMedia({
        slugFolderName: this.slugProjectName,
        type: 'projects',
        rawData: this.medias,
        additionalMeta: {
          type: 'stopmotion',
          slugStopmotionName: this.stopmotiondata.slugFolderName ,
          frameRate: this.frameRate
        }
      });
      this.previousFrameRate = this.frameRate;
      this.videopreview = false;
    },
    newStopmotionVideo: function(mdata) {
      console.log('METHODS • StopmotionPanel: newStopmotionVideo');
      this.$eventHub.$off('socketio.media_created_or_updated', this.newStopmotionVideo);
      this.videopreview = mdata;
    },
    backToStopmotion: function() {
      debugger;
      this.$root.removeMedia({
        type: 'projects',
        slugFolderName: this.slugProjectName,
        slugMediaName: this.videopreview.metaFileName
      });
      this.videopreview = false;    
    }
  }
}
</script>
<style>

</style>