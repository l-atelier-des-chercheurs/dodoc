<template>
  <div class="_mediaCard">
    <img v-if="thumb" :src="thumb" />
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
    return {
      new_caption: this.file.caption,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    "file.caption"() {
      this.new_caption = this.file.caption;
    },
  },
  computed: {
    thumb() {
      if (!this.file.thumbs) return false;

      let thumb_path = "";

      try {
        if (this.file.type === "image") thumb_path = this.file.thumbs[180];
        if (this.file.type === "video") thumb_path = this.file.thumbs["0"][180];
        if (this.file.type === "audio")
          thumb_path = this.file.thumbs.waveform[180];
        if (this.file.type === "stl") thumb_path = this.file.thumbs["0"][180];
        if (this.file.type === "document")
          thumb_path = this.file.thumbs["page-1"][180];
        if (this.file.type === "url")
          thumb_path = this.file.thumbs["ogimage"][180];
      } catch (err) {
        return false;
      }

      return `/thumbs/projects/${this.project_slug}/${thumb_path}`;
    },
  },
  methods: {
    async updateCaption() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$axios.patch(
          `/projects/${this.project_slug}/${this.file.slug}`,
          {
            caption: this.new_caption,
          }
        );

        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },

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
<style lang="scss" scoped>
._mediaCard {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  aspect-ratio: 1/1;
  img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
    max-width: none;
  }
}
</style>
