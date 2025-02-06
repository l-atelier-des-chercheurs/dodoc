<template>
  <div class="_adjustMedia">
    <div class="_panes">
      <div class="_settings">
        <ResolutionDisplay
          v-if="img_width && img_height"
          :width="img_width"
          :height="img_height"
        />

        <hr />

        <RangeValueInput
          class="u-spacingBottom"
          :label="$t('brightness')"
          :value="brightness"
          :can_toggle="false"
          :min="0"
          :max="200"
          :step="1"
          :default_value="100"
          :suffix="'%'"
          :ticks="[100]"
          @input="brightness = $event"
          @save="brightness = $event"
        />
        <RangeValueInput
          class="u-spacingBottom"
          :label="$t('contrast')"
          :value="contrast"
          :can_toggle="false"
          :min="0"
          :max="200"
          :step="1"
          :default_value="100"
          :suffix="'%'"
          :ticks="[100]"
          @input="contrast = $event"
          @save="contrast = $event"
        />
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
          :ticks="[100]"
          @input="saturation = $event"
          @save="saturation = $event"
        />
        <RangeValueInput
          class="u-spacingBottom"
          :label="$t('blur')"
          :value="blur"
          :can_toggle="false"
          :min="0"
          :max="100"
          :step="1"
          :default_value="0"
          :suffix="'px'"
          :ticks="[0]"
          @input="blur = $event"
          @save="blur = $event"
        />
      </div>
      <div class="_preview">
        <canvas ref="canvas" />
      </div>
    </div>

    <div class="_bottomBar">
      <button
        type="button"
        class="u-button u-button_white"
        @click="$emit('back')"
      >
        <b-icon icon="arrow-left-short" />
        {{ $t("previous") }}
      </button>
      <button
        type="button"
        class="u-button u-button_bleuvert"
        @click="updateAdjust"
      >
        {{ $t("next") }}
        <b-icon icon="arrow-right" />
      </button>
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
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,

      img_width: null,
      img_height: null,
    };
  },
  created() {},
  async mounted() {
    await this.draw();
  },
  beforeDestroy() {},
  watch: {
    brightness: function () {
      this.draw();
    },
    contrast: function () {
      this.draw();
    },
    saturation: function () {
      this.draw();
    },
    blur: function () {
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

      this.img_width = img.width;
      this.img_height = img.height;

      const ctx = canvas.getContext("2d");

      // draw background
      // ctx.fillStyle = "white";
      // ctx.fillRect(0, 0, canvas.width, canvas.height);

      let filters = [];
      filters.push(`saturate(${this.saturation}%)`);
      filters.push(`brightness(${this.brightness}%)`);
      filters.push(`contrast(${this.contrast}%)`);
      filters.push(`blur(${this.blur}px)`);
      ctx.filter = filters.join(" ");
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
  background-color: var(--c-noir);
  flex: 1;
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
  padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);

  @media (max-width: 500px) {
    flex-flow: column nowrap;
    overflow: auto;
  }
}

._settings {
  flex: 1 0 240px;
  overflow: auto;
  padding: calc(var(--spacing) / 1);
  background-color: white;
  border-radius: var(--border-radius);

  ::v-deep {
    ._numberField {
      flex: 1 0 0;
    }
  }
}
._preview {
  flex: 8 1 200px;

  canvas {
    // filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.25));
    // box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
}
._bottomBar {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  padding: calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);
}
</style>
