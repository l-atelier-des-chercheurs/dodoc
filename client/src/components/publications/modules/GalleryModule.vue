<template>
  <div>
    <div v-for="source_file in source_files" :key="source_file.$path">
      <MediaContent
        v-if="source_file"
        :file="source_file"
        :resolution="1600"
        :context="'full'"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    type: String,
    medias: Array,
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
    source_files() {
      if (!this.medias) return false;
      return this.medias.map(({ path }) =>
        this.getSourceMedia({ source_media_path: path })
      );
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
