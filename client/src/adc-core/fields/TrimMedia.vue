<template>
  <div class="_trimMedia">
    <vue-plyr ref="plyr">
      <video v-if="media.$type === 'video'" :src="media_full_path" />
      <audio v-else-if="media.$type === 'audio'" :src="media_full_path" />
    </vue-plyr>

    <div class="u-spacingBottom" />

    <ToggledSection
      :label="$t('extract_range')"
      :show_toggle.sync="show_extract_selection"
    >
      <div class="_currentTime">{{ current_time_displayed }} s</div>

      <div class="_startEndBlock">
        <div class="_startEndBlock--b" :key="selection_start">
          <button
            type="button"
            class="u-button u-button_bleumarine"
            :disabled="current_time === selection_start"
            @click="setStartOrEnd({ new_start: current_time })"
          >
            <b-icon icon="chevron-bar-left" />
            {{ $t("set_start") }}
          </button>
          <NumberInput
            :value="selection_start"
            :suffix="$t('seconds')"
            :size="'medium'"
            :min="0"
            @save="setStartOrEnd({ new_start: $event })"
          />
          <div class="u-sameRow">
            <button
              type="button"
              class="u-buttonLink"
              :disabled="selection_start === 0"
              @click="setStartOrEnd({ new_start: 0 })"
            >
              <b-icon icon="chevron-double-left" />
            </button>
            <button
              type="button"
              class="u-buttonLink"
              :disabled="selection_start <= 0"
              @click="setStartOrEnd({ new_start: selection_start - 0.1 })"
            >
              -0.1s
            </button>
            <button
              type="button"
              class="u-buttonLink"
              @click="setStartOrEnd({ new_start: selection_start + 0.1 })"
            >
              +0.1s
            </button>
          </div>
        </div>

        <b-icon icon="arrow-right-circle-fill" class="_arrowIcon" />

        <div class="_startEndBlock--b">
          <button
            type="button"
            class="u-button u-button_bleumarine"
            :disabled="current_time === selection_end"
            @click="setStartOrEnd({ new_end: current_time })"
          >
            {{ $t("set_end") }}
            <b-icon icon="chevron-bar-right" />
          </button>
          <NumberInput
            :value="selection_end"
            :suffix="$t('seconds')"
            :size="'medium'"
            :min="0"
            @save="setStartOrEnd({ new_end: $event })"
          />
          <div class="u-sameRow">
            <button
              type="button"
              class="u-buttonLink"
              @click="setStartOrEnd({ new_end: selection_end - 0.1 })"
            >
              -0.1s
            </button>
            <button
              type="button"
              class="u-buttonLink"
              @click="setStartOrEnd({ new_end: selection_end + 0.1 })"
            >
              +0.1s
            </button>
            <button
              type="button"
              class="u-buttonLink"
              :disabled="selection_end === media_duration || !media_duration"
              @click="setStartOrEnd({ new_end: media_duration })"
            >
              <b-icon icon="chevron-double-right" />
            </button>
          </div>
        </div>
      </div>

      <div class="_playExtract">
        <button
          v-if="!is_playing_extract"
          type="button"
          class="u-button u-button_orange"
          @click="playExtract"
        >
          <b-icon icon="play-circle-fill" />
          {{ $t("play_extract") }}
        </button>
        <button
          v-else
          type="button"
          class="u-button u-button_orange"
          @click="stopExtract"
        >
          <b-icon icon="stop-circle" />
          {{ $t("stop_extract") }}
        </button>
      </div>
    </ToggledSection>
  </div>
</template>
<script>
export default {
  props: {
    media: Object,
    extract_selection: Boolean,
    selection_start: Number,
    selection_end: Number,
  },
  components: {},
  data() {
    return {
      current_time: 0,
      is_playing_extract: false,
      show_extract_selection: this.extract_selection,

      media_duration: this.media.$infos?.duration || undefined,
    };
  },
  created() {},
  mounted() {
    this.$refs.plyr.player.on("timeupdate", (event) => {
      this.timeUpdate(event);
    });
  },
  beforeDestroy() {},
  watch: {
    selection_start: function (new_start) {
      this.$refs.plyr.player.currentTime = new_start;
      this.$refs.plyr.player.pause();
    },
    selection_end: function (new_end) {
      this.$refs.plyr.player.currentTime = new_end;
      this.$refs.plyr.player.pause();
    },
    show_extract_selection: function (new_value) {
      this.$emit("update:extract_selection", new_value);
    },
    current_time: function (new_value) {
      if (this.is_playing_extract) {
        if (this.current_time > this.selection_end) {
          this.is_playing_extract = false;
          this.$refs.plyr.player.currentTime = this.selection_end;
          this.$refs.plyr.player.pause();
        }
      }
    },
  },
  computed: {
    media_full_path() {
      return this.makeMediaFilePath({
        $path: this.media.$path,
        $media_filename: this.media.$media_filename,
        with_timestamp: true,
        $date_created: this.media.$date_created,
      });
    },
    current_time_displayed() {
      return parseFloat(this.current_time.toFixed(1)).toLocaleString(
        this.$i18n.locale
      );
    },
  },
  methods: {
    setStartOrEnd({ new_start, new_end }) {
      let start =
        typeof new_start !== "undefined" ? new_start : this.selection_start;
      let end = typeof new_end !== "undefined" ? new_end : this.selection_end;

      start = this.roundToDec(start, 1);
      start = Math.max(0, start);
      this.$emit("update:selection_start", start);

      end = this.roundToDec(end, 1);
      if (this.media_duration) end = Math.min(end, this.media_duration);
      this.$emit("update:selection_end", end);
    },
    timeUpdate(event) {
      this.current_time = this.roundToDec(
        event.detail.plyr.media.currentTime,
        1
      );
    },
    playExtract() {
      this.is_playing_extract = true;
      this.$refs.plyr.player.currentTime = this.selection_start;
      this.$refs.plyr.player.play();
    },
    stopExtract() {
      this.is_playing_extract = false;
      this.$refs.plyr.player.pause();
    },
  },
};
</script>
<style lang="scss" scoped>
._trimMedia {
  --plyr-audio-controls-background: var(--c-noir);
  --plyr-audio-control-color: white;

  ::v-deep .plyr:not(.plyr--fullscreen-enabled) .plyr__video-wrapper {
    video {
      max-height: 50vh;
    }
  }
}

._startEndBlock {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 1);
  margin: 0 auto;
  background-color: var(--c-noir);
}
._startEndBlock--b {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  // border: 2px solid var(--c-gris);
  margin: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);
  background-color: white;
}

._arrowIcon {
  color: white;
  font-size: var(--sl-font-size-large);
}
._currentTime {
  text-align: center;
  font-size: var(--sl-font-size-x-large);
  margin: 0 auto calc(var(--spacing) * 1);
}

._playExtract {
  display: flex;
  justify-content: center;
  margin: calc(var(--spacing) / 2) auto 0;
}
</style>
