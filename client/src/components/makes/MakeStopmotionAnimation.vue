<template>
  <div>
    <ModuleCreator
      :publication_path="make.$path"
      :start_collapsed="false"
      :types_available="['capture', 'import']"
      :context="'montage'"
      @addModules="addModules"
    />
  </div>
</template>
<script>
export default {
  props: {
    make: Object,
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
    async addModules({ meta_filenames }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.make,
        section: this.first_section,
        meta_filenames,
      });
    },
    async insertModules({ meta_filenames, index }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.make,
        section: this.first_section,
        index,
        meta_filenames,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
