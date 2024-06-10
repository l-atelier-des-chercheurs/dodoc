<template>
  <div>
    <canvas ref="canvas" />
    <div class="_btnRow">
      <input type="range" v-model="saturation" min="0" max="100" />
    </div>

    <button type="button" @click="$emit('back')">Back</button>
    <button type="button" @click="submit">Continue</button>
  </div>
</template>
<script>
export default {
  props: {
    image_blob: Blob,
    image_type: String,
  },
  components: {},
  data() {
    return {
      saturation: 50,
    };
  },
  created() {},
  async mounted() {
    await this.draw();
  },
  beforeDestroy() {},
  watch: {
    saturation: function () {
      this.draw();
    },
  },
  computed: {},
  methods: {
    async draw() {
      let img = new Image();
      img.src = URL.createObjectURL(this.image_blob);
      await img.decode();

      const ctx = this.$refs.canvas.getContext("2d");
      ctx.filter = `saturate(${this.saturation}%)`;
      ctx.drawImage(img, 0, 0);
    },
    async submit() {
      let blob;
      if (this.image_type === "png") {
        blob = await new Promise((resolve) => {
          this.$refs.canvas.toBlob(resolve, "image/png", 0.95);
        });
      } else {
        blob = await new Promise((resolve) => {
          this.$refs.canvas.toBlob(resolve, "image/jpeg", 0.95);
        });
      }
      this.$emit("updateAdjust", blob);
    },
  },
};
</script>
<style lang="scss" scoped></style>
