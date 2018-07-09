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

        <!-- <button
          type="button"
          v-if="videopreview"
          @click="backToStopmotion"
          class="button button-bg_rounded button-outline"
        >
          <span class="text-cap font-verysmall">
            ‹ {{ $t('back') }}
          </span>
        </button> -->

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
    </div>
    <MediaValidationButtons
      v-if="videopreview"
      :read_only="read_only"
      @cancel="backToStopmotion"
      @save="$emit('close')"
      @save_and_fav="saveAndFav()"
    />

    <div class="m_stopmotionpanel--loader"
      v-if="media_is_being_sent"
    >
      <span class="loader loader-xs" />
    </div>
  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';
import MediaValidationButtons from './MediaValidationButtons.vue';

export default {
  props: {
    stopmotiondata: Object,
    slugProjectName: String
  },
  components: {
    MediaContent,
    MediaValidationButtons
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
    },
    saveAndFav: function() {
      this.$root.editMedia({
        type: 'projects',
        slugFolderName: this.slugProjectName,
        slugMediaName: this.videopreview.metaFileName,
        data: {
          fav: true
        }
      });
      this.$emit('close');            
    }
  }
}
</script>
<style>

</style>