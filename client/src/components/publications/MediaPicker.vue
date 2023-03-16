<template>
  <div class="_mediaPicker">
    <!-- OPTIONS -->
    <!-- create a text -->
    <!-- <button type="button" @click="createText">
        {{ $t("create_text") }}
      </button> -->
    <!-- select from this or another project library -->
    <PickMediaFromProjects
      :current_project_path="current_project_path"
      @selectMedia="$emit('selectMedia', $event)"
      @close="$emit('close')"
    />
  </div>
</template>
<script>
export default {
  props: {
    publication_path: String,
  },
  components: {},
  data() {
    return {};
  },
  async created() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    current_project_path() {
      const all_publications_path = this.getParent(this.publication_path);
      return this.getParent(all_publications_path);
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._mediaPicker {
  width: 100%;
  // background: var(--c-gris_clair);
  margin: 0 auto;
}

._addMediaBtn {
  text-align: center;
  padding: calc(var(--spacing) * 1);
}
</style>
