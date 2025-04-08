<template>
  <div>
    <DLabel :str="$t('resolution')" />
    <div class="u-sameRow _customResolution">
      <input
        name="custom_width"
        type="number"
        min="2"
        max="4096"
        :step="is_video ? 2 : 1"
        :value="width"
        @input="adjustWidth"
      />

      <span class="_customResolutionX">×</span>
      <input
        name="custom_height"
        type="number"
        min="2"
        max="4096"
        :step="is_video ? 2 : 1"
        :value="height"
        @input="adjustHeight"
      />
      {{ unit_i18n }}
    </div>
    <div v-if="is_video">
      <small class="u-instructions">
        {{ $t("video_resolution_even") }}
      </small>
    </div>
    <div class="_mb" />
    <ToggleInput
      v-if="typeof ratio === 'number' && !isNaN(ratio)"
      :label="$t('keep_ratio')"
      :content.sync="keep_ratio"
    />
  </div>
</template>
<script>
export default {
  props: {
    width: {
      type: Number,
      default: 1280,
    },
    height: {
      type: Number,
      default: 720,
    },
    ratio: {
      type: Number,
    },
    is_video: {
      type: Boolean,
      default: false,
    },
    unit: {
      type: String,
      default: "px",
    },
  },
  components: {},
  data() {
    return {
      keep_ratio: typeof this.ratio === "number",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    keep_ratio: function (new_value) {
      if (this.keep_ratio === true) {
        this.$emit("update:height", Math.round(this.width * this.ratio));
      }
    },
  },
  computed: {
    unit_i18n() {
      if (this.unit === "px") return this.$t("pixels");
      else if (this.unit === "mm") return this.$t("millimetres");
    },
  },
  methods: {
    adjustWidth(e) {
      const value = Math.round(Number(e.target.value));
      this.$emit("update:width", value);
      if (this.keep_ratio) {
        let h = Math.round(value * this.ratio);
        if (this.is_video) h = Math.round(h / 2) * 2;
        this.$emit("update:height", h);
      }
    },
    adjustHeight(e) {
      const value = Math.round(Number(e.target.value));
      this.$emit("update:height", value);
      if (this.keep_ratio) {
        let w = Math.round(value / this.ratio);
        if (this.is_video) w = Math.round(w / 2) * 2;
        this.$emit("update:width", w);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._customResolution {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  > * {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) / 4);
  }

  input {
    width: auto;
  }
}
._customResolutionX {
  font-size: 140%;
  font-weight: 300;
}

._mb {
  margin-bottom: calc(var(--spacing) / 2);
}
</style>
