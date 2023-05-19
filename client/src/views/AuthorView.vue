<template>
  <div class="_authorView">
    <TitleField
      :field_name="'name'"
      class="_name"
      :content="author.name"
      :tag="'h1'"
      :path="author.$path"
      :required="true"
      :maxlength="40"
      :can_edit="false"
    />
    <!-- // do not allow two author to have the same name -->
    <!-- <pre>
    {{ author }}
    </pre> -->
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
  beforeDestroy() {
    this.$api.leave({ room: this.author.$path });
  },
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
<style lang="scss" scoped>
._authorView {
  width: 100%;
  max-width: calc(var(--max-column-width));
  // max-width: calc(var(--max-column-width) + 240px);
  margin: 0 auto;
  padding: 0 calc(var(--spacing) * 1);
}
</style>
