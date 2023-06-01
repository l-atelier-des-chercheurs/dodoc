<template>
  <div class="_mediaPicker">
    <!-- OPTIONS -->
    <!-- create a text -->
    <!-- <button type="button" @click="createText">
        {{ $t("create_text") }}
      </button> -->
    <!-- select from this or another project library -->
    <PickMediaFromProjects
      :path="current_project_path"
      :select_mode="'multiple'"
      @addMedias="$emit('addMedias', $event)"
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
<style lang="scss" scoped></style>
