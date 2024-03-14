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
        <vue-plyr
          :key="file_full_path"
          ref="plyr"
          :emit="['volumechange', 'timeupdate']"
          @volumechange="volumeChanged"
          @timeupdate="videoTimeUpdated"
        >
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
      <CollaborativeEditor2
        class="_mediaContent--collabEditor"
        :content="file.$content"
        :path="file.$path"
        :can_edit="can_edit"
      />
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
            <img
              :src="thumb"
              class="_iframeStylePreview"
              :loading="img_loading"
            />
            <button
              type="button"
              class="plyr__control plyr__control--overlaid _playButton"
              aria-label="Play"
              @click="loadIframe"
            >
              <svg aria-hidden="true" focusable="false">
                <use :xlink:href="$root.publicPath + 'plyr.svg#plyr-play'" />
              </svg>
              <span class="plyr__sr-only">Play</span>
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
              v-if="file.$type === 'pdf'"
              class=""
              frameborder="0"
              :src="file_full_path"
              @load="iframeLoaded"
            />
            <ThreeDPreview
              v-else-if="['stl', 'obj'].includes(file.$type)"
              class="_threeDPreview"
              :key="file_full_path"
              :file_type="file.$type"
              :src="file_full_path"
            />
            <iframe
              v-else-if="url_to_site.type === 'any'"
              :src="url_to_site.src"
              frameborder="0"
              @load="iframeLoaded"
            />
            <vue-plyr v-else :key="file_full_path">
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
      v-if="['image', 'stl', 'obj'].includes(file.$type) && show_fs_button"
    >
      <div class="_fsButton">
        <EditBtn :btn_type="'fullscreen'" @click="show_fullscreen = true" />
      </div>
      <FullscreenView v-if="show_fullscreen" @close="show_fullscreen = false">
        <ImageZoom
          v-if="file.$type === 'image'"
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
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    thumb() {
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
      if (this.resolution) return this.thumb;
      return this.file_full_path;
    },
    file_full_path() {
      const p = this.makeMediaFilePath({
        $path: this.file.$path,
        $media_filename: this.file.$media_filename,
      });
      return `/${p}?v=${this.timestamp}`;
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
      this.$emit("media.volumeChanged", vol);
    },
    videoTimeUpdated(event) {
      this.$emit("media.videoTimeUpdated", event.detail.plyr.media.currentTime);
    },
    iframeLoaded() {
      this.is_loading_iframe = false;
      setTimeout(() => {
        this.failed_to_load_iframe = true;
      }, 1000);
    },

    loadIframe() {
      if (this.url_to_site.type === "any") this.is_loading_iframe = true;
      this.start_iframe = true;
    },
  },
};
</script>
<style lang="scss" scoped>
._fileName {
  padding: calc(var(--spacing) / 4);

  display: flex;
  gap: calc(var(--spacing) / 8);
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

  ._mediaContent--iframe--preview {
    position: relative;
    width: 100%;
    height: 100%;
    aspect-ratio: 16/9;

    ._playButton {
      display: block;

      @media print {
        display: none;
      }
    }
  }

  ._mediaContent--iframe--content {
    position: relative;
    resize: vertical;
    display: flex;
    height: 100%;
    aspect-ratio: 16/9;
    color: black;

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
    border: 2px solid var(--c-gris);
    background-color: white;
    background-color: var(--c-gris);
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

._threeDPreview {
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

._mediaContent--collabEditor {
  width: 100%;
}
</style>
