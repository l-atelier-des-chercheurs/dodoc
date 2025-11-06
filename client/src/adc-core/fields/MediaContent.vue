<template>
  <div
    class="_mediaContent"
    :data-filetype="file.$type"
    :data-context="context"
    :data-novisual="!thumb"
  >
    <template v-if="file.$type === 'image'">
      <template v-if="context === 'preview'">
        <img
          v-if="thumb"
          :src="thumb"
          class="_mediaContent--image"
          :loading="img_loading"
        />
        <template v-else>
          <b-icon icon="eye-slash" />
        </template>
      </template>
      <template v-else>
        <img
          v-if="!zoom_on_click"
          :src="file_full_path"
          class="_mediaContent--image"
          :loading="img_loading"
        />
        <ImageZoom
          v-else
          class="_mediaContent--image"
          :small_img="full_thumb"
          :large_img="file_full_path"
          :width="img_width"
          :ratio="img_ratio"
          @zoomingIn="$emit('zoomingIn')"
          @zoomingOut="$emit('zoomingOut')"
        />
      </template>
    </template>

    <template v-else-if="['video', 'audio'].includes(file.$type)">
      <template v-if="context === 'preview'">
        <img
          v-if="thumb"
          :src="thumb"
          class="_mediaContent--image"
          :loading="img_loading"
        />
        <template v-else>
          <b-icon icon="eye-slash" />
        </template>
      </template>
      <template v-else>
        <vue-plyr :key="file_full_path" ref="plyr">
          <video
            v-if="file.$type === 'video'"
            :poster="thumb"
            :src="file_full_path"
            preload="none"
          />
          <audio
            v-else-if="file.$type === 'audio'"
            :src="file_full_path"
            preload="none"
          />
        </vue-plyr>
      </template>
    </template>

    <template v-else-if="file.$type === 'text'">
      <CollaborativeEditor3
        v-if="file.$media_filename.endsWith('.txt')"
        class="_mediaContent--collabEditor"
        :content="file.$content"
        :path="file.$path"
        :can_edit="can_edit"
      />
      <div v-else class="_mediaContent--rawText" v-text="file.$content" />
    </template>
    <template v-else-if="['pdf', 'url', 'stl', 'obj'].includes(file.$type)">
      <template v-if="context === 'preview'">
        <img
          v-if="thumb"
          :src="thumb"
          class="_mediaContent--image"
          :loading="img_loading"
        />
        <small v-else class="u-fontCode fieldCaption _fileName">
          <b-icon icon="eye-slash" /> {{ file.$media_filename }}
        </small>
      </template>
      <template v-else>
        <div class="_mediaContent--iframe">
          <div v-if="!start_iframe" class="_mediaContent--iframe--preview">
            <template v-if="thumb">
              <img
                :src="thumb"
                class="_iframeStylePreview"
                :loading="img_loading"
              />
            </template>
            <template v-else>
              <button
                type="button"
                v-if="!is_regenerating"
                class="u-button u-button_small u-button_transparent"
                @click="regenerateThumbs"
              >
                <b-icon icon="arrow-clockwise" />
                {{ $t("regenerate_thumbs") }}
              </button>
              <LoaderSpinner v-else />
            </template>
            <button
              type="button"
              class="plyr__control plyr__control--overlaid _playButton"
              :aria-label="$t('play')"
              @click="loadIframe"
            >
              <svg aria-hidden="true" focusable="false">
                <use xlink:href="#plyr-play" />
              </svg>
              <span class="plyr__sr-only">{{ $t("play") }}</span>
            </button>
          </div>
          <div class="_mediaContent--iframe--content" v-else>
            <div
              class="_errMessage"
              v-if="!is_loading_iframe && failed_to_load_iframe"
            >
              <div class="">
                <small>
                  {{ $t("page_failed_to_load") }}<br />
                  {{ $t("click_link_to_open_in_tab") }}
                </small>
              </div>
              <!-- <div class="fieldCaption" v-if="file.$type === 'url'">
                <a :href="file.$content" target="_blank">{{
                  $t("open_website_new_tab")
                }}</a>
              </div> -->
            </div>
            <iframe
              v-if="load_iframe_type === 'pdf'"
              class=""
              frameborder="0"
              :src="file_full_path"
              @load="iframeLoaded"
            />
            <ThreeDPreview
              v-else-if="load_iframe_type === '3D file'"
              class="_threeDPreview"
              :key="file_full_path"
              :file_type="file.$type"
              :src="file_full_path"
            />
            <iframe
              v-else-if="load_iframe_type === 'any'"
              frameborder="0"
              :src="url_to_site.src"
              @load="iframeLoaded"
            />
            <vue-plyr
              v-else-if="load_iframe_type === 'video'"
              :key="'plyr-' + file_full_path"
              ref="plyr"
            >
              <div class="plyr__video-embed">
                <iframe
                  :src="url_to_site.src"
                  allowfullscreen
                  allowtransparency
                  allow="autoplay"
                  :poster="thumb"
                  frameborder="0"
                />
              </div>
            </vue-plyr>
            <div class="u-divCentered" v-if="is_loading_iframe" key="loader">
              <LoaderSpinner />
            </div>
          </div>
          <div class="fieldCaption" v-if="file.$type === 'url'">
            <a :href="file.$content" target="_blank">{{ file.$content }}</a>
          </div>
        </div>
      </template>
    </template>
    <small v-else class="u-fontCode fieldCaption _fileName">
      <b-icon icon="file-earmark" /> {{ file.$media_filename }}
    </small>

    <template
      v-if="
        ['image', 'stl', 'obj', 'pdf'].includes(file.$type) && show_fs_button
      "
    >
      <div class="_fsButton">
        <EditBtn :btn_type="'fullscreen'" @click="show_fullscreen = true" />
      </div>
      <FullscreenView v-if="show_fullscreen" @close="show_fullscreen = false">
        <ImageZoom
          v-if="file.$type === 'image' && full_thumb"
          :small_img="full_thumb"
          :large_img="file_full_path"
          :width="img_width"
          :ratio="img_ratio"
        />
        <ThreeDPreview
          v-else-if="['stl', 'obj'].includes(file.$type)"
          class="_threeDPreview"
          :key="file_full_path"
          :file_type="file.$type"
          :src="file_full_path"
        />
        <iframe
          v-else-if="file.$type === 'pdf'"
          class="_pdfPreview"
          :src="file_full_path"
          frameborder="0"
        />
      </FullscreenView>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    resolution: {
      type: Number,
      default: 220,
    },
    context: {
      type: String,
      default: "preview",
      // preview, full
    },
    show_fs_button: {
      type: Boolean,
      default: false,
    },
    img_loading: {
      type: String,
      default: "eager",
    },
    zoom_on_click: {
      type: Boolean,
      default: false,
    },
    can_edit: Boolean,
  },
  components: {
    ThreeDPreview: () => import("@/adc-core/fields/ThreeDPreview.vue"),
    ImageZoom: () => import("@/adc-core/fields/ImageZoom.vue"),
  },
  data() {
    return {
      show_fullscreen: false,
      start_iframe: false,
      is_loading_iframe: false,
      failed_to_load_iframe: false,
      player: null,

      is_regenerating: false,
    };
  },
  created() {},
  mounted() {
    if (this.$refs.plyr?.player) {
      this.player = this.$refs.plyr.player;
      this.player.on("volumechange", this.volumeChanged);
      this.player.on("timeupdate", this.videoTimeUpdated);
      this.player.on("play", this.videoPlayed);
      this.player.on("pause", this.videoPaused);
      this.player.on("ended", this.videoEnded);
    }
  },
  beforeDestroy() {
    if (this.player) {
      this.player.off("volumechange", this.volumeChanged);
      this.player.off("timeupdate", this.videoTimeUpdated);
      this.player.off("play", this.videoPlayed);
      this.player.off("pause", this.videoPaused);
      this.player.off("ended", this.videoEnded);
    }
  },
  watch: {},
  computed: {
    load_iframe_type() {
      if (this.file.$type === "pdf") return "pdf";
      if (["stl", "obj"].includes(this.file.$type)) return "3D file";
      if (this.url_to_site.type === "any") return "any";
      return "video";
    },
    thumb() {
      if (this.file.$thumbs === "no_preview" || !this.file.$path) return false;

      const path_to_parent = this.file.$path.substring(
        0,
        this.file.$path.lastIndexOf("/")
      );
      return this.makeRelativeURLFromThumbs({
        $thumbs: this.file.$thumbs,
        $type: this.file.$type,
        $path: path_to_parent,
        resolution: this.resolution,
      });
    },
    full_thumb() {
      if (
        this.file.$type === "image" &&
        this.file.$media_filename.endsWith(".gif")
      )
        return this.file_full_path;
      if (this.resolution) return this.thumb;
      return this.file_full_path;
    },
    file_full_path() {
      return this.makeMediaFilePath({
        $path: this.file.$path,
        $media_filename: this.file.$media_filename,
        with_timestamp: true,
        $date_created: this.file.$date_created,
      });
    },
    timestamp() {
      if (this.file.$date_created) return +new Date(this.file.$date_created);
      else return +new Date();
    },
    url_to_site() {
      if (!this.file.$content) return false;
      return this.transformURL({ url: this.file.$content, autoplay: true });
    },
    img_width() {
      return this.file.$infos?.width;
    },
    img_ratio() {
      return this.file.$infos?.ratio;
    },
  },
  methods: {
    volumeChanged(event) {
      const vol = Math.round(Number(event.detail.plyr.volume) * 100);
      this.$emit("volumeChanged", vol);
    },
    videoTimeUpdated(event) {
      this.$emit("videoTimeUpdated", event.detail.plyr.media.currentTime);
    },
    videoPlayed(event) {
      this.$emit("videoPlayed", event.detail.plyr.media.currentTime);
    },
    videoPaused(event) {
      this.$emit("videoPaused", event.detail.plyr.media.currentTime);
    },
    videoEnded(event) {
      this.$emit("videoEnded", event.detail.plyr.media.currentTime);
    },

    iframeLoaded() {
      this.is_loading_iframe = false;
      setTimeout(() => {
        this.failed_to_load_iframe = true;
      }, 1000);
    },

    async regenerateThumbs() {
      this.is_regenerating = true;
      await this.$api.regenerateThumbs({ path: this.file.$path });
      this.is_regenerating = false;
    },
    loadIframe() {
      if (this.url_to_site.type === "any") this.is_loading_iframe = true;
      this.start_iframe = true;

      setTimeout(() => {
        // if the iframe is a youtube video and it has a start parameter,
        // we need to set the time to the start parameter
        if (
          this.url_to_site.type === "youtube" &&
          this.url_to_site.src.includes("start=")
        ) {
          this.$refs.plyr.player.currentTime = Number(
            this.url_to_site.src.split("start=")[1]
          );
        }
      }, 500);
    },
  },
};
</script>
<style lang="scss" scoped>
._fileName {
  padding: calc(var(--spacing) / 4);
  display: flex;
  gap: calc(var(--spacing) / 8);
  text-align: center;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}

._mediaContent {
  position: relative;

  &[data-novisual] {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  ::v-deep {
    .plyr {
      display: flex;
      justify-content: center;
      min-width: 100px;
      width: 100%;
      --plyr-audio-controls-background: var(--c-noir);
      --plyr-audio-control-color: white;
    }
    .plyr__control--overlaid {
      z-index: 10;
    }
    .plyr__controls {
      border-radius: 4px;
    }

    ._editBtn {
      background: rgba(255, 255, 255, 0.4) !important;
      backdrop-filter: blur(5px) !important;
    }
  }
}

._mediaContent--iframe {
  position: relative;
  height: 100%;
  width: 100%;

  ._mediaContent--iframe--preview,
  ._mediaContent--iframe--content {
    position: relative;
    width: 100%;
    height: 100%;
    aspect-ratio: 16/9;
    color: black;
  }

  ._mediaContent--iframe--preview {
    ._playButton {
      display: block;

      @media print {
        display: none;
      }
    }
  }

  ._mediaContent--iframe--content {
    resize: vertical;
    display: flex;

    > * {
      flex: 1;
    }

    ._errMessage {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      font-family: var(--sl-font-mono);
      justify-content: center;

      padding: calc(var(--spacing) * 2);
    }
  }

  ._mediaContent--iframe--content,
  ._iframeStylePreview {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    overflow: hidden;
    border: 2px solid var(--c-gris_clair);
    background-color: white;
    background-color: var(--set-backgroundColor, var(--c-gris_clair));
    object-fit: contain;
  }

  iframe {
    background: white;
  }

  iframe {
    z-index: 0;
    width: 100%;
    height: 100%;
  }
}

._fsButton {
  position: absolute;
  bottom: 0;
  left: 0;
  margin: calc(var(--spacing) / 1);

  @media print {
    display: none;
  }
}

._threeDPreview,
._pdfPreview {
  width: 100%;
  height: 100%;
}

._zoomed {
  ::v-deep {
    .vh--image.vh--abs {
      max-width: none;
    }
    .vh--outer {
      height: 200px;
    }
    .vh--holder {
      height: calc(100%);
    }
    .height,
    .vh--holder picture {
      height: 100%;
    }
  }
}

._mediaContent--collabEditor,
._mediaContent--rawText {
  width: 100%;
  text-align: left;
}
._mediaContent--rawText {
  white-space: pre-wrap;
}
</style>
