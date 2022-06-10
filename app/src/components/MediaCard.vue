<template>
  <div>
    <img :src="file.thumbs[180]" />
    <button type="button" @click="removeFile">Remove</button>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    project_slug: String,
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
    async removeFile() {
      try {
        const response = await this.$axios.delete(
          `/projects/${this.project_slug}/${this.file.slug}`
        );
        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
