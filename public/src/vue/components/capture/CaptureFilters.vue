<template>
  <div class="m_captureEffects">
    <div class="">
      <div class="switch switch-xs">
        <input
          class="switch"
          id="enable_filters"
          type="checkbox"
          v-model="enable"
        />
        <label for="enable_filters">{{ $t("enable_filters") }}</label>
      </div>

      <div v-if="enable_filters">
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

        <label>Remplacer la couleur par…</label>

        <div class="switch switch-xs switch_twoway">
          <label
            for="chroma_key_use_image"
            class="cursor-pointer"
            :class="{
              'is--active': !chroma_key_use_image,
            }"
          >
            <span class>{{ $t("color") }}</span>
          </label>
          <input
            type="checkbox"
            id="chroma_key_use_image"
            v-model="chroma_key_use_image"
          />
          <label
            for="chroma_key_use_image"
            :class="{
              'is--active': chroma_key_use_image,
            }"
          >
            <span class>{{ $t("image") }}</span>
          </label>
        </div>

        <div v-if="chroma_key_use_image">
          <ImageSelect
            :load_from_projects_medias="true"
            @newPreview="newChromaKeyImage"
          />
        </div>
        <div v-else>
          <label>{{ $t("color") }}</label>
          <input
            type="color"
            v-model="chroma_key_replacement_color_hex"
            :novalue="chroma_key_replacement_color_hex === ''"
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
      enable: this.enable_filters,
      enable_chroma_key: true,

      source_stream_resolution: {
        width: undefined,
        height: undefined,
      },

      chroma_key_color: {
        r: 0,
        g: 255,
        b: 0,
      },
      chroma_key_delta: 50,

      chroma_key_use_image: false,
      chroma_key_imageData: undefined,

      chroma_key_replacement_color: {
        r: 255,
        g: 255,
        b: 255,
      },

      enable_pick_color_from_video: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on(
      "captureCanvas.pixelColorUnderMouse",
      this.pixelColorUnderMouse
    );
  },
  beforeDestroy() {
    this.$eventHub.$off(
      "captureCanvas.pixelColorUnderMouse",
      this.pixelColorUnderMouse
    );
  },
  watch: {
    stream_lastImageData() {
      if (!this.stream_lastImageData || !this.stream_lastImageData.data)
        return false;

      const frame = this.stream_lastImageData;
      this.source_stream_resolution.width = frame.width;
      this.source_stream_resolution.height = frame.height;

      this.processChromaKey(frame);

      this.$emit("updateImageData", frame);
    },
    enable_filters() {
      if (this.enable !== this.enable_filters)
        this.enable = this.enable_filters;
    },
    enable() {
      this.$emit("update:enable_filters", this.enable);
    },
  },
  computed: {
    chroma_key_color_hex: {
      get() {
        return this.rgbToHex(this.chroma_key_color);
      },
      set(value) {
        this.chroma_key_color = this.hexToRgb(value);
      },
    },
    chroma_key_replacement_color_hex: {
      get() {
        return this.rgbToHex(this.chroma_key_replacement_color);
      },
      set(value) {
        this.chroma_key_replacement_color = this.hexToRgb(value);
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
        this.enable = true;
        this.enable_pick_color_from_video = true;
      } else {
        this.enable_chroma_key = true;
        this.enable_pick_color_from_video = false;
      }
    },
    pixelColorUnderMouse({ px_color, type }) {
      if (!this.enable_pick_color_from_video) return;

      this.chroma_key_color = px_color;
      if (type === "click") this.setTogglePickColorFromVideo();
    },
    processChromaKey(frame) {
      if (!this.enable_chroma_key) return frame;

      // todo : checkbox to enable webgl greenscreen
      // https://jameshfisher.com/2020/08/11/production-ready-green-screen-in-the-browser/

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
          ) {
            if (!this.chroma_key_use_image) {
              // frame.data[i * 4 + 3] = this.chroma_key_replacement_color;
              frame.data[i * 4 + 0] = this.chroma_key_replacement_color.r;
              frame.data[i * 4 + 1] = this.chroma_key_replacement_color.g;
              frame.data[i * 4 + 2] = this.chroma_key_replacement_color.b;
            } else if (
              this.chroma_key_imageData &&
              this.chroma_key_imageData.data
            ) {
              try {
                frame.data[i * 4 + 0] = this.chroma_key_imageData.data[
                  i * 4 + 0
                ];
                frame.data[i * 4 + 1] = this.chroma_key_imageData.data[
                  i * 4 + 1
                ];
                frame.data[i * 4 + 2] = this.chroma_key_imageData.data[
                  i * 4 + 2
                ];
              } catch (e) {
                console.log(
                  `CaptureFilters • METHODS : processChromaKey • failed to use chroma_key_image value`
                );
              }
            } else frame.data[i * 4 + 3] = 0;
          }
        }
      else if (this.$root.state.dev_mode === "debug")
        console.log(
          `CaptureFilters • METHODS : processChromaKey • no chroma_key color defined`
        );

      return frame;
    },
    newChromaKeyImage(img) {
      console.log(`CaptureFilters • METHODS : newChromaKeyImage`);

      var imageElement = new Image();

      if (typeof img === "string") imageElement.src = img;
      else if (typeof img === "object") imageElement.src = img.thumb;

      imageElement.onload = () => {
        const canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d");

        canvas.width = this.source_stream_resolution.width;
        canvas.height = this.source_stream_resolution.height;

        const coverImg = (img, type, c_width, c_height) => {
          const img_ratio = img.height / img.width;
          const c_ratio = c_height / c_width;
          if (
            (img_ratio < c_ratio && type === "contain") ||
            (img_ratio > c_ratio && type === "cover")
          ) {
            const h = c_width * img_ratio;
            ctx.drawImage(img, 0, (c_height - h) / 2, c_width, h);
          }
          if (
            (img_ratio > c_ratio && type === "contain") ||
            (img_ratio < c_ratio && type === "cover")
          ) {
            const w = (c_width * c_ratio) / img_ratio;
            ctx.drawImage(img, (c_width - w) / 2, 0, w, c_height);
          }
        };

        coverImg(imageElement, "cover", canvas.width, canvas.height);

        this.chroma_key_imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.parentNode.removeChild(canvas);
      };
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
