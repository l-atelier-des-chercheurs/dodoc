<template>
  <div class="m_stopmotionpanel"
    :class="{ 'is--showing_video_validation' : validating_video_preview }"
  >
    <div class="m_stopmotionpanel--medias"
      v-if="!validating_video_preview"  
    >
      <!-- <div class="m_stopmotionpanel--medias--single">
        <MediaContent
          v-if="current_single_media"
          :context="'preview'"
          :slugFolderName="stopmotiondata.slugFolderName"
          :media="current_single_media"
          :subfolder="'_stopmotions/'"
          :preview_size="1200"
        />
        <button
          type="button"
          :disabled="read_only"
          @click="removeMedia(current_single_media.metaFileName)"
          class="buttonLink button-bg_rounded border c-blanc m_stopmotionpanel--medias--single--removeMedia"
        >
          <span class="">
            {{ $t('remove') }}
          </span>
        </button>
      </div> -->

      <div class="m_stopmotionpanel--medias--list"
        ref="mediaPreviews"
      >
        <div
          v-for="media in medias"
          :key="media.metaFilename"
          @click="current_single_media = media"
          class=""
          :class="{ 'is--current_single' : current_single_media.metaFileName === media.metaFileName }"
        > 
          <MediaContent
            :context="'preview'"
            :slugFolderName="stopmotiondata.slugFolderName"
            :media="media"
            :subfolder="'_stopmotions/'"
            :preview_size="150"
          />
        </div>
        <div 
          :class="{ 'is--current_single' : current_single_media === false }"
          @click="current_single_media = false"
        >
          <video :srcObject.prop="videoStream" autoplay />
        </div>
      </div>
      <div class="m_stopmotionpanel--medias--validation">
        <button 
          type="button" 
          class="button button-bg_rounded bg-bleuvert"   
          v-if="medias.length > 0"
          @click="assembleStopmotionMedias"
          :disabled="validating_video_preview && frameRate === previousFrameRate"
        >
          <!-- <span class="text-cap font-verysmall">
            {{ $t('generate') }}
          </span> -->
          <img src="/images/i_play.svg" width="48" height="48" />
        </button>
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
        :media="validating_video_preview"
      />
    </div>

    <!-- <div class="m_stopmotionpanel--buttons">
      <div>
        <button
          type="button"
          v-if="!validating_video_preview"
          @click="cancelStopmotion"
          class="button button-bg_rounded button-outline"
        >
          <span class="text-cap font-verysmall">
            {{ $t('back') }}
          </span>
        </button>

        <button
          type="button"
          v-if="validating_video_preview"
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
          v-if="medias.length > 0"
          @click="assembleStopmotionMedias"
          :disabled="validating_video_preview && frameRate === previousFrameRate"
        >
          <span class="text-cap font-verysmall">
            {{ $t('generate') }}
          </span>
        </button>
      </div>
    </div> -->
    <MediaValidationButtons
      v-if="validating_video_preview"
      :read_only="read_only"
      :media_is_being_sent="media_is_being_sent"
      :cancelButtonIsBackButton="true"
      @cancel="backToStopmotion"
      @save="save()"
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
    slugProjectName: String,
    videoStream: MediaStream
  },
  components: {
    MediaContent,
    MediaValidationButtons
  },
  data() {
    return {
      frameRate: 4,
      previousFrameRate: 4,
      validating_video_preview: false,
      current_single_media: false,
      media_is_being_sent: false
    }
  },
  
  created() {
  },
  mounted() {
    if(Object.values(this.stopmotiondata.medias).length > 0) {
      // this.current_single_media = Object.values(this.stopmotiondata.medias).slice(-1)[0];
    }
  },
  beforeDestroy() {
  },

  watch: {
    'medias': function() {
      if(this.medias.length > 0) {
        // this.current_single_media = Object.values(this.stopmotiondata.medias).slice(-1)[0];
        // scroll to end of timebar
        this.$nextTick(() => {
          this.$refs.mediaPreviews.scrollLeft = 1000000;
        });
      }
    },
    'current_single_media': function() {
      this.$emit('new_single_image', this.current_single_media); 
    },
    'validating_video_preview': function() {
      this.$emit('validating_video', this.validating_video_preview);
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

      const list_media_names = this.medias.map(x => x.media_filename);

      this.$root.createMedia({
        slugFolderName: this.slugProjectName,
        type: 'projects',
        rawData: list_media_names,
        additionalMeta: {
          type: 'stopmotion',
          slugStopmotionName: this.stopmotiondata.slugFolderName,
          frameRate: this.frameRate
        }
      });
      this.previousFrameRate = this.frameRate;
      this.validating_video_preview = false;
      this.media_is_being_sent = true;
    },
    newStopmotionVideo: function(mdata) {
      console.log('METHODS • StopmotionPanel: newStopmotionVideo');
      this.$eventHub.$off('socketio.media_created_or_updated', this.newStopmotionVideo);
      this.validating_video_preview = mdata;
      this.media_is_being_sent = false;

      this.$nextTick(() => {
        this.$refs.videoPreview.getElementsByTagName('video')[0].play();
      });
    },
    backToStopmotion: function() {
      console.log('METHODS • StopmotionPanel: backToStopmotion');
      this.$root.removeMedia({
        type: 'projects',
        slugFolderName: this.slugProjectName,
        slugMediaName: this.validating_video_preview.metaFileName
      });
      this.validating_video_preview = false;    
    },
    cancelStopmotion: function() {
      // this.$alertify
      //   .okBtn(this.$t('yes'))
      //   .cancelBtn(this.$t('cancel'))        
      //   .confirm(this.$t('sure_to_cancel_stopmotion'), 
      //   () => {
          this.current_single_media = false;
          this.$nextTick(() => {
            this.$emit('close');      
          });
      // },
      // () => {
      // });                    
    },
    save: function() {
      this.current_single_media = false;
      this.validating_video_preview = false;
      this.$nextTick(() => {
        this.$emit('close');      
      });
    },
    saveAndFav: function() {
      this.$root.editMedia({
        type: 'projects',
        slugFolderName: this.slugProjectName,
        slugMediaName: this.validating_video_preview.metaFileName,
        data: {
          fav: true
        }
      });
      this.current_single_media = false;
      this.validating_video_preview = false;
      this.$nextTick(() => {
        this.$emit('close');      
      });
    },
    removeMedia: function(slugMediaName) {
      console.log('METHODS • StopmotionPanel: removeMedia');
      this.$root.removeMedia({
        type: 'stopmotions',
        slugFolderName: this.stopmotiondata.slugFolderName, 
        slugMediaName
      });
    }
  }
}
</script>
<style>

</style>