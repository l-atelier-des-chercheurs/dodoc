<template>
  <div v-if="shared_folder">
    <div class="_grid">
      <div v-for="file in shared_folder.$files" :key="file.$path">
        <MediaContent class="" :file="file" :context="'preview'" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    shared_folder_path: String,
  },
  components: {},
  data() {
    return {
      shared_folder: undefined,
    };
  },
  created() {},
  async mounted() {
    this.shared_folder = await this.$api.getFolder({
      path: this.shared_folder_path,
    });
    this.$api.join({ room: this.shared_folder_path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 2px;
  padding: 0 calc(var(--spacing) / 2);
}
</style>
