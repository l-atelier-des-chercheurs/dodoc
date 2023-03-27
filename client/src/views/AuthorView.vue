<template>
  <div>
    <pre>
    {{ author }}
    </pre>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      author: undefined,
      is_loading: true,
      fetch_author_error: false,
    };
  },
  created() {},
  async mounted() {
    await this.listAuthor();
    this.$api.join({ room: this.project.$path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async listAuthor() {
      const path = this.createPath({
        author_slug: this.$route.params.author_slug,
      });
      const author = await this.$api
        .getFolder({
          path,
        })
        .catch((err) => {
          this.fetch_author_error = err.response;
          this.is_loading = false;
        });

      this.author = author;
    },
  },
};
</script>
<style lang="scss" scoped></style>
