<template>
  <div>
    <template v-if="!folder_size">
      <LoaderSpinner />
    </template>
    <SizeDisplay v-else :size="folder_size" />
  </div>
</template>
<script>
export default {
  props: {
    path: String,
  },
  components: {},
  data() {
    return {
      folder_size: null,
    };
  },
  created() {},
  mounted() {
    this.getFolderSize();
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async getFolderSize() {
      const folder = await this.$api
        .getFolder({
          path: `${this.path}`,
          detailed_infos: true,
        })
        .catch((err) => {
          err;
          // this.fetch_publication_error = err.response;
        });
      this.folder_size = folder.$infos?.size;
    },
  },
};
</script>
<style lang="scss" scoped></style>
