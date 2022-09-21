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
      if (!this.file.thumbs) return false;

      let thumb_path = "";

      try {
        if (this.file.type === "image")
          thumb_path = this.file.thumbs[this.resolution];
        if (this.file.type === "video")
          thumb_path = this.file.thumbs["0"][this.resolution];
        if (this.file.type === "audio")
          thumb_path = this.file.thumbs.waveform[this.resolution];
        if (this.file.type === "stl")
          thumb_path = this.file.thumbs["0"][this.resolution];
        if (this.file.type === "document")
          thumb_path = this.file.thumbs["page-1"][this.resolution];
        if (this.file.type === "url")
          thumb_path = this.file.thumbs["ogimage"][this.resolution];
      } catch (err) {
        return false;
      }

      return `/thumbs/projects/${this.project_slug}/${thumb_path}`;
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
