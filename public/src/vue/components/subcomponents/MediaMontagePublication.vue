<template>
  <div
    class="m_mediaMontagePublication"
    ref="media"
    :class="{
      'is--waitingForServerResponse': is_waitingForServer
    }"
  >
    <template v-if="media.hasOwnProperty('type')">
      <MediaContent
        ref="mediaContent"
        :context="'full'"
        :slugFolderName="media.slugProjectName"
        :media="media"
        :read_only="read_only"
        v-model="media.content"
        :audio_volume="volume"
        @volumeChanged="volumeChanged"
      />

      <p class="mediaCaption">{{ media.caption }}</p>

      <div class="margin-top-small">
        <div class="m_metaField">
          <div>{{ $t("project") }}</div>
          <div>{{ $root.store.projects[media.slugProjectName].name }}</div>
        </div>
        <div class="m_metaField" v-if="original_media_duration || enable_image_timer">
          <div>{{ $t("duration") }}</div>
          <div v-if="original_media_duration">{{ original_media_duration }}</div>
          <div
            v-else-if="enable_image_timer && media.type === 'image'"
            class="m_mediaMontagePublication--set_props"
          >
            <input type="number" v-model.number="seconds_per_image" step="1" />
            <span>{{ $t("seconds") }}</span>
          </div>
        </div>
        <div class="m_metaField" v-if="media_dimensions">
          <div>{{ $t("dimensions") }}</div>
          <div>{{ media_dimensions }}</div>
        </div>

        <div class="m_metaField" v-if="enable_set_video_volume && media.type === 'video'">
          <div>{{ $t("volume") }}</div>
          <div class="m_mediaMontagePublication--set_props">{{ volume }} / 100</div>
        </div>
      </div>
    </template>

    <div
      v-else-if="
        media.publi_meta.hasOwnProperty('type') &&
          media.publi_meta.type === 'solid_color'
      "
      class="m_mediaMontagePublication--solidColor"
    >
      <div
        class="m_mediaMontagePublication--solidColor--colorPreview"
        :style="solid_color_background"
      >
        <input
          type="color"
          :value="media.publi_meta.color"
          @change="updateMediaPubliMeta({ color: $event.target.value })"
        />
      </div>
      <div class="m_metaField">
        <div>{{ $t("duration") }}</div>
        <div class="m_mediaMontagePublication--set_props">
          <input type="number" v-model.number="seconds_per_image" step="1" />
          <span>{{ $t("seconds") }}</span>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="m_mediaMontagePublication--withdraw"
      @click.stop.prevent="removePubliMedia()"
      :content="$t('withdraw')"
      v-tippy="{
        placement: 'top',
        delay: [600, 0]
      }"
    >
      <svg
        version="1.1"
        class="inline-svg"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width="37.2px"
        height="37.2px"
        viewBox="0 0 37.2 37.2"
        style="enable-background:new 0 0 37.2 37.2;"
        xml:space="preserve"
      >
        <polygon
          class="st0"
          points="37.2,30.6 30.6,37.2 18.6,25.2 6.6,37.2 0,30.6 12,18.6 0,6.6 6.6,0 18.6,12 30.6,0 37.2,6.6 
        25.2,18.6 "
        />
      </svg>
    </button>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import debounce from "debounce";

export default {
  props: {
    media: Object,
    read_only: Boolean,
    enable_image_timer: {
      type: Boolean,
      default: false
    },
    enable_set_video_volume: {
      type: Boolean,
      default: false
    }
  },
  components: {
    MediaContent
  },
  data() {
    return {
      mediaID: `${(Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      )}`,
      seconds_per_image: this.media.publi_meta.duration,
      volume: this.media.publi_meta.volume ? this.media.publi_meta.volume : 100
    };
  },

  created() {},
  mounted() {
    if (this.enable_image_timer && this.seconds_per_image === undefined) {
      this.seconds_per_image = 1;
    }
  },
  beforeDestroy() {},
  watch: {
    "media.publi_meta.duration": function() {
      if (this.enable_image_timer) {
        this.seconds_per_image = this.media.publi_meta.duration;
      }
    },
    seconds_per_image: function() {
      this.seconds_per_image = Math.min(
        999,
        Math.max(0, this.seconds_per_image)
      );
      if (this.media.publi_meta.duration !== this.seconds_per_image) {
        this.updateMediaPubliMeta({
          duration: this.seconds_per_image
        });
      }
    },
    "media.publi_meta.volume": function() {
      if (this.enable_set_video_volume) {
        this.volume = this.media.publi_meta.volume;
        this.$refs.mediaContent.setVolume(this.volume);
      }
    },
    volume: function() {
      this.volume = Math.min(100, Math.max(0, this.volume));
      if (this.media.publi_meta.volume !== this.volume) {
        this.updateMediaPubliMeta({
          volume: this.volume
        });
      }
    }
  },
  computed: {
    solid_color_background() {
      if (this.media.publi_meta.color)
        return `background-color: ${this.media.publi_meta.color}`;
      return `background-color: #000`;
    },
    original_media_duration() {
      if (this.media.duration) {
        return this.$moment.utc(this.media.duration * 1000).format("mm:ss");
      }
      return false;
    },
    media_dimensions() {
      if (
        !this.media.file_meta ||
        !this.media.file_meta.find(m => m.hasOwnProperty("width")) ||
        !this.media.file_meta.find(m => m.hasOwnProperty("height"))
      )
        return false;
      return (
        this.media.file_meta.find(m => m.hasOwnProperty("width")).width +
        " × " +
        this.media.file_meta.find(m => m.hasOwnProperty("height")).height
      );
    }
  },
  methods: {
    updateMediaPubliMeta(val) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • MediaMontagePublication: updateMediaPubliMeta`);
      }
      this.$emit("editPubliMedia", {
        slugMediaName: this.media.publi_meta.metaFileName,
        val
      });
    },
    removePubliMedia() {
      this.$emit("removePubliMedia", {
        slugMediaName: this.media.publi_meta.metaFileName
      });
    },
    volumeChanged(val) {
      this.volume = val;
    }
  }
};
</script>
<style></style>
