<template>
  <div class="_adjustMedia">
    <div class="_panes">
      <div class="_settings">
        <RangeValueInput
          class="u-spacingBottom"
          :label="$t('saturation')"
          :value="saturation"
          :can_toggle="false"
          :min="0"
          :max="200"
          :step="1"
          :default_value="100"
          :suffix="'%'"
          @input="saturation = $event"
          @save="saturation = $event"
        />
      </div>
      <canvas ref="canvas" />
    </div>

    <div class="_bottomBar">
      <button type="button" @click="$emit('back')">{{ $t("back") }}</button>
      <button type="button" @click="updateAdjust">{{ $t("next") }}</button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    image: String,
  },
  components: {},
  data() {
    return {
      saturation: 100,
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
      img.src = this.image;
      await img.decode();

      const canvas = this.$refs.canvas;
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.filter = `saturate(${this.saturation}%)`;
      ctx.drawImage(img, 0, 0);
    },
    async updateAdjust() {
      const canvas = this.$refs.canvas;
      this.$emit("updateAdjust", canvas.toDataURL());
    },
  },
};
</script>
<style lang="scss" scoped>
._adjustMedia {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  height: 100%;
}

._panes {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}

._settings {
  flex: 0 0 200px;
  overflow: auto;
}

canvas {
  width: 100%;
  height: auto;
}
</style>
