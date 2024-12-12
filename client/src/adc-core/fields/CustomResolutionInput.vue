<template>
  <div>
    <DLabel :str="$t('resolution')" />
    <div class="u-sameRow _customResolution">
      <label class="u-label" for="custom_width">
        <input
          name="custom_width"
          type="number"
          min="2"
          max="4096"
          step="1"
          :value="width"
          @input="adjustWidth"
        />
      </label>
      <span class="u-padding_verysmall _customResolutionX"> × </span>
      <label class="u-label" for="custom_height">
        <input
          name="custom_height"
          type="number"
          min="2"
          max="4096"
          step="1"
          :value="height"
          @input="adjustHeight"
        />
        {{ $t("pixels") }}
      </label>
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
  },
  components: {},
  data() {
    return {
      keep_ratio: !!this.ratio,
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
  font-size: var(--sl-font-size-large);
}
</style>
