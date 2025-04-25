<template>
  <div class="_mediaPicker">
    <!-- <PickMediaFromProjects
      :title="select_mode === 'single' ? $t('pick_media') : $t('pick_medias')"
      :path="current_project_path"
      :select_mode="select_mode"
      :pick_from_types="pick_from_types"
      @pickMedias="$emit('pickMedias', $event)"
      @close="$emit('close')"
    /> -->
  </div>
</template>
<script>
export default {
  props: {
    publication_path: String,
    select_mode: {
      type: String,
      default: "multiple",
    },
    pick_from_types: [String, Array],
  },
  components: {},
  data() {
    return {};
  },
  async created() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    // current_project_path() {
    //   const all_publications_path = this.getParent(this.publication_path);
    //   return this.getParent(all_publications_path);
    // },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._mediaPicker {
  position: absolute;
}
</style>
