<template>
  <div class="u-metaField">
    <DLabel :str="label || $t('resolution')" />
    <div>
      {{ formattedResolution }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    width: Number,
    height: Number,
    label: String,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    formattedResolution() {
      const widthStr = this.width ? this.width : "–";
      const heightStr = this.height ? this.height : "–";
      return `${widthStr}×${heightStr} ${this.$t("pixels")}`;
    },
  },
  methods: {},
};
</script>
<style lang="scss"></style>
