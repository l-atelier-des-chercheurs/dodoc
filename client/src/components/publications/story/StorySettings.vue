<template>
  <DetailsPane :header="$t('settings')" :icon="'gear'" class="_storySettings">
    <RangeValueInput
      class="u-spacingBottom"
      :label="$t('story_width')"
      :value="publication.story_width"
      :min="320"
      :max="2400"
      :step="1"
      :ticks="[320, 480, 800, 1200, 2400]"
      :default_value="800"
      :suffix="'px'"
      @save="updatePubliMeta({ story_width: $event })"
    />
    <ToggleInput
      :content="publication.story_is_not_responsive !== true"
      :label="$t('responsive')"
      @update:content="updatePubliMeta({ story_is_not_responsive: !$event })"
      :options="{
        true: $t('responsive_instr'),
        false: $t('not_responsive_instr'),
      }"
    />
  </DetailsPane>
</template>
<script>
export default {
  props: {
    publication: Object,
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
  methods: {
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._storySettings {
  max-width: 60ch;
  width: 100%;
  margin: calc(var(--spacing) / 1) auto;
}
</style>
