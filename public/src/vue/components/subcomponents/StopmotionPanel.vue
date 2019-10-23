<template>
  <div
    class="m_stopmotionpanel"
    :class="{ 'is--showing_video_validation' : validating_video_preview }"
  >
    <div class="m_stopmotionpanel--toprowbuttons">
      <button
        type="button"
        v-if="!validating_video_preview"
        @click="cancelStopmotion"
        class="buttonLink"
      >
        <span class="text-cap font-verysmall">{{ $t('back') }}</span>
      </button>

      <button
        v-if="!show_live_feed"
        type="button"
        :disabled="read_only"
        @click="removeMedia(show_previous_photo.metaFileName)"
        class="buttonLink m_stopmotionpanel--medias--single--removeMedia"
      >
        <span class>{{ $t('remove_this_image') }}</span>
      </button>
    </div>

    <div class="m_stopmotionpanel--medias" v-if="!validating_video_preview">
      <!-- <div class="m_stopmotionpanel--medias--single">
        <MediaContent
          v-if="show_previous_photo"
          :context="'preview'"
          :slugFolderName="stopmotiondata.slugFolderName"
          :media="show_previous_photo"
          :subfolder="'_stopmotions/'"
          :preview_size="1200"
        />
      </div>-->

      <transition-group
        class="m_stopmotionpanel--medias--list"
        name="list-complete"
        ref="mediaPreviews"
      >
        <div
          v-for="media in medias"
          :key="media.metaFileName"
          @click="show_previous_photo = media; show_live_feed = false;"
          class
          :class="{ 
            'is--current_single' : show_previous_photo.metaFileName === media.metaFileName && !show_live_feed,
          }"
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
          :class="{ 'is--current_single' : show_live_feed }"
          @click="show_previous_photo = medias[medias.length - 1]; show_live_feed = true;"
          :key="'live_feed'"
        >
          <video :srcObject.prop="videoStream" autoplay />
        </div>
      </transition-group>
      <div class="m_stopmotionpanel--medias--validation">
        <div class="m_stopmotionpanel--medias--validation--fpscounter">
          <select step="1" v-model.number="frameRate">
            <option>2</option>
            <option>4</option>
            <option>8</option>
            <option>15</option>
            <option>24</option>
            <option>30</option>
          </select>
          <label class v-if="medias.length <= 1">{{ $t('img_per_second') }}</label>
        </div>

        <button
          type="button"
          class="button button-bg_rounded bg-bleuvert"
          v-if="medias.length > 0"
          @click="assembleStopmotionMedias"
          :disabled="validating_video_preview && frameRate === previousFrameRate"
        >
          <!-- <span class="text-cap font-verysmall">
            {{ $t('generate') }}
          </span>-->
          <img src="/images/i_play.svg" width="48" height="48" draggable="false" />
        </button>
      </div>
    </div>

    <div v-else class="m_stopmotionpanel--videopreview" ref="videoPreview">
      <MediaContent
        :context="'full'"
        :slugFolderName="slugProjectName"
        :media="validating_video_preview"
      />
    </div>

    <MediaValidationButtons
      v-if="validating_video_preview"
      :read_only="read_only"
      :media_is_being_sent="media_is_being_sent"
      :cancelButtonIsBackButton="true"
      @cancel="backToStopmotion"
      @save="save()"
      @save_and_fav="saveAndFav()"
    />

    <div class="m_stopmotionpanel--loader" v-if="media_is_being_sent">
      <span class="loader loader-xs" />
    </div>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import MediaValidationButtons from "./MediaValidationButtons.vue";

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
      show_previous_photo: false,
      media_is_being_sent: false,
      show_live_feed: true
    };
  },

  created() {},
  mounted() {
    if (Object.values(this.stopmotiondata.medias).length > 0) {
      // this.show_previous_photo = Object.values(this.stopmotiondata.medias).slice(-1)[0];
    }
  },
  beforeDestroy() {},

  watch: {
    medias: function() {
      if (this.medias.length > 0) {
        if (this.show_live_feed) {
          this.show_previous_photo = this.medias[this.medias.length - 1];
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.$refs.mediaPreviews.$el.scrollLeft = 1000000;
            });
          });
        }
      }
    },
    show_previous_photo: function() {
      this.$emit("new_single_image", this.show_previous_photo);
    },
    show_live_feed: function() {
      this.$emit("show_live_feed", this.show_live_feed);
    },
    validating_video_preview: function() {
      this.$emit("validating_video", this.validating_video_preview);
    }
  },
  computed: {
    medias: function() {
      if (this.stopmotiondata.hasOwnProperty("medias")) {
        return Object.values(this.stopmotiondata.medias);
      } else {
        return [];
      }
    }
  },
  methods: {
    assembleStopmotionMedias: function() {
      console.log("METHODS • StopmotionPanel: assembleStopmotionMedias");
      this.$eventHub.$on(
        "socketio.media_created_or_updated",
        this.newStopmotionVideo
      );

      const list_media_names = this.medias.map(x => x.media_filename);

      this.$root.createMedia({
        slugFolderName: this.slugProjectName,
        type: "projects",
        rawData: list_media_names,
        additionalMeta: {
          type: "stopmotion",
          slugStopmotionName: this.stopmotiondata.slugFolderName,
          frameRate: this.frameRate
        }
      });
      this.previousFrameRate = this.frameRate;
      this.validating_video_preview = false;
      this.media_is_being_sent = true;
    },
    newStopmotionVideo: function(mdata) {
      console.log("METHODS • StopmotionPanel: newStopmotionVideo");
      this.$eventHub.$off(
        "socketio.media_created_or_updated",
        this.newStopmotionVideo
      );
      this.validating_video_preview = mdata;
      this.media_is_being_sent = false;

      this.$nextTick(() => {
        // this.$refs.videoPreview.getElementsByTagName('video')[0].play();
      });
    },
    backToStopmotion: function() {
      console.log("METHODS • StopmotionPanel: backToStopmotion");
      this.$root.removeMedia({
        type: "projects",
        slugFolderName: this.slugProjectName,
        slugMediaName: this.validating_video_preview.metaFileName
      });
      this.validating_video_preview = false;
    },
    cancelStopmotion: function() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sure_to_cancel_stopmotion"),
          () => {
            this.show_previous_photo = false;
            this.$nextTick(() => {
              this.$emit("close");
            });
          },
          () => {}
        );
    },
    save: function() {
      this.show_previous_photo = false;
      this.validating_video_preview = false;
      this.$nextTick(() => {
        this.$emit("close");
      });
    },
    saveAndFav: function() {
      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugProjectName,
        slugMediaName: this.validating_video_preview.metaFileName,
        data: {
          fav: true
        }
      });
      this.show_previous_photo = false;
      this.validating_video_preview = false;
      this.$nextTick(() => {
        this.$emit("close");
      });
    },
    removeMedia: function(slugMediaName) {
      console.log("METHODS • StopmotionPanel: removeMedia");

      // get index
      const index = this.medias.findIndex(
        m => m.metaFileName === slugMediaName
      );
      if (index < this.medias.length - 1) {
        this.show_previous_photo = this.medias[index + 1];
      } else {
        this.show_previous_photo = false;
        this.show_live_feed = true;
      }
      this.validating_video_preview = false;

      this.$root.removeMedia({
        type: "stopmotions",
        slugFolderName: this.stopmotiondata.slugFolderName,
        slugMediaName
      });
    }
  }
};
</script>
<style>
</style>