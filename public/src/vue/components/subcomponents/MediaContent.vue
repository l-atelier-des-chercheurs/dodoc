<template>
  <div
    class="mediaContainer"
    :key="slugFolderName + media.media_filename"
    :class="`type-${media.type}`"
    :data-context="context"
  >
    <template v-if="media.type === 'image'">
      <img
        :srcset="imageSrcSetAttr"
        :sizes="imageSizesAttr"
        :src="linkToImageThumb"
        draggable="false"
      />
    </template>

    <template v-else-if="media.type === 'video'">
      <template v-if="context === 'preview'">
        <img
          :srcset="complexMediaSrcSetAttr({ opt: 'timeMark' })"
          :sizes="imageSizesAttr"
          :src="linkToComplexMediaThumb({ opt: 'timeMark' })"
          draggable="false"
        />
        <div class="">
          <div class="play_picto">
            <svg
              class
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="169px"
              height="169px"
              viewBox="0 0 169 169"
              style="enable-background: new 0 0 169 169"
              xml:space="preserve"
            >
              <path
                d="M53.2,138.4c-4.6,3-8.4,0.9-8.4-4.6V30.4c0-5.5,3.8-7.6,8.4-4.6l78.5,50.9c4.6,3,4.6,7.9,0,10.9L53.2,138.4z"
              />
            </svg>
          </div>
          <div v-if="media_duration" class="_duration">
            {{
              $root.formatDurationToHoursMinutesSeconds(media_duration * 1000)
            }}
          </div>
        </div>
      </template>
      <template v-else>
        <vue-plyr
          :key="mediaURL"
          :options="plyr_options"
          ref="plyr"
          :emit="['volumechange', 'timeupdate']"
          @volumechange="volumeChanged"
          @timeupdate="videoTimeUpdated"
        >
          <video
            :poster="linkToComplexMediaThumb({ opt: 'timeMark' })"
            :src="mediaURL"
            preload="none"
            :autoplay="autoplay"
          />
        </vue-plyr>
      </template>
    </template>

    <template v-else-if="media.type === 'stl'">
      <template v-if="context === 'preview'">
        <img
          :srcset="complexMediaSrcSetAttr({ opt: 'angle' })"
          :sizes="imageSizesAttr"
          :src="linkToComplexMediaThumb({ opt: 'angle' })"
          draggable="false"
        />
        <!-- // TODO : set STL/3d picto -->
      </template>
      <template v-else>
        <img
          v-if="!interactive_stl_mode"
          :srcset="complexMediaSrcSetAttr({ opt: 'angle' })"
          :sizes="imageSizesAttr"
          :src="linkToComplexMediaThumb({ opt: 'angle' })"
          draggable="false"
        />
        <iframe v-else :src="`/libs/stl/show_stl.html?mediaURL=${mediaURL}`" />

        <div class="mediaContainer--buttons">
          <div
            class="switch switch-xs switch_twoway button button-thin"
            @click.self="interactive_stl_mode = !interactive_stl_mode"
          >
            <label
              :for="`interactive_preview_${id}`"
              class="cursor-pointer"
              :class="{
                'is--active': !interactive_stl_mode,
              }"
            >
              <span class>{{ $t("static_preview") }}</span>
            </label>

            <input
              type="checkbox"
              class="switch"
              :id="`interactive_preview_${id}`"
              v-model="interactive_stl_mode"
            />
            <label
              :for="`interactive_preview_${id}`"
              :class="{
                'is--active': interactive_stl_mode,
              }"
              >{{ $t("interactive_preview") }}</label
            >
          </div>
        </div>
      </template>
    </template>

    <template v-else-if="media.type === 'audio'">
      <template v-if="context === 'preview'">
        <div class="play_picto">
          <svg
            class
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="169px"
            height="169px"
            viewBox="0 0 169 169"
            style="enable-background: new 0 0 169 169"
            xml:space="preserve"
          >
            <path
              d="M53.2,138.4c-4.6,3-8.4,0.9-8.4-4.6V30.4c0-5.5,3.8-7.6,8.4-4.6l78.5,50.9c4.6,3,4.6,7.9,0,10.9L53.2,138.4z"
            />
          </svg>
        </div>
      </template>
      <template v-else>
        <vue-plyr
          :options="plyr_options"
          :emit="['volumechange', 'timeupdate']"
          ref="plyr"
          @volumechange="volumeChanged"
          @timeupdate="videoTimeUpdated"
        >
          <audio :src="mediaURL" preload="none" :autoplay="autoplay" />
        </vue-plyr>
      </template>
    </template>

    <template v-else-if="media.type === 'text'">
      <CollaborativeEditor
        v-if="context === 'edit'"
        v-model="htmlForEditor"
        :media="media"
        :read_only="read_only"
        :slugFolderName="slugFolderName"
        :enable_collaboration="true"
        :type="folderType"
        ref="textField"
      />
      <div v-else class="mediaTextContent">
        <div v-if="value.length !== 0" v-html="value" />
        <p v-else v-html="'…'" />
      </div>
      <!-- <textarea
        placeholder="…"
        class="mediaTextContent border-none bg-transparent"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textField"
        autocorrect="on"
        :readonly="read_only"
      />-->
    </template>

    <template v-else-if="media.type === 'marker'">
      <div v-if="context !== 'edit'" class="padding-small">
        <template v-if="value.length > 0">{{ value }}</template>
        <template v-else>…</template>
      </div>

      <input
        v-else
        type="text"
        class="border-none bg-transparent"
        placeholder="Étiquette"
        name="label"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textField"
        :readonly="read_only"
      />
    </template>

    <template v-else-if="media.type === 'document'">
      <div
        v-if="context !== 'edit' && context !== 'full'"
        class="padding-small font-verysmall"
      >
        <pre
          >{{ media.media_filename }}
        </pre>
      </div>
      <iframe v-else :src="mediaURL" />
    </template>

    <template v-else-if="media.type === 'other'">
      <div class="padding-small font-verysmall">
        <pre>{{ media.media_filename }}</pre>
      </div>
    </template>
  </div>
</template>
<script>
import CollaborativeEditor from "./CollaborativeEditor.vue";

export default {
  props: {
    slugFolderName: String,
    media: Object,
    folderType: {
      type: String,
      default: "",
    },
    context: {
      type: String,
      default: "preview",
      // preview, edit, publication
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: "…",
    },
    read_only: {
      type: Boolean,
      default: true,
    },
    preview_size: {
      type: Number,
      default: 180,
    },
    element_width_for_sizes: {
      type: Number,
      default: 0,
    },
    element_height: {
      type: Number,
      default: 0,
    },
    audio_volume: {
      type: Number,
      default: 100,
    },
  },
  components: {
    CollaborativeEditor,
  },
  data() {
    return {
      available_resolutions: {
        preview_hovered: 360,
        default: 1600,
      },
      htmlForEditor: this.value,
      interactive_stl_mode: false,

      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),

      plyr_options: {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "fullscreen",
        ],
        iconUrl:
          this.$root.state.mode === "export_publication"
            ? `./_images/plyr.svg`
            : `/images/plyr.svg`,
      },
    };
  },
  mounted() {
    if (this.context === "edit") {
      if (Modernizr !== undefined && !Modernizr.touchevents) {
        if (this.$refs.textField !== undefined) {
          // this.$refs.textField.focus();
        }
      }
    }
    this.setVolume(this.audio_volume);
  },
  beforeDestroy() {},
  watch: {
    htmlForEditor: function () {
      this.$emit("input", this.htmlForEditor);
    },
    interactive_stl_mode: function () {},
  },
  computed: {
    mediaURL: function () {
      return this.$root.state.mode === "export_publication"
        ? `./${this.subfolder}${this.slugFolderName}/${this.media.media_filename}`
        : `/${this.subfolder}${this.slugFolderName}/${this.media.media_filename}`;
    },
    subfolder: function () {
      switch (this.folderType) {
        case "publications":
          return "_publications/";
        case "stopmotions":
          return "_stopmotions/";
      }
      return "";
    },
    thumbRes: function () {
      return this.context === "preview"
        ? this.preview_size
        : this.available_resolutions.default;
    },
    media_duration: function () {
      if (
        !this.media.hasOwnProperty("duration") &&
        !(
          this.media.hasOwnProperty("file_meta") &&
          this.media.file_meta.some((f) => f.hasOwnProperty("duration"))
        )
      )
        return false;

      const duration = this.media.hasOwnProperty("duration")
        ? this.media.duration
        : this.media.file_meta.find((f) => f.hasOwnProperty("duration"))
            .duration;
      return duration;
    },
    thumbResHovered: function () {
      return this.available_resolutions.preview_hovered;
    },
    linkToImageThumb: function () {
      if (!this.media.hasOwnProperty("thumbs")) {
        return this.mediaURL;
      }

      if (
        // if image is gif and context is not 'preview', let’s show the original gif
        this.context !== "preview" &&
        (this.mediaURL.toLowerCase().endsWith(".gif") ||
          this.mediaURL.toLowerCase().endsWith(".svg") ||
          this.mediaURL.toLowerCase().endsWith(".png"))
      ) {
        return this.mediaURL;
      }

      const small_thumb = this.media.thumbs.filter(
        (m) => !!m && m.hasOwnProperty("size") && m.size === this.thumbRes
      );
      if (small_thumb.length == 0) {
        return this.mediaURL;
      }

      let pathToSmallestThumb = small_thumb[0].path;

      let url =
        this.$root.state.mode === "export_publication"
          ? `./${pathToSmallestThumb}`
          : `/${pathToSmallestThumb}`;
      return url;
    },
    imageSrcSetAttr: function () {
      if (
        this.element_width_for_sizes === 0 ||
        this.mediaURL.toLowerCase().endsWith(".gif")
      ) {
        return;
      }

      // get all available sizes
      const img_srcset = this.media.thumbs.reduce((acc, t) => {
        if (t.hasOwnProperty("path")) {
          const path =
            this.$root.state.mode === "export_publication"
              ? "./" + t.path
              : "/" + t.path;

          acc.push(path + " " + t.size + "w");
        }
        return acc;
      }, []);
      return img_srcset.join(", ");
    },
    imageSizesAttr: function () {
      if (this.element_width_for_sizes === 0) {
        return;
      }
      return this.element_width_for_sizes + "px";
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
    setVolume(val) {
      if (this.$refs.hasOwnProperty("plyr")) {
        this.$refs.plyr.player.volume = val / 100;
      }
    },
    linkToComplexMediaThumb: function ({ opt }) {
      if (
        !this.media["thumbs"] ||
        (typeof this.media.thumbs === "object" &&
          this.media.thumbs.length === 0)
      ) {
        return this.mediaURL;
      }

      let firstThumbs = this.media.thumbs.find((t) => !!t && t[opt] === 0);

      const small_thumb = firstThumbs.thumbsData.find(
        (m) => m && m.size === this.thumbRes
      );
      if (!small_thumb) return this.mediaURL;

      let pathToSmallestThumb = small_thumb.path;

      let url =
        this.$root.state.mode === "export_publication"
          ? "./" + pathToSmallestThumb
          : "/" + pathToSmallestThumb;
      return pathToSmallestThumb !== undefined ? url : this.mediaURL;
    },
    complexMediaSrcSetAttr: function ({ opt }) {
      if (this.element_width_for_sizes === 0) {
        return;
      }

      let firstThumbs = this.media.thumbs.filter((t) => !!t && t[opt] === 0);
      if (!firstThumbs || firstThumbs.length === 0) return;

      // get all available sizes
      const img_srcset = firstThumbs[0].thumbsData.reduce((acc, t) => {
        if (t.hasOwnProperty("path")) {
          const path =
            this.$root.state.mode === "export_publication"
              ? "./" + t.path
              : "/" + t.path;

          acc.push(path + " " + t.size + "w");
        }
        return acc;
      }, []);

      return img_srcset.join(", ");
    },
  },
};
</script>
