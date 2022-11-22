<template>
  <div>
    <!-- {{ publication_file.$path }} <br /> -->
    <!-- {{ publication_file.path_to_source_media }} <br /> -->

    <MediaContent v-if="source_file" :file="source_file" />

    <button type="button" @click="$emit('remove')">Supprimer média</button>
  </div>
</template>
<script>
export default {
  props: {
    publication_file: Object,
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
    source_file() {
      const source_media_path = this.publication_file.path_to_source_media;
      return this.getSourceMedia({ source_media_path });
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
