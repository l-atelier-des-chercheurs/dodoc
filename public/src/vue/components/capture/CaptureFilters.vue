<template>
  <div class="m_captureEffects">
    <div class="">
      <div class="switch switch-xs">
        <input
          class="switch"
          id="enable_filters"
          type="checkbox"
          @change="$emit('update:enable_filters', $event.target.checked)"
        />
        <label for="enable_filters">{{ $t("enable_filters") }}</label>
      </div>

      <div>
        <label>{{ $t("chroma_key(greenscreen)") }}</label>
        <div class="switch switch-xs">
          <input
            class="switch"
            id="chroma_key"
            type="checkbox"
            v-model="enable_chroma_key"
          />
          <label for="chroma_key">{{ $t("enable") }}</label>
        </div>
        {{ enable_chroma_key }}
        <div>
          <label>{{ $t("color") }}</label>
          <input
            type="color"
            v-model="chroma_key_color_hex"
            :novalue="chroma_key_color_hex === ''"
          />
        </div>
        <div>
          <button type="button" @click="setTogglePickColorFromVideo">
            <template v-if="!enable_pick_color_from_video">
              {{ $t("pick_color_in_video") }}
            </template>
            <template v-else>
              {{ $t("click_in_video…") }}
            </template>
          </button>
        </div>

        <div>
          <label>{{ $t("delta") }}</label>
          <input
            class="margin-none"
            type="range"
            v-model.number="chroma_key_delta"
            min="0"
            max="255"
            step="1"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    stream_lastImageData: ImageData,
    enable_filters: Boolean,
  },
  components: {},
  data() {
    return {
      enable_chroma_key: true,

      chroma_key_color: {
        r: 0,
        g: 255,
        b: 0,
      },
      chroma_key_delta: 50,

      enable_pick_color_from_video: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on(
      "captureCanvas.updateSelectedColor",
      this.updateSelectedColor
    );
  },
  beforeDestroy() {
    this.$eventHub.$off(
      "captureCanvas.updateSelectedColor",
      this.updateSelectedColor
    );
  },
  watch: {
    stream_lastImageData() {
      const frame = this.stream_lastImageData;

      this.processChromaKey(frame);

      this.$emit("updateImageData", frame);
    },
  },
  computed: {
    chroma_key_color_hex: {
      get() {
        return this.rgbToHex(this.chroma_key_color);
      },
      set(value) {
        debugger;
        this.chroma_key_color = this.hexToRgb(value);
      },
    },
  },
  methods: {
    hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    },
    rgbToHex({ r, g, b }) {
      r = r.toString(16);
      g = g.toString(16);
      b = b.toString(16);

      if (r.length == 1) r = "0" + r;
      if (g.length == 1) g = "0" + g;
      if (b.length == 1) b = "0" + b;

      return "#" + r + g + b;
    },
    setTogglePickColorFromVideo() {
      if (!this.enable_pick_color_from_video) {
        this.enable_chroma_key = false;
        this.enable_pick_color_from_video = true;
      } else {
        this.enable_chroma_key = true;
        this.enable_pick_color_from_video = false;
      }
    },
    updateSelectedColor(c) {
      if (!this.enable_pick_color_from_video) return;

      this.chroma_key_color = c;
      this.setTogglePickColorFromVideo();
    },
    processChromaKey(frame) {
      if (!this.enable_chroma_key) return frame;

      let l = frame.data.length / 4;
      const key = this.chroma_key_color;
      const d = 255 - this.chroma_key_delta;

      if (key)
        for (let i = 0; i < l; i++) {
          let r = frame.data[i * 4 + 0];
          let g = frame.data[i * 4 + 1];
          let b = frame.data[i * 4 + 2];

          if (
            Math.abs(r - key.r) < 250 - d &&
            Math.abs(g - key.g) < 250 - d &&
            Math.abs(b - key.b) < 250 - d
          )
            frame.data[i * 4 + 3] = 0;
        }
      else if (this.$root.state.dev_mode === "debug")
        console.log(
          `CaptureFilters • METHODS : stream_lastImageData • no rgb color defined`
        );

      return frame;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_captureEffects {
  position: relative;
  flex: 1 0 200px;
  max-width: 280px;
  background-color: var(--c-bleumarine);
  padding: calc(var(--spacing) / 8);

  label {
    display: block;
  }

  > * {
    background-color: #fff;
    border-radius: 4px;
    margin: calc(var(--spacing) / 4);
    padding: calc(var(--spacing) / 8);

    > * {
      margin-top: calc(var(--spacing) / 2);
      padding: calc(var(--spacing) / 4);
      margin: calc(var(--spacing) / 4);
      background-color: var(--c-gris-clair);

      &:first-child {
        // margin-top: 0;
        // padding-top: 0;
        background-color: transparent;
      }
    }
  }
}
</style>
