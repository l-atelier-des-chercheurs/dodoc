<template>
  <div
    class="m_mediaMontagePublication"
    ref="media"
    :class="{
      'is--waitingForServerResponse': is_waitingForServer,
    }"
  >
    <div
      v-if="
        media.hasOwnProperty('_linked_media') &&
        media._linked_media.hasOwnProperty('_isAbsent')
      "
    >
      {{ $t("linked_media_wasnt_found") }}
      <br />
      <small>
        {{ media._linked_media.slugProjectName }}/{{
        media._linked_media.slugMediaName
        }}
      </small>
    </div>

    <template v-else-if="media.hasOwnProperty('_linked_media')">
      <MediaContent
        ref="mediaContent"
        :context="'full'"
        :slugFolderName="media._linked_media.slugProjectName"
        :media="media._linked_media"
        :read_only="read_only || preview_mode"
        v-model="media._linked_media.content"
        :audio_volume="volume"
        @volumeChanged="volumeChanged"
      />

      <p class="mediaCaption" v-if="!!media._linked_media.caption">{{ media._linked_media.caption }}</p>

      <div class="margin-top-small">
        <div class="m_metaField">
          <div>{{ $t("project") }}</div>
          <div>{{ $root.store.projects[media._linked_media.slugProjectName].name }}</div>
        </div>
        <div class="m_metaField" v-if="original_media_duration || enable_image_timer">
          <div>{{ $t("duration") }}</div>
          <div v-if="original_media_duration">{{ original_media_duration }}</div>
          <div
            v-else-if="
              enable_image_timer && media._linked_media.type === 'image'
            "
            class="m_mediaMontagePublication--set_props"
          >
            <input
              type="number"
              v-model.number="seconds_per_image"
              step="1"
              :disabled="read_only || preview_mode"
            />
            <span>{{ $t("seconds") }}</span>
          </div>
        </div>
        <div class="m_metaField" v-if="media_dimensions">
          <div>{{ $t("dimensions") }}</div>
          <div>{{ media_dimensions }}</div>
        </div>

        <div
          class="m_metaField"
          v-if="enable_set_video_volume && media._linked_media.type === 'video'"
        >
          <div>{{ $t("volume") }}</div>
          <div class="m_mediaMontagePublication--set_props">{{ volume }} / 100</div>
        </div>
      </div>
    </template>

    <div v-else-if="media.type === 'solid_color'" class="m_mediaMontagePublication--solidColor">
      <div
        class="m_mediaMontagePublication--solidColor--colorPreview"
        :style="solid_color_background"
      >
        <input
          type="color"
          :id="`solidcolor + ${media.metaFileName}`"
          v-if="!read_only && !preview_mode"
          :value="media.color"
          @change="updateMediaPubliMeta({ color: $event.target.value })"
        />
        <label :for="`solidcolor + ${media.metaFileName}`" v-if="!read_only && !preview_mode">
          {{
          $t("select_color")
          }}
        </label>
      </div>
      <div class="m_metaField">
        <div>{{ $t("duration") }}</div>
        <div class="m_mediaMontagePublication--set_props">
          <input
            type="number"
            v-model.number="seconds_per_image"
            step="1"
            :disabled="read_only || preview_mode"
          />
          <span>{{ $t("seconds") }}</span>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="m_mediaMontagePublication--withdraw"
      @click.stop.prevent="removePubliMedia()"
      v-if="!read_only && !preview_mode"
      :content="$t('withdraw')"
      v-tippy="{
        placement: 'top',
        delay: [600, 0],
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
        style="enable-background: new 0 0 37.2 37.2;"
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
    preview_mode: Boolean,
    read_only: Boolean,
    enable_image_timer: {
      type: Boolean,
      default: false,
    },
    enable_set_video_volume: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    MediaContent,
  },
  data() {
    return {
      mediaID: `${(Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      )}`,
      seconds_per_image: this.media.duration,
      volume: this.media.volume ? this.media.volume : 100,
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
    "media.duration": function() {
      if (this.enable_image_timer) {
        this.seconds_per_image = this.media.duration;
      }
    },
    seconds_per_image: function() {
      this.seconds_per_image = Math.min(
        999,
        Math.max(0, this.seconds_per_image)
      );
      if (this.media.duration !== this.seconds_per_image) {
        this.updateMediaPubliMeta({
          duration: this.seconds_per_image,
        });
      }
    },
    "media.volume": function() {
      if (this.enable_set_video_volume) {
        this.volume = this.media.volume;
        this.$refs.mediaContent.setVolume(this.volume);
      }
    },
    volume: function() {
      this.volume = Math.min(100, Math.max(0, this.volume));
      if (this.media.volume !== this.volume) {
        this.updateMediaPubliMeta({
          volume: this.volume,
        });
      }
    },
  },
  computed: {
    solid_color_background() {
      if (this.media.color) return `background-color: ${this.media.color}`;
      return `background-color: #000`;
    },
    original_media_duration() {
      if (
        this.media.hasOwnProperty("_linked_media") &&
        this.media._linked_media.duration
      ) {
        return this.$moment
          .utc(this.media._linked_media.duration * 1000)
          .format("mm:ss");
      }
      return false;
    },
    media_dimensions() {
      if (
        !this.media.hasOwnProperty("_linked_media") ||
        !this.media._linked_media.file_meta ||
        !this.media._linked_media.file_meta.find(m =>
          m.hasOwnProperty("width")
        ) ||
        !this.media._linked_media.file_meta.find(m =>
          m.hasOwnProperty("height")
        )
      )
        return false;

      return (
        this.media._linked_media.file_meta.find(m => m.hasOwnProperty("width"))
          .width +
        " × " +
        this.media._linked_media.file_meta.find(m => m.hasOwnProperty("height"))
          .height
      );
    },
  },
  methods: {
    updateMediaPubliMeta(val) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • MediaMontagePublication: updateMediaPubliMeta`);
      }
      this.$emit("editPubliMedia", {
        metaFileName: this.media.metaFileName,
        val,
      });
    },
    removePubliMedia() {
      this.$emit("removePubliMedia", {
        metaFileName: this.media.metaFileName,
      });
    },
    volumeChanged(val) {
      this.volume = val;
    },
  },
};
</script>
<style></style>
