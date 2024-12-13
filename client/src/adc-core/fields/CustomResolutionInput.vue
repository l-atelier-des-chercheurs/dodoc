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
      {{ $t("pixels") }}
    </div>
    <div v-if="is_video">
      <small class="u-instructions">
        {{ $t("video_resolution_even") }}
      </small>
      <div class="u-spacingBottom" />
    </div>
    <ToggleInput
      v-if="ratio !== undefined"
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
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    ratio: {
      type: Number,
      default: 0,
    },
    is_video: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      keep_ratio: true,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    adjustWidth(e) {
      const value = Math.round(Number(e.target.value));
      this.$emit("update:width", value);
      if (this.keep_ratio) {
        this.$emit("update:height", Math.round(value * this.ratio));
      }
    },
    adjustHeight(e) {
      const value = Math.round(Number(e.target.value));
      this.$emit("update:height", value);
      if (this.keep_ratio) {
        this.$emit("update:width", Math.round(value / this.ratio));
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
}
</style>
