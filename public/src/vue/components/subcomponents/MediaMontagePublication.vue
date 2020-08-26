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
      class="_advanced_menu_button _no_underline"
      :class="{ 'is--active': show_advanced_menu }"
      @mousedown.stop.prevent="
            show_advanced_menu = !show_advanced_menu;
          "
      @touchstart.stop.prevent="
            show_advanced_menu = !show_advanced_menu;
          "
    >
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width="168px"
        height="168px"
        viewBox="0 0 168 168"
        style="enable-background: new 0 0 168 168;"
        xml:space="preserve"
      >
        <rect x="73.5" y="37" class="st0" width="21" height="21" />
        <rect x="73.5" y="73.5" class="st0" width="21" height="21" />
        <rect x="73.5" y="110" class="st0" width="21" height="21" />
      </svg>
    </button>

    <div v-if="show_advanced_menu" class="_advanced_menu" @click.stop>
      <button
        type="button"
        v-if="media.hasOwnProperty('_linked_media')"
        class="buttonLink _no_underline"
        @mousedown.stop.prevent="editButtonClicked"
        @touchstart.stop.prevent="editButtonClicked"
        :content="$t('edit_original_media')"
        v-tippy="{
              placement: 'top',
              delay: [600, 0],
            }"
      >
        <svg
          version="1.1"
          class="inline-svg inline-svg-larger"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="113.5px"
          height="113.5px"
          viewBox="0 0 113.5 113.5"
          style="enable-background: new 0 0 113.5 113.5;"
          xml:space="preserve"
        >
          <path
            d="M8.9,104.6c11.8,11.8,31,11.8,42.8,0l16.9-16.9c-1.3,0.1-2.7,0.2-4,0.2c-4.3,0-8.4-0.7-12.4-2l-9.6,9.6
		c-3.3,3.3-7.7,5.1-12.3,5.1c-4.6,0-9-1.8-12.3-5.1c-3.3-3.3-5.1-7.6-5.1-12.3c0-4.6,1.8-9,5.1-12.3l18.7-18.7
		c3.3-3.3,7.7-5.1,12.3-5.1c4.7,0,9,1.8,12.3,5.1c1.6,1.6,2.8,3.4,3.7,5.5c2.1-0.1,10.6-7.5,10.6-7.5c-1.4-2.5-3.1-4.9-5.3-7.1
		c-11.8-11.8-31-11.8-42.8,0L8.9,61.8C-3,73.6-3,92.8,8.9,104.6z"
          />
          <path
            d="M48.8,25.5c4.3,0,8.5,0.7,12.5,2.1l9.6-9.6c3.3-3.3,7.7-5.1,12.3-5.1s9,1.8,12.3,5.1c3.3,3.3,5.1,7.7,5.1,12.3
		s-1.8,9-5.1,12.3L76.8,61.3c-3.3,3.3-7.7,5.1-12.3,5.1c-4.7,0-9-1.8-12.3-5.1c-1.6-1.6-2.9-3.5-3.7-5.5c-2.1,0.1-4.1,1-5.7,2.5
		l-5,5c1.4,2.5,3.1,4.9,5.3,7.1c11.8,11.8,31,11.8,42.8,0l18.7-18.7c11.8-11.8,11.8-31,0-42.8C92.8-3,73.7-3,61.8,8.9L45,25.7
		C46.2,25.6,47.5,25.5,48.8,25.5L48.8,25.5L48.8,25.5z"
          />
        </svg>
        <!-- {{ $t('edit') }} -->
      </button>

      <button
        type="button"
        class="buttonLink _no_underline"
        v-if="available_buttons.includes('duplicate')"
        @click.stop.prevent="duplicateMedia()"
      >
        <svg
          version="1.1"
          class="inline-svg"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="91.6px"
          height="95px"
          viewBox="0 0 91.6 95"
          style="enable-background: new 0 0 91.6 95;"
          xml:space="preserve"
        >
          <polygon
            class="st0"
            points="39.5,11.8 83,11.8 83,55.4 72.7,55.4 72.7,67.2 94.8,67.2 94.8,0 27.7,0 27.7,22.2 39.5,22.2 	"
          />
          <path
            class="st0"
            d="M67.2,27.7L0,27.7l0,67.2l67.2,0L67.2,27.7z M55.4,83l-43.6,0l0-43.6l43.6,0L55.4,83z"
          />
        </svg>
        <span class>{{ $t("duplicate") }}</span>
      </button>

      <button
        type="button"
        class="buttonLink _no_underline"
        v-if="available_buttons.includes('remove')"
        @click.stop.prevent="removePubliMedia()"
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
        {{ $t("withdraw") }}
      </button>
    </div>
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
    available_buttons: {
      type: Array,
      default: () => ["duplicate", "remove"],
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
      show_advanced_menu: false,
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
    "media.duration": function () {
      if (this.enable_image_timer) {
        this.seconds_per_image = this.media.duration;
      }
    },
    seconds_per_image: function () {
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
    "media.volume": function () {
      if (this.enable_set_video_volume) {
        this.volume = this.media.volume;
        this.$refs.mediaContent.setVolume(this.volume);
      }
    },
    volume: function () {
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
        !this.media._linked_media.file_meta.find((m) =>
          m.hasOwnProperty("width")
        ) ||
        !this.media._linked_media.file_meta.find((m) =>
          m.hasOwnProperty("height")
        )
      )
        return false;

      return (
        this.media._linked_media.file_meta.find((m) =>
          m.hasOwnProperty("width")
        ).width +
        " × " +
        this.media._linked_media.file_meta.find((m) =>
          m.hasOwnProperty("height")
        ).height
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
    editButtonClicked() {
      if (this.media.hasOwnProperty("_linked_media"))
        this.$root.openMedia({
          slugProjectName: this.media._linked_media.slugProjectName,
          metaFileName: this.media._linked_media.metaFileName,
        });
      else {
        this.inline_edit_mode = true;
        this.$nextTick(() => {
          if (this.$refs.textField && this.$refs.textField.$el)
            this.$refs.textField.$el.querySelector(".ql-editor").focus();
        });
      }
    },
    duplicateMedia() {
      this.$emit("duplicateMedia", {
        metaFileName: this.media.metaFileName,
      });
      this.show_advanced_menu = false;
    },
    removePubliMedia() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveMedia"),
          () => {
            this.$emit("removePubliMedia", {
              metaFileName: this.media.metaFileName,
            });
          },
          () => {}
        );
    },
    volumeChanged(val) {
      this.volume = val;
    },
  },
};
</script>
<style></style>
