<template>
  <div>
    Card
    <img :src="file.thumbs[180]" />
    {{ file.caption }}

    <TextField
      field_name="caption"
      :content="file.caption"
      :path_to_resource="`/projects/${this.project_slug}/${this.file.slug}`"
    />

    <button type="button" @click="removeFile">Remove</button>
    <pre>{{ file }}</pre>
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
  computed: {},
  methods: {
    async updateCaptiont() {},
    async removeFile() {
      try {
        const response = await this.$axios.delete(
          `/projects/${this.project_slug}/${this.file.slug}`
        );
        debugger;
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
