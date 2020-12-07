<template>
  <div
    class="m_stopmotionpanel"
    :class="{ 'is--showing_video_validation': validating_video_preview }"
  >
    <div class="m_stopmotionpanel--toprowbuttons">
      <button
        v-if="!show_live_feed"
        type="button"
        :disabled="read_only"
        @click="removeMedia(show_previous_photo.metaFileName)"
        class="buttonLink m_stopmotionpanel--medias--single--removeMedia"
      >
        <span class>{{ $t("remove_this_image") }}</span>
      </button>
    </div>

    <div class="m_stopmotionpanel--medias" v-if="!validating_video_preview">
      <transition-group
        class="m_stopmotionpanel--medias--list"
        name="list-complete"
        ref="mediaPreviews"
      >
        <div
          v-for="media in medias"
          :key="media.metaFileName"
          @click="
            show_previous_photo = media;
            $emit('update:show_live_feed', false);
          "
          class
          :class="{
            'is--current_single':
              show_previous_photo.metaFileName === media.metaFileName &&
              !show_live_feed,
          }"
        >
          <MediaContent
            :context="'preview'"
            :slugFolderName="stopmotiondata.slugFolderName"
            :media="media"
            :folderType="'stopmotions'"
            :preview_size="150"
          />
        </div>
        <div
          :class="{ 'is--current_single': show_live_feed }"
          @click="
            show_previous_photo = medias[medias.length - 1];
            $emit('update:show_live_feed', true);
          "
          :key="'live_feed'"
          :data-content="$t('live')"
        >
          <video
            ref="videoElement"
            autoplay
            playsinline
            muted
            :srcObject.prop="stream"
          />
        </div>
      </transition-group>
      <div class="m_stopmotionpanel--medias--validation">
        <div class="m_stopmotionpanel--medias--validation--fpscounter">
          <label class>{{ $t("img_per_second") }}</label>
          <select step="1" v-model.number="frameRate">
            <option>2</option>
            <option>4</option>
            <option>8</option>
            <option>15</option>
            <option>24</option>
            <option>30</option>
          </select>
        </div>

        <button
          type="button"
          class="button button-bg_rounded bg-bleuvert"
          v-if="medias.length > 0"
          @click="assembleStopmotionMedias"
          :disabled="
            validating_video_preview && frameRate === previousFrameRate
          "
        >
          <span class="text-cap padding-left-small font-verysmall">{{
            $t("create")
          }}</span>
          <img
            src="/images/i_play.svg"
            width="48"
            height="48"
            draggable="false"
          />
        </button>

        <!-- <button
          type="button"
          class="buttonLink padding-verysmall margin-none"
          :class="{ 'is--active': show_advanced_menu }"
          @mousedown.stop.prevent="
            show_advanced_menu = !show_advanced_menu;
          "
          @touchstart.stop.prevent="
            show_advanced_menu = !show_advanced_menu;
          "
        >{{ $t('advanced_options') }}</button>-->
      </div>
    </div>

    <div v-else class="m_stopmotionpanel--videopreview" ref="videoPreview">
      <MediaContent
        :context="'full'"
        :slugFolderName="slugFolderName"
        :folderType="type"
        :media="validating_video_preview"
      />
    </div>

    <MediaValidationButtons
      v-if="validating_video_preview"
      :read_only="read_only"
      :media_is_being_sent="media_is_being_sent"
      :cancelButtonIsBackButton="true"
      :can_add_to_fav="can_add_to_fav"
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
    slugFolderName: String,
    type: String,
    stream: MediaStream,
    can_add_to_fav: Boolean,
    show_live_feed: Boolean,
    is_validating_stopmotion_video: Boolean,
  },
  components: {
    MediaContent,
    MediaValidationButtons,
  },
  data() {
    return {
      frameRate: 4,
      previousFrameRate: 4,
      validating_video_preview: false,
      show_previous_photo: false,
      media_is_being_sent: false,
      show_advanced_menu: false,
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
    medias: function () {
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
    stream: {
      handler() {
        // debugger;
        // if (this.stream && this.$refs.videoElement) {
        //   if ("srcObject" in this.$refs.videoElement)
        //     this.$refs.videoElement.srcObject = this.stream;
        //   // Avoid using this in new browsers, as it is going away.
        //   else
        //     this.$refs.videoElement.src = window.URL.createObjectURL(
        //       this.stream
        //     );
        // }
      },
      immediate: true,
    },
    show_previous_photo: function () {
      this.$emit("new_single_image", this.show_previous_photo);
    },
    validating_video_preview: function () {
      this.$emit(
        "update:is_validating_stopmotion_video",
        !!this.validating_video_preview
      );
    },
  },
  computed: {
    medias: function () {
      if (this.stopmotiondata.hasOwnProperty("medias")) {
        return Object.values(this.stopmotiondata.medias);
      } else {
        return [];
      }
    },
  },
  methods: {
    assembleStopmotionMedias: function () {
      console.log("METHODS • StopmotionPanel: assembleStopmotionMedias");

      const list_media_names = this.medias.map((x) => x.media_filename);

      this.$root
        .createMedia({
          slugFolderName: this.slugFolderName,
          type: this.type,
          rawData: list_media_names,
          additionalMeta: {
            type: "stopmotion",
            slugStopmotionName: this.stopmotiondata.slugFolderName,
            frameRate: this.frameRate,
          },
        })
        .then((mdata) => {
          console.log("METHODS • StopmotionPanel: newStopmotionVideo");
          this.validating_video_preview = mdata;
          this.media_is_being_sent = false;

          this.$nextTick(() => {
            // this.$refs.videoPreview.getElementsByTagName('video')[0].play();
          });
        });
      this.previousFrameRate = this.frameRate;
      this.validating_video_preview = false;
      this.media_is_being_sent = true;
      this.$emit("update:show_live_feed", false);
    },
    backToStopmotion: function () {
      console.log("METHODS • StopmotionPanel: backToStopmotion");
      this.$root.removeMedia({
        type: this.type,
        slugFolderName: this.slugFolderName,
        slugMediaName: this.validating_video_preview.metaFileName,
      });
      this.validating_video_preview = false;
      this.$emit("update:show_live_feed", true);
    },
    save: function () {
      this.$emit("saveMedia", this.validating_video_preview.metaFileName);
      this.show_previous_photo = false;
      this.validating_video_preview = false;

      this.$nextTick(() => {
        this.$emit("close");
      });
    },
    saveAndFav: function () {
      this.$root.editMedia({
        type: this.type,
        slugFolderName: this.slugFolderName,
        slugMediaName: this.validating_video_preview.metaFileName,
        data: {
          fav: true,
        },
      });
      this.$emit("saveMedia", this.validating_video_preview.metaFileName);

      this.show_previous_photo = false;
      this.validating_video_preview = false;

      this.$nextTick(() => {
        this.$emit("close");
      });
    },
    removeMedia: function (slugMediaName) {
      console.log("METHODS • StopmotionPanel: removeMedia");

      // get index
      const index = this.medias.findIndex(
        (m) => m.metaFileName === slugMediaName
      );
      if (index < this.medias.length - 1) {
        this.show_previous_photo = this.medias[index + 1];
      } else {
        this.show_previous_photo = false;
        this.$emit("update:show_live_feed", true);
      }
      this.validating_video_preview = false;

      this.$root.removeMedia({
        type: "stopmotions",
        slugFolderName: this.stopmotiondata.slugFolderName,
        slugMediaName,
      });
    },
  },
};
</script>
<style></style>
