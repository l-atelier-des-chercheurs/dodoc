<template>
  <div class="m_lines">
    {{ pixel_array }}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="`0 0 ${svg_width} ${svg_height}`"
      ref="pattern"
    >
      <!-- :width="svg_width"
      :height="svg_height" -->
      <line
        v-for="(line, index) in lines_array"
        :key="index"
        :x1="-length / 2"
        :y1="0"
        :x2="length / 2"
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
      default: 106,
    },
  },
  components: {},
  data() {
    return {
      pixel_array: [],

      number_of_lines_width: 40,
      number_of_lines_height: 60,

      is_processing_image: false,

      svg_width: 400,
      svg_height: 600,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    last_frame_from_video() {
      this.drawBlobToImage();
    },
  },
  computed: {
    lines_array() {
      const map = (value, x1, y1, x2, y2) =>
        ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

      return this.pixel_array.reduce((acc, p) => {
        const mapped_brightness = map(p.b, 0, 234, 0, 17);
        // de 0 à 1 vers 17 à 0
        if (mapped_brightness < 2) return acc;

        const posX = (p.x / this.number_of_lines_width) * this.svg_width;
        const posY = (p.y / this.number_of_lines_height) * this.svg_height;

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
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let _pixel_array = [];
        for (let x = 0; x < this.number_of_lines_width; x++) {
          for (let y = 0; y < this.number_of_lines_height; y++) {
            const pos_x = (canvas.width / this.number_of_lines_width) * x;
            const pos_y = (canvas.height / this.number_of_lines_height) * y;

            var [R, G, B] = this.getImageDataFaster(
              pos_x,
              pos_y,
              canvas.width / this.number_of_lines_width,
              canvas.height / this.number_of_lines_height,
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

        debugger;
        this.pixel_array = _pixel_array;
        this.is_processing_image = false;

        var t1 = performance.now();
        if (this.$root.state.dev_mode === "debug")
          console.log(
            "Lines • METHODS : drawBlobToImage = took " +
              (t1 - t0) +
              " milliseconds."
          );
      };
      img.src = URL.createObjectURL(this.last_frame_from_video);
    },
    getImageDataFaster(x, y, w, h, W, H, d) {
      var arr = new Uint32Array(w * h),
        i = 0;

      for (var r = y; r < h + y; r += 1) {
        for (var c = x; c < w + x; c += 1) {
          var O = r * W + c;
          if (c < 0 || c >= W || r < 0 || r >= H) {
            arr[i++] = 0;
          } else {
            arr[i++] = d[O];
          }
        }
      }
      debugger;

      return arr;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_lines {
  width: 100%;
  height: 100%;

  background: white;
  padding: var(--spacing);

  svg {
    width: 100%;
    height: 100%;
    stroke-linecap: round;
    stroke: #ff0000;
    stroke-width: 2.5;
  }
}
</style>
