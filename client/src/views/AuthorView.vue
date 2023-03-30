<template>
  <div>
    <TitleField
      :field_name="'name'"
      class="_name"
      :content="author.name"
      :path="author.$path"
      :required="true"
      :maxlength="40"
      :can_edit="true"
    />
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
    this.$api.join({ room: this.author.$path });
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
