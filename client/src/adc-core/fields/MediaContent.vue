<template>
  <div class="_mediaContent">
    <img v-if="thumb" :src="thumb" />
    <span v-else>
      <sl-icon name="file-earmark-arrow-down" /><br />
      {{ file.media_filename }}
    </span>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    project_slug: String,
    resolution: {
      type: Number,
      default: 180,
    },
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
    thumb() {
      return this.makeRelativeURLFromThumbs({
        thumbs: this.file.thumbs,
        type: this.file.type,
        project_slug: this.project_slug,
        resolution: this.resolution,
      });
    },
  },
  methods: {
    // async updateCaption() {
    //   this.fetch_status = "pending";
    //   this.fetch_error = null;
    //   try {
    //     const response = await this.$axios.patch(
    //       `/projects/${this.project_slug}/${this.file.slug}`,
    //       {
    //         caption: this.new_caption,
    //       }
    //     );
    //     this.response = response.data;
    //     this.fetch_status = "success";
    //   } catch (e) {
    //     this.fetch_status = "error";
    //     this.fetch_error = e.response.data;
    //   }
    // },
    // async removeFile() {
    //   try {
    //     const response = await this.$axios.delete(
    //       `/projects/${this.project_slug}/${this.file.slug}`
    //     );
    //     this.response = response.data;
    //     this.fetch_status = "success";
    //   } catch (e) {
    //     this.fetch_status = "error";
    //     this.fetch_error = e.response.data;
    //   }
    // },
  },
};
</script>
<style lang="scss" scoped></style>
