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
          class="m_stopmotionpanel--medias--list--items"
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
          class="m_stopmotionpanel--medias--list--items"
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

    <Loader v-if="media_is_being_sent" />
  </div>
</template>
<script>
import MediaContent from "../subcomponents/MediaContent.vue";
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
<style lang="scss" scoped>
.m_stopmotionpanel {
  position: relative;
  // height: 100%;
  display: flex;
  // .bg-noir;
  flex-flow: column nowrap;
  flex: 0 0 auto;

  &.is--showing_video_validation {
    flex-grow: 1;
  }

  > * {
    transition: all 0.4s;
  }
}

.m_stopmotionpanel--toprowbuttons {
  position: absolute;
  left: 0;
  z-index: 10;
  bottom: 100%;

  button {
    background-color: var(--c-noir);
    color: white;
  }
}

.m_stopmotionpanel--medias {
  // .bg-noir;
  flex: 1 1 auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;

  border-top: 2px solid black;
  background-color: var(--c-noir);
  color: white;

  // max-height: 120px;
  // justify-content: flex-end;

  // .m_stopmotionpanel--medias--single {
  //   position: relative;
  //   flex: 1 1 auto;
  //   .bg-noir;

  //   .mediaContainer {
  //     position: absolute;
  //     height: 100%;
  //     width: 100%;
  //     img {
  //       height: 100%;
  //       width: 100%;
  //       margin: 0;
  //       object-fit: contain;
  //       object-position: center;
  //     }
  //   }

  //   .m_stopmotionpanel--medias--single--removeMedia {
  //     position: absolute;
  //     bottom: 0;right: 0;
  //   }
  // }

  .m_stopmotionpanel--medias--list {
    display: block;
    flex: 1 1 200px;
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    overflow-x: auto;
    overflow-y: hidden;

    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    // .padding-verysmall;

    padding: 0 calc(var(--spacing) / 4);
    margin-bottom: calc(var(--spacing) / 8);

    // .margin-verysmall;
    scroll-behavior: smooth;

    // for some strange reason this prevents stopmotion thumbs
    // from showing in story publi
    // border-radius: 6px;

    // .custom_scrollbar(4px, 4px, 2px, rgba(255, 255, 255, 0), white);

    --c-thumbcolor: var(--c-noir);
    --scrollbar-height: 4px;
    --scrollbar-padding: 4px;
    --scrollbar-border: 2px;
    --c-barbgcolor: rgba(255, 255, 255, 0);
    --c-thumbcolor: white;

    &::-webkit-scrollbar {
      height: calc((var(--scrollbar-padding) * 2) + var(--scrollbar-height));
      width: calc((var(--scrollbar-padding) * 2) + var(--scrollbar-height));
      background-color: var(--c-barbgcolor);
    }

    &::-webkit-scrollbar-track,
    &::-webkit-scrollbar-thumb {
      border: var(--scrollbar-border) solid rgba(255, 255, 255, 0);
      border-radius: calc(var(--scrollbar-border) * 4);
      background-clip: padding-box;

      transition: all 0.4s;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--c-thumbcolor);
      &:hover {
        background-color: var(--c-gris);
        border: var(--scrollbar-border) solid rgba(255, 255, 255, 0);
      }
    }
  }

  counter-reset: compteListe;

  &::before,
  &::after {
    // content: '';
    // height: 100%;
    // padding-left: 2px;
  }

  .m_stopmotionpanel--medias--list--items {
    position: relative;
    overflow: hidden;
    // border-radius: 10px;
    // height: 100px;
    width: auto;
    max-height: 100%;
    flex: 0 0 auto;
    width: 100px;
    height: 66px;
    padding: 0 calc(var(--spacing) / 8);

    cursor: pointer;

    &::before {
      counter-increment: compteListe 1;
      content: counter(compteListe) " ";
      position: absolute;
      left: 0;
      bottom: 0;
      padding: calc(var(--spacing) / 16);

      margin: calc(var(--spacing) / 16);
      // .c-noir;
      // .c-blanc;
      text-transform: uppercase;
      font-weight: 500;
      letter-spacing: 0.06em;
      font-size: var(--font-verysmall);
      // font-weight: 600;
      background-color: var(--c-noir);
      color: white;
      border-radius: 2px;
      line-height: 1;
      z-index: 1;
    }

    &:last-child {
      flex-basis: auto;
      padding-right: 100px;
      width: auto;

      video {
        width: 100px;
        height: 66px;
      }
      &::before {
        content: attr(data-content);
        // .bg-bleuvert;
      }
      // &::after {
      //   content:'';
      //   display: block;
      //   width: 100px;
      //   height: 1px;
      // }
    }

    &.is--current_single::before {
      // .c-rouge;
      color: white;
      background-color: var(--c-rouge);
    }

    .mediaContainer {
      width: 100%;
      height: 100%;
      width: auto;
    }
  }
}

.m_stopmotionpanel--medias--validation {
  // .bg-rouge;
  flex: 0 0 auto;
  padding: calc(var(--spacing) / 4);
  margin: calc(var(--spacing) / 4);

  background-color: white;

  // border: calc(var(--spacing) / 4) solid var(--c-noir);
  border-radius: calc(var(--spacing) / 4);

  display: flex;
  flex: row nowrap;
  justify-content: center;
  align-items: center;

  --input-height: 2em;

  .m_stopmotionpanel--medias--validation--fpscounter {
    // .padding-sides-small;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;

    select {
      margin-left: calc(var(--spacing) / 8);
      margin-right: calc(var(--spacing) / 8);

      flex: 0 0 auto;
      max-width: 50px;
      font-size: var(--font-small);

      // .bg-noir;
    }
    label {
      margin-left: calc(var(--spacing) / 8);
      margin-right: calc(var(--spacing) / 8);
      // display: none;

      // max-width: 80px;
      font-size: 0.6em;
      white-space: nowrap;
    }
  }

  button {
    // width: 100%;
    // height: 100%;
    padding: 0;
    // .margin-small;
    // min-height: 0;
  }
}

.m_stopmotionpanel--videopreview {
  position: relative;
  flex: 1 1 auto;
  overflow: hidden;

  .mediaContainer {
    position: absolute;
    height: 100%;
    width: 100%;
  }
}

.m_stopmotionpanel--buttons {
  flex: 0 0 auto;
  width: 100%;
  // min-height: 50px;
  color: var(--c-noir);

  > * {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: center;
    padding: calc(var(--spacing) / 2);

    // .bg-noir;

    &:nth-child(1) {
    }
    &:nth-child(2) {
      border-top: 2px solid white;
      justify-content: center;
      background-color: var(--c-noir);
    }
  }

  label {
    // color: white;
  }
  input[type="number"] {
    width: 50px;
  }
}

.m_stopmotionpanel--loader {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: fade(#fff, 90%);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
<style lang="scss">
.m_stopmotionpanel--medias--list--items {
  img,
  video {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
    object-fit: contain;

    // .bg-noir;
  }
}

.m_stopmotionpanel--videopreview .mediaContainer {
  > * {
    width: 100%;
    height: 100%;
  }

  video {
    height: 100%;
    width: 100%;
    background-color: var(--c-noir);
  }
}
</style>
