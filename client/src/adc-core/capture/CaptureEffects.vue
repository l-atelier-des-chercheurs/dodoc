<template>
  <div class="m_captureEffects">
    <div class="_content">
      <div class="_options">
        <ToggleInput
          :content.sync="flip_horizontally"
          :label="$t('flip_horizontally')"
        />
        <ToggleInput
          :content.sync="flip_vertically"
          :label="$t('flip_vertically')"
        />
        <RangeValueInput
          :label="$t('zoom')"
          :value="zoom.value"
          :can_toggle="true"
          :min="zoom.min"
          :max="zoom.max"
          :step="zoom.step"
          :ticks="zoom.ticks"
          :default_value="zoom.default"
          @input="zoom.value = $event"
        />

        <ToggledSection
          class=""
          :label="$t('chroma_key')"
          :show_toggle.sync="chroma_key_settings.enable"
        >
          <fieldset>
            <legend class="u-label">{{ $t("chroma_key_color") }}</legend>

            <ColorInput
              :label="$t('color')"
              :can_toggle="false"
              :value="chroma_key_color_hex"
              @save="chroma_key_color_hex = $event"
            />
            <div>
              <button
                type="button"
                class="u-buttonLink"
                @click="setTogglePickColorFromVideo"
              >
                <template v-if="!enable_pick_color_from_video">
                  {{ $t("pick_color_in_video") }}
                </template>
                <template v-else>
                  {{ $t("click_in_video…") }}
                </template>
              </button>
            </div>

            <br />

            <div>
              <div class="">
                <label>{{ $t("similarity") }}</label>
                <input
                  class="margin-none"
                  type="range"
                  v-model.number="chroma_key_settings.similarity"
                  min="0"
                  max="0.2"
                  step="0.001"
                />
              </div>

              <div class="">
                <label>{{ $t("smoothness") }}</label>
                <input
                  class="margin-none"
                  type="range"
                  v-model.number="chroma_key_settings.smoothness"
                  min="0"
                  max="0.3"
                  step="0.001"
                />
              </div>

              <div class="">
                <label>{{ $t("spill") }}</label>
                <input
                  class="margin-none"
                  type="range"
                  v-model.number="chroma_key_settings.spill"
                  min="0"
                  max="0.5"
                  step="0.001"
                  value="0.1"
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="u-label">{{ $t("replace_color_with") }}</legend>

            <RadioCheckboxInput
              :value="chroma_key_settings.replacement_mode"
              :options="[
                {
                  label: $t('color'),
                  key: 'color',
                },
                {
                  label: $t('image'),
                  key: 'image',
                },
              ]"
              :can_edit="true"
              @update:value="chroma_key_settings.replacement_mode = $event"
            />

            <div v-if="chroma_key_settings.replacement_mode === 'image'">
              <img
                class="_imgPreview"
                :src="chroma_key_replacement_image_url"
              />
              <EditBtn
                :label="
                  !chroma_key_replacement_image_url ? $t('select') : $t('edit')
                "
                :is_unfolded="true"
                @click="select_image = true"
              />
              <ImageSelect
                v-if="select_image"
                :label="$t('image')"
                :project_path="project_path"
                @newPreview="newChromaKeyImage"
                @close="select_image = false"
              />
            </div>
            <div v-else>
              <ColorInput
                :can_toggle="false"
                :value="chroma_key_replacement_color_hex"
                @save="chroma_key_replacement_color_hex = $event"
              />
            </div>
          </fieldset>
        </ToggledSection>

        <div
          v-for="[name, props] in Object.entries(image_filters_settings)"
          :key="name"
        >
          <RangeValueInput
            :label="$t(name)"
            :value="image_filters_settings[name].value"
            :can_toggle="true"
            :min="props.min"
            :max="props.max"
            :step="props.step"
            :ticks="props.ticks"
            :default_value="props.default"
            @save="image_filters_settings[name].value = $event"
          />
        </div>

        <!-- <pre>
          {{ image_filters_settings }}
        </pre> -->
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    enable_effects: Boolean,
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    project_path: String,
  },
  components: {
    ImageSelect: () => import("@/adc-core/fields/ImageSelect.vue"),
  },
  data() {
    return {
      source_stream_resolution: {
        width: undefined,
        height: undefined,
      },

      flip_horizontally: false,
      flip_vertically: false,

      select_image: false,
      chroma_key_replacement_image_url: undefined,
      chroma_key_settings: {
        enable: false,
        key_color: {
          r: 0,
          g: 255,
          b: 0,
        }, // 0 -> 1 by 0.001
        similarity: 0.05, // 0 -> 0.2 by 0.001 (better default)
        smoothness: 0.12, // 0 -> 0.3 by 0.001 (better default)
        spill: 0.2, // 0 -> 0.5 by 0.001 (better default)
        replacement_color: {
          r: 252,
          g: 75,
          b: 96,
        },
        replacement_mode: "color",
        replacement_image: undefined,
      },

      zoom: {
        value: 1,
        min: 1,
        max: 10,
        step: 0.1,
        ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        default: 1,
      },

      image_filters_settings: {
        brightness: {
          value: 1,
          order: 0,
          default: 1,
          min: 0,
          max: 2,
          step: 0.01,
        },
        contrast: {
          value: 1,
          order: 1,
          default: 1,
          min: 0,
          max: 3,
          step: 0.01,
        },
        hue: {
          value: 0,
          order: 2,
          default: 0,
          min: -0.5,
          max: 0.5,
          step: 0.01,
        },
        saturation: {
          value: 0,
          order: 3,
          default: 0,
          min: -1,
          max: 1,
          step: 0.01,
        },
        lightness: {
          value: 0,
          order: 4,
          default: 0,
          min: -1,
          max: 1,
          step: 0.01,
        },
        dotscreen: {
          value: 10,
          order: 6,
          default: 10,
          min: 3,
          max: 20,
          step: 0.01,
        },
      },

      enable_pick_color_from_video: false,

      offscreen_canvas: undefined,

      fragment_shader: `
precision mediump float;
#define PI 3.1415926538

uniform sampler2D videoTex;
uniform float texWidth;
uniform float texHeight;

uniform float zoom;
uniform int flipHorizontally;
uniform int flipVertically;


uniform vec3 keyColor;
uniform vec3 replacementColor;
uniform sampler2D replacementImage;

uniform float similarity;
uniform float smoothness;
uniform float spill;
uniform int chromaKeyMode;

uniform float brightness;
uniform float contrast;
uniform float mid;

uniform float hue;
uniform float saturation;
uniform float lightness;

uniform float dotscreen;


// From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
vec2 RGBtoUV(vec3 rgb) {
  return vec2(
    rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
    rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
  );
}

vec4 ProcessChromaKey(vec2 texCoord, vec4 videoColor) {
  float chromaDist = distance(RGBtoUV(videoColor.rgb), RGBtoUV(keyColor));

  float baseMask = chromaDist - similarity;
  float fullMask = pow(clamp(baseMask / smoothness, 0., 1.), 1.5);
  videoColor.a = fullMask;

  float spillVal = pow(clamp(baseMask / spill, 0., 1.), 1.5);
  float desat = clamp(videoColor.r * 0.2126 + videoColor.g * 0.7152 + videoColor.b * 0.0722, 0., 1.);
  videoColor.rgb = mix(vec3(desat, desat, desat), videoColor.rgb, spillVal);

  return videoColor;
}
vec4 ApplyChromaKey(vec2 texCoord, vec4 videoColor)  {
  vec4 chromaVideoColor = ProcessChromaKey(texCoord, videoColor);

  vec4 replaceWith = vec4(0.0);
  if(chromaKeyMode == 0) {
    // color
    replaceWith = vec4(replacementColor, 1.0);
  } else if(chromaKeyMode == 1) {
    // image
    replaceWith = vec4(texture2D(replacementImage, texCoord));
  }

  vec4 result = mix(vec4(chromaVideoColor.rgb, 1.0), replaceWith, 1.0 - chromaVideoColor.a);
  return result;
}

vec3 RGBtoHCV(vec3 RGB) {
  float Epsilon = 0.00000000001;
  // Based on work by Sam Hocevar and Emil Persson
  vec4 P = (RGB.g < RGB.b) ? vec4(RGB.bg, -1.0, 2.0/3.0) : vec4(RGB.gb, 0.0, -1.0/3.0);
  vec4 Q = (RGB.r < P.x) ? vec4(P.xyw, RGB.r) : vec4(RGB.r, P.yzx);
  float C = Q.x - min(Q.w, Q.y);
  float H = abs((Q.w - Q.y) / (6.0 * C + Epsilon) + Q.z);
  return vec3(H, C, Q.x);
}
vec3 HUEtoRGB(float h) {
  float r = abs(h * 6.0 - 3.0) - 1.0;
  float g = 2.0 - abs(h * 6.0 - 2.0);
  float b = 2.0 - abs(h * 6.0 - 4.0);
  return clamp(vec3(r, g, b), 0.0, 1.0);
}

vec3 RGBtoHSL(vec3 RGB) {
  float Epsilon = 0.00000000001;
  vec3 HCV = RGBtoHCV(RGB);
  float L = HCV.z - HCV.y * 0.5;
  float S = HCV.y / (1.0 - abs(L * 2.0 - 1.0) + Epsilon);
  return vec3(HCV.x, S, L);
}
vec3 HSLtoRGB(vec3 HSL) {
  vec3 RGB = HUEtoRGB(HSL.x);
  float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
  return (RGB - 0.5) * C + HSL.z;
}
float clamp_continuous(float value) {
  float unit = value;

  if (unit > 1.0) {
    unit = mod(unit, 1.0);
  } else if (unit < 0.0) {
    unit = 1.0 + unit;
  }

  return unit;
}

float mix_factor(vec4 range, vec3 hsl) {
  float mix_factor = 0.0;

  if (hsl.x >= range.x && hsl.x <= range.w) {
    // lower range
    if (hsl.x >= range.x && hsl.x < range.y) {
      mix_factor = smoothstep(range.x, range.y, hsl.x);
    }

    // target range
    if (hsl.x >= range.y && hsl.x <= range.z) {
      mix_factor = 1.0;
    }

    // upper range
    if (hsl.x > range.z && hsl.x <= range.w) {
      mix_factor = 1.0 - smoothstep(range.z, range.w, hsl.x);
    }
  }

  vec2 lightness_range = vec2(0.0, 0.08333);
  vec2 saturation_range = vec2(0.0, 0.08333);
  mix_factor *= smoothstep(saturation_range.x, saturation_range.y, hsl.y);
  mix_factor *= smoothstep(lightness_range.x, lightness_range.y, hsl.z);

  return mix_factor;
}

float pattern(vec2 texCoord) {
  float angle = PI / 8.0;
  float s = sin(angle), c = cos(angle);
  vec2 tex = texCoord * vec2(texWidth, texHeight) - vec2(0.5, 0.5);
  vec2 point = vec2(
      c * tex.x - s * tex.y,
      s * tex.x + c * tex.y
  ) * (PI / dotscreen);
  return (sin(point.x) * sin(point.y)) * 4.0;
}

void main(void) {
  // get video image
  vec2 texCoord = vec2(gl_FragCoord.x/texWidth, 1.0 - (gl_FragCoord.y/texHeight));

  if(flipVertically == 1)
    texCoord.y = 1.0 - texCoord.y;
  if(flipHorizontally == 1)
    texCoord.x = 1.0 - texCoord.x;

  // Apply zoom - center around 0.5, scale, then translate back
  texCoord.x = (texCoord.x - 0.5) / zoom + 0.5;
  texCoord.y = (texCoord.y - 0.5) / zoom + 0.5;

  // Check if coordinates are out of bounds after zoom
  if(texCoord.x < 0.0 || texCoord.x > 1.0 || texCoord.y < 0.0 || texCoord.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec4 videoColor = texture2D(videoTex, texCoord);

  // apply chroma key if necessary
  if (chromaKeyMode != -1000) {
    videoColor = ApplyChromaKey(texCoord, videoColor);
  }

  // apply brightness, from https://github.com/actionnick/exposure/blob/master/src/shaders/exposure.frag
  if(brightness != -1000.0) {
    videoColor = mix(videoColor, vec4(1.0, 1.0, 1.0, 1.0), brightness - 1.0);
    videoColor.a = 1.0;
  }

  // contrast
  if(contrast != -1000.0) {
    videoColor.r = ((videoColor.r - mid) * contrast) + mid;
    videoColor.g = ((videoColor.g - mid) * contrast) + mid;
    videoColor.b = ((videoColor.b - mid) * contrast) + mid;
    videoColor.a = 1.0;
  }

  // hue, saturation, lightness
  if(hue != -1000.0 || saturation != -1000.0 || lightness != -1000.0) {
    vec3 hsl = RGBtoHSL(videoColor.rgb);
    vec4 MASTER_RANGE = vec4(0.0, 0.0, 1.0, 1.0);

    float master_mix_factor = mix_factor(MASTER_RANGE, hsl);
    // hue
    if(hue != -1000.0) {
      hsl.x = clamp_continuous(hsl.x + (hue * master_mix_factor));
    }
    // saturation
    if(saturation != -1000.0) {
      hsl.y = clamp(hsl.y + (saturation * master_mix_factor), 0.0, 1.0);
    }
    // lightness
    if(lightness != -1000.0) {
      hsl.z = clamp(mix(hsl.z, 1.0, max(0.0, lightness)), 0.0, 1.0);
      hsl.z = clamp(mix(hsl.z, 0.0, abs(min(0.0, lightness))), 0.0, 1.0);
    }

    videoColor.rgb = HSLtoRGB(hsl);
  }

  if(dotscreen != -1000.0) {
    float average = (videoColor.r + videoColor.g + videoColor.b) / 3.0;
    videoColor = vec4(vec3(average * 10.0 - 5.0 + pattern(texCoord)), videoColor.a);
  }

  gl_FragColor = videoColor;

}
      `,
    };
  },
  created() {},
  updated() {},
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
    this.stopWebGL();
  },
  watch: {
    enable_effects() {
      if (!this.enable_effects) this.disableAllEffects();

      // if (this.enable__ !== this.enable_effects) {
      //   this.enable__ = this.enable_effects;
      // }
    },
    enable__() {
      this.$emit("update:enable_effects", this.enable__);
      if (this.enable__) {
        this.$nextTick(() => {
          this.startWebGL();
        });
      }
    },
    "chroma_key_settings.replacement_mode"() {
      if (this.chroma_key_settings.replacement_mode === "image") {
        this.chroma_key_replacement_image_url = undefined;
        this.select_image = true;
      }
    },
  },
  computed: {
    enable__() {
      return (
        this.flip_vertically === true ||
        this.flip_horizontally === true ||
        this.zoom.value !== this.zoom.default ||
        this.chroma_key_settings.enable === true ||
        Object.keys(this.image_filters_settings).some(
          (ifs) =>
            this.image_filters_settings[ifs].value !==
            this.image_filters_settings[ifs].default
        )
      );
    },
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
        return this.rgbToHex(this.chroma_key_settings.replacement_color);
      },
      set(value) {
        this.chroma_key_settings.replacement_color = this.hexToRgb(value);
      },
    },
  },
  methods: {
    disableAllEffects() {
      this.flip_vertically = false;
      this.flip_horizontally = false;
      this.zoom.value = 1;
      this.chroma_key_settings.enable = false;

      Object.keys(this.image_filters_settings).map((ifs) => {
        this.image_filters_settings[ifs].value =
          this.image_filters_settings[ifs].default;
      });
    },
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
        // this.chroma_key_settings.enable = false;
        // this.enable__ = true;
        this.enable_pick_color_from_video = true;
      } else {
        // this.chroma_key_settings.enable = true;
        this.enable_pick_color_from_video = false;
      }
    },
    pixelColorUnderMouse({ px_color, type }) {
      if (!this.enable_pick_color_from_video) return;

      this.chroma_key_settings.key_color = px_color;
      if (type === "click") this.setTogglePickColorFromVideo();
    },
    startWebGL() {
      console.log(`CaptureEffects • METHODS : startWebGL`);

      if (this.offscreen_canvas) this.stopWebGL();

      this.offscreen_canvas = document.createElement("canvas");
      this.offscreen_canvas.classList.add("offscreenCanvas");

      var destination_canvas = this.canvasElement.getContext("2d");

      const gl = this.offscreen_canvas.getContext("webgl", {
        premultipliedAlpha: false,
      });

      // setting default vertex shader
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(
        vs,
        "attribute vec2 c; void main(void) { gl_Position=vec4(c, 0.0, 1.0); }"
      );
      gl.compileShader(vs);

      // setting default fragment shader
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

      gl.activeTexture(gl.TEXTURE0 + 0);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      const videoTexLoc = gl.getUniformLocation(prog, "videoTex");
      gl.uniform1i(videoTexLoc, 0);

      const texWidthLoc = gl.getUniformLocation(prog, "texWidth");
      const texHeightLoc = gl.getUniformLocation(prog, "texHeight");

      const zoomLoc = gl.getUniformLocation(prog, "zoom");

      const flipHorizontallyLoc = gl.getUniformLocation(
        prog,
        "flipHorizontally"
      );
      const flipVerticallyLoc = gl.getUniformLocation(prog, "flipVertically");

      const keyColorLoc = gl.getUniformLocation(prog, "keyColor");
      const replacementColorLoc = gl.getUniformLocation(
        prog,
        "replacementColor"
      );
      const replacementImageLoc = gl.getUniformLocation(
        prog,
        "replacementImage"
      );
      gl.uniform1i(replacementImageLoc, 1);

      const similarityLoc = gl.getUniformLocation(prog, "similarity");
      const smoothnessLoc = gl.getUniformLocation(prog, "smoothness");
      const spillLoc = gl.getUniformLocation(prog, "spill");
      const chromaKeyModeLoc = gl.getUniformLocation(prog, "chromaKeyMode");
      const midLoc = gl.getUniformLocation(prog, "mid");

      const imageFiltersLoc = Object.keys(this.image_filters_settings).reduce(
        (acc, _s) => {
          acc[_s] = gl.getUniformLocation(prog, _s);
          return acc;
        },
        {}
      );

      this.loadReplacementImageInShader();

      const processFrame = () => {
        if (!this.offscreen_canvas || !this.enable__) return;

        console.log(`CaptureEffects • METHODS : startWebGL • processFrame`);

        this.offscreen_canvas.width = this.videoElement.videoWidth;
        this.offscreen_canvas.height = this.videoElement.videoHeight;

        // LOADING VIDEO IMAGE TO WEBGL
        gl.activeTexture(gl.TEXTURE0 + 0);
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
        // STOPPED LOADING WEBGL IMAGE

        gl.uniform1f(zoomLoc, this.zoom.value);

        gl.uniform1f(texWidthLoc, this.videoElement.videoWidth);
        gl.uniform1f(texHeightLoc, this.videoElement.videoHeight);

        gl.uniform1i(flipHorizontallyLoc, this.flip_horizontally ? 1 : 0);
        gl.uniform1i(flipVerticallyLoc, this.flip_vertically ? 1 : 0);

        gl.uniform3f(
          keyColorLoc,
          this.chroma_key_settings.key_color.r / 255,
          this.chroma_key_settings.key_color.g / 255,
          this.chroma_key_settings.key_color.b / 255
        );
        gl.uniform3f(
          replacementColorLoc,
          this.chroma_key_settings.replacement_color.r / 255,
          this.chroma_key_settings.replacement_color.g / 255,
          this.chroma_key_settings.replacement_color.b / 255
        );

        gl.uniform1f(
          similarityLoc,
          parseFloat(this.chroma_key_settings.similarity)
        );
        gl.uniform1f(
          smoothnessLoc,
          parseFloat(this.chroma_key_settings.smoothness)
        );
        gl.uniform1f(spillLoc, parseFloat(this.chroma_key_settings.spill));

        Object.entries(imageFiltersLoc).map(([name, loc]) => {
          gl.uniform1f(
            loc,
            parseFloat(
              this.image_filters_settings[name].value !==
                this.image_filters_settings[name].default
                ? this.image_filters_settings[name].value
                : -1000
            )
          );
        });
        gl.uniform1f(midLoc, parseFloat(0.5));

        // check if chroma_key_settings.enable
        // -1000 = false
        let chromaKeyMode = -1000;
        if (this.chroma_key_settings.enable) {
          if (this.chroma_key_settings.replacement_mode === "color") {
            chromaKeyMode = 0;
          } else if (this.chroma_key_settings.replacement_mode === "image") {
            chromaKeyMode = 1;
          }
        }
        gl.uniform1i(chromaKeyModeLoc, parseInt(chromaKeyMode));

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        destination_canvas.drawImage(this.offscreen_canvas, 0, 0);

        window.requestAnimationFrame(processFrame);
      };
      window.requestAnimationFrame(processFrame);
    },
    stopWebGL() {
      this.offscreen_canvas = undefined;
    },
    async newChromaKeyImage(blob) {
      console.log(`CaptureEffects • METHODS : newChromaKeyImage`);

      if (!blob) {
        this.chroma_key_settings.replacement_image = undefined;
        this.chroma_key_replacement_image_url = undefined;
        this.loadReplacementImageInShader();
        return;
      }

      const img = await createImageBitmap(blob);
      this.chroma_key_replacement_image_url = URL.createObjectURL(blob);

      // let img_el = new Image();
      // img_el.src = img;

      // try {
      //   await img_el.decode();
      // } catch (e) {
      //   console.error(e);
      // }

      const canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");

      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;

      const type = "cover";

      const img_ratio = img.height / img.width;
      const c_ratio = canvas.height / canvas.width;
      if (
        (img_ratio < c_ratio && type === "contain") ||
        (img_ratio > c_ratio && type === "cover")
      ) {
        const h = canvas.width * img_ratio;
        ctx.drawImage(img, 0, (canvas.height - h) / 2, canvas.width, h);
      }
      if (
        (img_ratio > c_ratio && type === "contain") ||
        (img_ratio < c_ratio && type === "cover")
      ) {
        const w = (canvas.width * c_ratio) / img_ratio;
        ctx.drawImage(img, (canvas.width - w) / 2, 0, w, canvas.height);
      }

      this.chroma_key_settings.replacement_image = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      this.loadReplacementImageInShader();

      canvas.remove();
    },
    getMediaSrcFromPath(path_to_source_media_meta) {
      const file = this.getMediaInFolder({
        path_to_source_media_meta,
      });
      const path_to_project = this.getParent(file.$path);
      return this.makeRelativeURLFromThumbs({
        $thumbs: file.$thumbs,
        $type: file.$type,
        $path: path_to_project,
        resolution: 1600,
      });
    },
    loadReplacementImageInShader() {
      const gl = this.offscreen_canvas.getContext("webgl", {
        premultipliedAlpha: false,
      });

      gl.activeTexture(gl.TEXTURE1);
      const tex2 = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex2);

      // gl.texImage2D(
      //   gl.TEXTURE_2D,
      //   0,
      //   gl.RGBA,
      //   1,
      //   1,
      //   0,
      //   gl.RGBA,
      //   gl.UNSIGNED_BYTE,
      //   new Uint8Array([0, 0, 255, 255])
      // );

      if (this.chroma_key_settings.replacement_image)
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          this.chroma_key_settings.replacement_image
        );

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    },
  },
};
</script>
<style lang="scss" scoped>
.m_captureEffects {
  ._content {
    // background-color: #fff;
    // border-radius: 4px;
    // padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2);

    ._options {
      background: rgba(0, 0, 0, 0.1);
      padding: calc(var(--spacing) / 2);
      border-radius: 6px;

      > * {
        // margin: 0 calc(var(--spacing) / 4) calc(var(--spacing) / 2);
        margin: calc(var(--spacing) / 2) 0;
        padding: calc(var(--spacing) / 2);
        background-color: white;
        border-radius: 4px;

        &:first-child {
          margin-top: 0;
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.is--disabled {
  filter: grayscale(100%);
  opacity: 0.7;
  cursor: not-allowed;
  user-select: none;

  > * {
    pointer-events: none;
  }
}
</style>
