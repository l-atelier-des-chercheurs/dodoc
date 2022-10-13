<template>
  <div class="_mediaContent">
    <template v-if="file.type === 'image'">
      <img :src="thumb" />
    </template>
    <template v-else-if="file.type === 'video'">
      <template v-if="context === 'preview'">
        <img :src="thumb" />
      </template>
      <template v-else>
        <video :src="file_full_path" controls />
      </template>
    </template>
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
    context: {
      type: String,
      default: "preview",
      // preview, full
    },
    subfolder: {
      type: String,
      default: "projects",
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
    file_full_path() {
      const path = `/${this.subfolder}/${this.project_slug}/${this.file.media_filename}?v=${this.timestamp}`;
      return path;
    },
    timestamp() {
      if (this.file.date_created) return +new Date(this.file.date_created);
      else return +new Date();
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
