<template>
  <div class="m_lines">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="`0 0 ${svg_width} ${svg_height}`"
      ref="pattern"
      stroke-linecap="round"
      stroke="#000"
      stroke-width="1"
    >
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="#ffffff"
        stroke="#ff0000"
      />
      <!-- :width="svg_width"
      :height="svg_height" -->
      <line
        v-for="line in lines_array"
        :key="`${line.posX}_${line.posY}`"
        :x1="-line.length / 2"
        :y1="0"
        :x2="line.length / 2"
        :y2="0"
        :transform="`translate(${line.posX}, ${line.posY}) rotate(${angle} 0 0)`"
      />
    </svg>
    <canvas ref="invisible_canvas" v-show="false" />
  </div>
</template>
<script>
export default {
  props: {
    last_frame_from_video: Blob,
    angle: {
      type: Number,
      default: 116,
    },
    boost_brightness: {
      type: Number,
      default: 1,
    },
    boost_contrast: {
      type: Number,
      default: 1,
    },
    density: {
      type: Number,
      default: 0.2,
    },
  },
  components: {},
  data() {
    return {
      pixel_array: [],

      // for each pixel create this many lines

      is_processing_image: false,

      svg_width: 600,
      svg_height: 400,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    last_frame_from_video() {
      if (
        this.last_frame_from_video &&
        this.last_frame_from_video.type === "image/jpeg"
      )
        this.drawBlobToImage();
    },
  },
  computed: {
    lines_array() {
      const map = (value, x1, y1, x2, y2) =>
        ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

      const svg_padding = 1 / this.density / 2;
      const svg_width_with_padding = this.svg_width - svg_padding * 2;
      const svg_height_with_padding = this.svg_height - svg_padding * 2;

      const line_density_x = this.svg_width * this.density;
      const line_density_y = this.svg_height * this.density;

      return this.pixel_array.reduce((acc, p) => {
        let brightness = p.b;

        brightness *= this.boost_brightness;

        let contrast = this.boost_contrast + 1; //convert to decimal & shift range: [0..2]
        let intercept = 128 * (1 - contrast);

        brightness = brightness * contrast + intercept;

        const mapped_brightness = map(brightness, 0, 234, 10, 0);
        // const mapped_brightness = brightness;

        // de 0 à 1 vers 17 à 0
        if (typeof mapped_brightness !== "number" || mapped_brightness > 20)
          return acc;

        const posX =
          (p.x / line_density_x) * svg_width_with_padding + svg_padding;
        const posY =
          (p.y / line_density_y) * svg_height_with_padding + svg_padding;
        acc.push({
          posX,
          posY,
          length: mapped_brightness,
        });
        return acc;
      }, []);
    },
  },
  methods: {
    drawBlobToImage() {
      if (this.is_processing_image) return;
      this.is_processing_image = true;

      var t0 = performance.now();

      var img = new Image();

      img.onload = () => {
        var canvas = this.$refs.invisible_canvas;
        canvas.width = img.width;
        canvas.height = img.height;

        this.svg_width = img.width;
        this.svg_height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        let _pixel_array = [];

        const line_density_x = Math.round(canvas.width * this.density);
        const line_density_y = Math.round(canvas.height * this.density);

        for (let x = 0; x <= line_density_x; x++) {
          for (let y = 0; y <= line_density_y; y++) {
            const pos_x = Math.floor((canvas.width / line_density_x) * x);
            const pos_y = Math.floor((canvas.height / line_density_y) * y);

            var [R, G, B] = this.getImageDataFaster(
              // var pixel_data = this.getImageDataFaster(
              pos_x,
              pos_y,
              1,
              1,
              canvas.width,
              canvas.height,
              imgData
            );

            const b = (R + R + R + B + G + G + G + G) >> 3;

            _pixel_array.push({
              x,
              y,
              b,
            });
          }
        }

        this.pixel_array = _pixel_array;
        this.is_processing_image = false;

        var t1 = performance.now();
        if (this.$root.debug_mode === true)
          console.log(
            "Lines • METHODS : drawBlobToImage = took " +
              (t1 - t0) +
              " milliseconds."
          );
      };
      img.src = URL.createObjectURL(this.last_frame_from_video);
    },
    getImageDataFaster(x, y, w, h, W, H, d) {
      var arr = new Uint32Array(w * h * 4),
        i = 0;

      for (var r = y; r < h + y; r += 1) {
        for (var c = x; c < w + x; c += 1) {
          var O = (r * W + c) * 4;
          for (var n = 0; n < 4; n++) {
            if (c < 0 || c >= W || r < 0 || r >= H) {
              arr[i++] = 0;
            } else {
              arr[i++] = d[O + n];
            }
          }
        }
      }

      return arr;
    },
  },
};
</script>
<style lang="scss">
.m_lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;

  // background: white;
  // padding: var(--spacing);

  svg {
    width: 100%;
    height: 100%;
    pointer-events: none;

    line {
      // transition-property: all;
      // transition-duration: 1s;
    }
  }
}
</style>
