<template>
  <div
    class="m_stopmotionpanel"
    :class="{ 'is--showing_video_validation': validating_video_preview }"
  >
    <sl-spinner style="--indicator-color: currentColor" v-if="!stopmotion" />
    <div v-else-if="fetch_stopmotion_error">
      {{ fetch_stopmotion_error }}
    </div>
    <template v-else>
      <template v-if="!validating_video_preview">
        <div class="m_stopmotionpanel--toprowbuttons">
          <button
            type="button"
            class="u-button u-button_black"
            @click="firstImage"
            :disabled="image_index_currently_shown === 0 && !show_live_feed"
          >
            <sl-icon name="chevron-double-left" :label="$t('first_image')" />
          </button>
          <button
            type="button"
            class="u-button u-button_black"
            @click="prevImage"
            :disabled="image_index_currently_shown === 0 && !show_live_feed"
          >
            <sl-icon name="chevron-left" :label="$t('previous_image')" />
          </button>

          <div class="">
            <button
              v-if="!preview_playing_event"
              type="button"
              class="u-button u-button_black"
              :disabled="medias.length <= 1"
              @click="previewPlay"
            >
              <sl-icon name="play-fill" />
              &nbsp;
              {{ $t("play") }}
            </button>
            <button
              v-else
              type="button"
              class="u-button u-button_black"
              :disabled="show_live_feed"
              @click="pausePreview"
            >
              <sl-icon name="pause-fill" />
              &nbsp;
              {{ $t("pause") }}
            </button>
          </div>
          <button
            type="button"
            class="u-button u-button_black"
            @click="nextImage"
            :disabled="show_live_feed"
          >
            <sl-icon name="chevron-right" :label="$t('next_image')" />
          </button>
          <button
            type="button"
            class="u-button u-button_black"
            @click="lastImage"
            :disabled="show_live_feed"
          >
            <sl-icon name="chevron-double-right" :label="$t('last_image')" />
          </button>

          <!-- <div class="m_stopmotionpanel--toprowbuttons--counter">
          <button
            type="button"
            class=""
            @click="prevImage"
            :disabled="image_index_currently_shown === 0"
          >
            ←
          </button>
          <label class="c-blanc u-label">
            {{ $t("image") }} {{ image_index_currently_shown + 1 }}/{{
              medias.length
            }}
          </label>
          <button type="button" class="" @click="nextImage">→</button>
        </div>
 -->
        </div>
        <div class="m_stopmotionpanel--medias">
          <transition-group
            class="m_stopmotionpanel--medias--list"
            name="listComplete"
            ref="mediaPreviews"
          >
            <div
              v-for="media in medias"
              :key="media.$path"
              @click="
                show_previous_photo = media;
                $emit('update:show_live_feed', false);
              "
              class="m_stopmotionpanel--medias--list--items"
              :class="{
                'is--current_single':
                  show_previous_photo &&
                  show_previous_photo.$path === media.$path &&
                  !show_live_feed,
              }"
            >
              <MediaContent :file="media" :resolution="240" />

              <button
                type="button"
                v-if="
                  show_previous_photo &&
                  show_previous_photo.$path === media.$path &&
                  !show_live_feed
                "
                @click="removeMedia(show_previous_photo.$path)"
                class="u-button u-button_black _removeMedia"
              >
                <sl-icon name="trash3" />
              </button>
            </div>

            <div key="separator" class="_separator" />

            <div
              class="m_stopmotionpanel--medias--list--items"
              :class="{ 'is--current_single': show_live_feed }"
              @click="showVideoFeed"
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

              <div
                class="_onion_skin"
                :key="'_onion_skin'"
                v-if="show_live_feed"
              >
                <label class="u-label">
                  <span>{{ $t("onion_skin").toLowerCase() }}</span>
                  <input
                    class="_onion_skin_range"
                    type="range"
                    min="0"
                    max=".9"
                    step="0.01"
                    :value="onion_skin_opacity"
                    @input="
                      $emit('update:onion_skin_opacity', +$event.target.value)
                    "
                    data-use="onionskin"
                  />
                </label>
              </div>
            </div>
          </transition-group>
        </div>
      </template>

      <div v-else class="m_stopmotionpanel--videopreview" ref="videoPreview">
        <PreviewStopmotion :medias="medias" :frame_rate.sync="frame_rate" />
      </div>

      <MediaValidationButtons
        v-if="validating_video_preview"
        :media_is_being_sent="media_is_being_sent"
        :cancelButtonIsBackButton="true"
        @cancel="backToStopmotion"
        @save="exportStopmotion()"
      />

      <div class="_loader" v-if="media_is_being_sent">
        <LoaderSpinner />
      </div>
    </template>
  </div>
</template>
<script>
import MediaValidationButtons from "./MediaValidationButtons.vue";
import PreviewStopmotion from "./PreviewStopmotion.vue";

export default {
  props: {
    current_stopmotion_path: String,
    stream: MediaStream,
    show_live_feed: Boolean,
    is_validating_stopmotion_video: Boolean,
    onion_skin_opacity: Number,
    stopmotion_frame_rate: Number,
  },
  components: {
    MediaValidationButtons,
    PreviewStopmotion,
  },
  data() {
    return {
      stopmotion: null,

      fetch_stopmotion_error: undefined,

      frame_rate: this.stopmotion_frame_rate,
      validating_video_preview: false,
      show_previous_photo: false,
      media_is_being_sent: false,
      show_advanced_menu: false,

      preview_playing_event: undefined,
    };
  },

  created() {},
  async mounted() {
    this.$eventHub.$on("stopmotion.addImage", this.appendToStopMotion);
    this.$eventHub.$on("stopmotion.test", this.testStopmotion);

    const stopmotion = await this.$api
      .getFolder({
        path: this.current_stopmotion_path,
      })
      .catch((err) => {
        this.fetch_stopmotion_error = err.response;
      });
    this.stopmotion = stopmotion;
    this.$api.join({ room: this.current_stopmotion_path });
  },
  beforeDestroy() {
    this.$eventHub.$off("stopmotion.addImage", this.appendToStopMotion);
  },

  watch: {
    frame_rate() {
      this.$emit("update:stopmotion_frame_rate", this.frame_rate);
    },
    stopmotion_frame_rate() {
      this.frame_rate = this.stopmotion_frame_rate;
    },
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
      this.$emit("showPreviousImage", this.show_previous_photo);

      // scroll to

      this.$nextTick(() => {
        const active = document.querySelector(
          ".m_stopmotionpanel--medias--list--items.is--current_single"
        );
        if (active)
          active.scrollIntoView({
            behavior: "smooth",
            inline: "nearest",
          });
      });
    },
    validating_video_preview: function () {
      this.$emit(
        "update:is_validating_stopmotion_video",
        !!this.validating_video_preview
      );
    },
  },
  computed: {
    medias() {
      if (this.stopmotion?.images_list && this.stopmotion?.$files?.length > 0) {
        const medias = this.stopmotion.images_list.reduce(
          (acc, meta_filename) => {
            const m = this.stopmotion.$files.find((f) =>
              f.$path.endsWith(meta_filename)
            );
            if (m) acc.push(m);
            return acc;
          },
          []
        );
        return medias;
      }
      return [];
    },
    image_index_currently_shown() {
      if (!this.show_previous_photo) return false;
      return this.medias.findIndex(
        (m) => m.$path === this.show_previous_photo.$path
      );
    },
  },
  methods: {
    async appendToStopMotion({ imageData }) {
      const additional_meta = {};
      const meta_filename = await this.$api
        .uploadFile({
          path: this.current_stopmotion_path,
          filename: +new Date() + ".jpeg",
          file: imageData,
          additional_meta,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      let images_list = this.stopmotion.images_list
        ? this.stopmotion.images_list.slice()
        : [];
      images_list.push(meta_filename);

      await this.$api.updateMeta({
        path: this.current_stopmotion_path,
        new_meta: {
          images_list,
        },
      });
    },
    previewPlay() {
      if (
        this.show_live_feed ||
        this.image_index_currently_shown === this.medias.length - 1
      )
        this.firstImage();

      this.preview_playing_event = window.setInterval(() => {
        // change currently shown image
        this.show_previous_photo =
          this.medias[this.image_index_currently_shown + 1];

        this.$nextTick(() => {
          if (this.image_index_currently_shown === this.medias.length - 1)
            this.pausePreview();
        });
      }, 1000 / this.frame_rate);
    },
    pausePreview() {
      window.clearInterval(this.preview_playing_event);
      this.preview_playing_event = undefined;
    },
    testStopmotion() {
      this.validating_video_preview = true;
      this.$nextTick(() => {
        this.$nextTick(() => {
          // strange bug where the window would scroll halfway up on click
          this.$el.scrollIntoView({ behavior: "auto", block: "end" });
        });
      });
    },
    showVideoFeed() {
      this.show_previous_photo = this.medias[this.medias.length - 1];
      this.$emit("update:show_live_feed", true);
    },
    firstImage() {
      this.show_previous_photo = this.medias[0];
      this.$emit("update:show_live_feed", false);
    },
    prevImage() {
      if (this.show_live_feed) {
        this.show_previous_photo = this.medias.at(-1);
        this.$emit("update:show_live_feed", false);
        return;
      }
      this.show_previous_photo =
        this.medias[this.image_index_currently_shown - 1];
    },
    nextImage() {
      if (this.image_index_currently_shown === this.medias.length - 1)
        return this.showVideoFeed();

      this.show_previous_photo =
        this.medias[this.image_index_currently_shown + 1];
    },
    lastImage() {
      this.showVideoFeed();
    },
    backToStopmotion: function () {
      console.log("METHODS • StopmotionPanel: backToStopmotion");
      this.validating_video_preview = false;
      this.$emit("update:show_live_feed", true);
    },
    exportStopmotion: function () {
      this.show_previous_photo = false;
      this.validating_video_preview = false;
      this.$nextTick(() => {
        this.$emit("close");
      });
    },
    async removeMedia(path) {
      // remove from stopmotion list
      let images_list = this.stopmotion.images_list.slice();
      images_list = images_list.filter((i) => !path.endsWith(i));

      this.nextImage();

      await this.$api.updateMeta({
        path: this.current_stopmotion_path,
        new_meta: {
          images_list,
        },
      });

      await this.$api.deleteItem({
        path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.m_stopmotionpanel {
  --img-width: 120px;

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
    // transition: all 0.4s;
  }
}

.m_stopmotionpanel--toprowbuttons {
  position: relative;
  width: 100%;

  background-color: var(--c-noir);

  pointer-events: none;

  display: flex;
  justify-content: center;
  align-items: center;
  // padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);

  > * {
    pointer-events: auto;
    margin: calc(var(--spacing) / 4);
  }

  > .m_stopmotionpanel--toprowbuttons--counter {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) / 2);

    background-color: var(--c-noir);

    margin: 0;
    padding: 0;

    label {
      margin-bottom: 0;
    }
  }
}

.m_stopmotionpanel--medias {
  // .bg-noir;
  flex: 1 1 auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;

  // border-top: 2px solid black;
  background-color: black;
  padding: 1px;
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

    padding: 0;
    gap: 1px;
    // margin-bottom: calc(var(--spacing) / 8);

    // .margin-verysmall;
    scroll-behavior: smooth;

    // for some strange reason this prevents stopmotion thumbs
    // from showing in story publi
    // border-radius: 6px;

    // .custom_scrollbar(4px, 4px, 2px, rgba(255, 255, 255, 0), white);

    --c-thumbcolor: var(--c-noir);
    --scrollbar-height: 4px;
    --scrollbar-padding: 4px;
    --scrollbar-border: 4px;
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
    width: auto;
    flex: 0 0 auto;
    width: var(--img-width);
    height: auto;

    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

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

    ::v-deep {
      img,
      video {
        position: relative;
        width: 100%;
        height: 100%;
        margin: 0;
        object-fit: contain;
      }
    }

    &:last-child {
      flex-basis: auto;
      // padding-right: 50px;
      width: auto;
      // border-radius: 4px;
      overflow: hidden;

      video {
        width: var(--img-width);
        height: auto;
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

.m_stopmotionpanel--videopreview {
  position: relative;
  flex: 1 1 auto;
  overflow: hidden;

  .mediaContainer {
    position: absolute;
    height: 100%;
    width: 100%;

    ::v-deep {
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

._removeMedia {
  position: absolute;
  top: 0;
  right: 0;
  padding: calc(var(--spacing) / 4);
  margin: calc(var(--spacing) / 4);
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
._loader {
  background: rgba(0, 0, 0, 0.95);
  color: var(--color-capture);
}

._separator {
  position: relative;
  flex: 0 0 1px;
  height: 100%;
  z-index: -1;
  // background: var(--c-noir);
  // margin: calc(var(--spacing) / 4);
}

._onion_skin {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  backdrop-filter: blur(2px);
  background: rgba(0, 0, 0, 0.25);
  // background: rgba(255, 255, 255, 0.05);

  padding: calc(var(--spacing) / 4);
  text-align: center;

  .u-label {
    color: white;
  }

  input {
    width: 100%;
    margin: 0;
  }
}
._onion_skin_range {
  direction: rtl;
}
</style>
