<template>
  <div class="_authorView">
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div v-else>
      <!-- <TitleField
      :field_name="'name'"
      class="_name"
      :content="author.name"
      :tag="'h1'"
      :path="author.$path"
      :required="true"
      :maxlength="40"
      :can_edit="false"
    /> -->
      <AuthorCard
        :key="author.$path"
        :author="author"
        class="u-spacingBottom"
      />
    </div>
  </div>
</template>
<script>
import AuthorCard from "@/adc-core/author/AuthorCard.vue";

export default {
  props: {},
  components: {
    AuthorCard,
  },
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

      this.is_loading = false;
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
