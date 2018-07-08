<template>
  <div class="m_stopmotionpanel">
    <div class="m_stopmotionpanel--medias"
      v-if="!videopreview"    
    >
      <div class="m_stopmotionpanel--medias--single">
        <MediaContent
          v-if="current_single_media"
          :context="'edit'"
          :slugFolderName="stopmotiondata.slugFolderName"
          :media="current_single_media"
          :subfolder="'_stopmotions/'"
        />
      </div>
      <div class="m_stopmotionpanel--medias--list">
        <div
          v-for="media in medias"
          :key="media.metaFilename"
          @click="current_single_media = media"
          :class="{ 'is--current_single' : current_single_media.metaFileName === media.metaFileName }"
        >
          <MediaContent
            :context="'preview'"
            :slugFolderName="stopmotiondata.slugFolderName"
            :media="media"
            :subfolder="'_stopmotions/'"
          />
        </div>
      </div>
    </div>

    <div 
      v-else
      class="m_stopmotionpanel--videopreview"
      ref="videoPreview"
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
          v-if="!videopreview"
          @click="cancelStopmotion"
          class="button button-bg_rounded button-outline"
        >
          <span class="text-cap font-verysmall">
            {{ $t('cancel') }}
          </span>
        </button>

        <button
          type="button"
          v-if="videopreview"
          @click="backToStopmotion"
          class="button button-bg_rounded button-outline"
        >
          <span class="text-cap font-verysmall">
            ‹ {{ $t('back') }}
          </span>
        </button>

        <div class="">
          <label class="">{{ $t('img_per_second') }}</label>
          <input type="number" min="0" max="100" step="1" v-model.number="frameRate" />
        </div>

        <button 
          type="button" 
          class="button button-bg_rounded bg-bleuvert"   
          @click="assembleStopmotionMedias"
          :disabled="videopreview && frameRate === previousFrameRate"
        >
          <span class="text-cap font-verysmall">
            {{ $t('generate') }}
          </span>
        </button>
      </div>

      <div
        v-if="videopreview"
      >
        <button
          type="button"
          :disabled="read_only"
          @click="$emit('close')"
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

    <div class="m_stopmotionpanel--loader"
      v-if="media_is_being_sent"
    >
      <span class="loader loader-xs" />
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
      videopreview: false,
      current_single_media: false,
      media_is_being_sent: false
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
    'medias': function() {
      if(this.medias.length > 0) {
        this.current_single_media = Object.values(this.stopmotiondata.medias).slice(-1)[0];
      }
    }
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
      this.media_is_being_sent = true;
    },
    newStopmotionVideo: function(mdata) {
      console.log('METHODS • StopmotionPanel: newStopmotionVideo');
      this.$eventHub.$off('socketio.media_created_or_updated', this.newStopmotionVideo);
      this.videopreview = mdata;
      this.media_is_being_sent = false;
      this.$nextTick(() => {
        this.$refs.videoPreview.getElementsByTagName('video')[0].play();
      });

    },
    backToStopmotion: function() {
      this.$root.removeMedia({
        type: 'projects',
        slugFolderName: this.slugProjectName,
        slugMediaName: this.videopreview.metaFileName
      });
      this.videopreview = false;    
    },
    cancelStopmotion: function() {
      this.$emit('close');      
    }
  }
}
</script>
<style>

</style>