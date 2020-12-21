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

      <div
        :class="{
          'is--disabled': !enable_filters,
        }"
      >
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
          <label>{{ $t("similarity") }}</label>
          <input
            class="margin-none"
            type="range"
            v-model.number="chroma_key_settings.similarity"
            min="0"
            max="1"
            step="0.001"
          />

          <label>{{ $t("smoothness") }}</label>
          <input
            class="margin-none"
            type="range"
            v-model.number="chroma_key_settings.smoothness"
            min="0"
            max="1"
            step="0.001"
          />

          <label>{{ $t("spill") }}</label>
          <input
            class="margin-none"
            type="range"
            v-model.number="chroma_key_settings.spill"
            min="0"
            max="1"
            step="0.001"
            value="0.1"
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
    enable_filters: Boolean,
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
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

      chroma_key_settings: {
        key_color: {
          r: 0,
          g: 255,
          b: 0,
        }, // 0 -> 1 by 0.001
        similarity: 0.4, // 0 -> 1 by 0.001
        smoothness: 0.08, // 0 -> 1 by 0.001
        spill: 0.1, // 0 -> 1 by 0.001
      },

      chroma_key_use_image: false,
      chroma_key_imageData: undefined,

      chroma_key_replacement_color: {
        r: 255,
        g: 255,
        b: 255,
      },

      enable_pick_color_from_video: false,

      fragment_shader: `
precision mediump float;

uniform sampler2D tex;
uniform float texWidth;
uniform float texHeight;

uniform vec3 keyColor;
uniform float similarity;
uniform float smoothness;
uniform float spill;

// From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
vec2 RGBtoUV(vec3 rgb) {
  return vec2(
    rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
    rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
  );
}

vec4 ProcessChromaKey(vec2 texCoord) {
  vec4 rgba = texture2D(tex, texCoord);
  float chromaDist = distance(RGBtoUV(texture2D(tex, texCoord).rgb), RGBtoUV(keyColor));

  float baseMask = chromaDist - similarity;
  float fullMask = pow(clamp(baseMask / smoothness, 0., 1.), 1.5);
  rgba.a = fullMask;

  float spillVal = pow(clamp(baseMask / spill, 0., 1.), 1.5);
  float desat = clamp(rgba.r * 0.2126 + rgba.g * 0.7152 + rgba.b * 0.0722, 0., 1.);
  rgba.rgb = mix(vec3(desat, desat, desat), rgba.rgb, spillVal);

  return rgba;
}

void main(void) {
  vec2 texCoord = vec2(gl_FragCoord.x/texWidth, 1.0 - (gl_FragCoord.y/texHeight));
  vec4 videoColor = ProcessChromaKey(texCoord);
  vec4 colorA = vec4(0.149,0.141,0.912, 1.);
  gl_FragColor = mix(videoColor, colorA, vec4(0.));
}
      `,
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
    enable_filters() {
      if (this.enable !== this.enable_filters) {
        this.enable = this.enable_filters;
      }
    },
    enable() {
      this.$emit("update:enable_filters", this.enable);
      if (this.enable) {
        this.startChromaKey();
      }
    },
    fragment_shader() {},
  },
  computed: {
    chroma_key_color_hex: {
      get() {
        return this.rgbToHex(this.chroma_key_settings.key_color);
      },
      set(value) {
        this.chroma_key_settings.key_color = this.hexToRgb(value);
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

      this.chroma_key_settings.key_color = px_color;
      if (type === "click") this.setTogglePickColorFromVideo();
    },
    processChromaKey(frame) {
      // todo : checkbox to enable webgl greenscreen
      // https://jameshfisher.com/2020/08/11/production-ready-green-screen-in-the-browser/

      let l = frame.data.length / 4;
      const key = this.chroma_key_settings.key_color;
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
    startChromaKey() {
      const webcamVideoEl = this.videoElement;
      const displayCanvasEl = this.canvasElement;

      console.log(`CaptureFilters • METHODS : startChromaKey`);

      if (!displayCanvasEl) {
        console.log(`CaptureFilters • METHODS : startChromaKey / no canvas`);
        return;
      }

      const gl = displayCanvasEl.getContext("webgl", {
        premultipliedAlpha: false,
      });

      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(
        vs,
        "attribute vec2 c; void main(void) { gl_Position=vec4(c, 0.0, 1.0); }"
      );
      gl.compileShader(vs);

      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, this.fragment_shader);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fs));
      }

      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const vb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vb);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );

      const coordLoc = gl.getAttribLocation(prog, "c");
      gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(coordLoc);

      gl.activeTexture(gl.TEXTURE0);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      const texLoc = gl.getUniformLocation(prog, "tex");
      const texWidthLoc = gl.getUniformLocation(prog, "texWidth");
      const texHeightLoc = gl.getUniformLocation(prog, "texHeight");
      const keyColorLoc = gl.getUniformLocation(prog, "keyColor");
      const similarityLoc = gl.getUniformLocation(prog, "similarity");
      const smoothnessLoc = gl.getUniformLocation(prog, "smoothness");
      const spillLoc = gl.getUniformLocation(prog, "spill");

      const processFrame = () => {
        displayCanvasEl.width = this.videoElement.videoWidth;
        displayCanvasEl.height = this.videoElement.videoHeight;
        gl.viewport(
          0,
          0,
          this.videoElement.videoWidth,
          this.videoElement.videoHeight
        );
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          this.videoElement
        );
        gl.uniform1i(texLoc, 0);
        gl.uniform1f(texWidthLoc, this.videoElement.videoWidth);
        gl.uniform1f(texHeightLoc, this.videoElement.videoHeight);

        const m = this.chroma_key_settings.key_color;
        gl.uniform3f(keyColorLoc, m.r / 255, m.g / 255, m.b / 255);
        gl.uniform1f(
          similarityLoc,
          parseFloat(this.chroma_key_settings.similarity)
        );
        gl.uniform1f(
          smoothnessLoc,
          parseFloat(this.chroma_key_settings.smoothness)
        );
        gl.uniform1f(spillLoc, parseFloat(this.chroma_key_settings.spill));

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        window.requestAnimationFrame(processFrame);
      };
      window.requestAnimationFrame(processFrame);
    },
    newChromaKeyImage(img) {
      console.log(`CaptureFilters • METHODS : newChromaKeyImage`);

      var imageElement = new Image();

      if (typeof img === "string") imageElement.src = img;
      else if (typeof img === "object") imageElement.src = img.thumb;

      imageElement.onload = () => {
        const canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d");

        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;

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

.is--disabled {
  filter: grayscale(100%);
  opacity: 0.7;
  cursor: not-allowed;

  > * {
    pointer-events: none;
  }
}
</style>
