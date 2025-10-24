<template>
  <div class="m_vecto" v-html="svgstr"></div>
</template>
<script>
import ImageTracer from "imagetracerjs";

export default {
  props: {
    last_frame_from_video: Blob,
    number_of_colors: Number,
  },
  components: {},
  data() {
    return {
      svgstr: "",
      is_processing_image: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    last_frame_from_video() {
      if (this.last_frame_from_video) {
        this.vectoImage();
      }
    },
  },
  computed: {},
  methods: {
    vectoImage() {
      if (this.is_processing_image) return;

      this.is_processing_image = true;
      ImageTracer.imageToSVG(
        URL.createObjectURL(this.last_frame_from_video),
        (svgstr) => {
          this.is_processing_image = false;
          this.svgstr = svgstr;
        },
        // "posterized2"

        {
          colorsampling: 0,

          numberofcolors: this.number_of_colors,
          colorquantcycles: 1,

          scale: 1,
          strokewidth: 1,
          blurradius: 5,
          blurdelta: 64,

          viewbox: true,

          // pal: [
          //   { r: 255, g: 255, b: 255, a: 255 },
          //   { r: 0, g: 0, b: 0, a: 255 },
          // ],
          // pal : [{r:255,g:255,b:255,a:255}, {r:214,g:0,b:103,a:255}]
        }
      );
    },
  },
};
</script>
<style lang="scss">
.m_vecto {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: scale-down;

  // display: flex;
  // align-items: center;
  // justify-content: center;

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
