<template>
  <div>
    <div class="u-metaField">
      <DLabel :str="$t('filename')" />
      <div class="u-filename">{{ file.$media_filename }}</div>
    </div>
    <SizeDisplay
      v-if="file.$infos.hasOwnProperty('size')"
      :size="file.$infos.size"
    />
    <ResolutionDisplay
      v-if="
        file.$infos.hasOwnProperty('width') ||
        file.$infos.hasOwnProperty('height')
      "
      :width="file.$infos.width"
      :height="file.$infos.height"
    />
    <DurationDisplay
      v-if="file.$infos.hasOwnProperty('duration')"
      :title="$t('duration')"
      :duration="file.$infos.duration"
    />
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
