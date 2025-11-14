<template>
  <div class="_authorView">
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <template v-else>
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
      <div class="_card">
        <AuthorCard
          :key="author.$path"
          :author="author"
          :context="'full'"
          class="u-spacingBottom"
        />
      </div>
    </template>
  </div>
</template>
<script>
import AuthorCard from "@/adc-core/author/AuthorCard.vue";
import DynamicTitle from "@/mixins/DynamicTitle.js";

export default {
  props: {},
  mixins: [DynamicTitle],
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
    this.$api.updateSelfPath(this.author_path);
    await this.listAuthor();
    this.$api.join({ room: this.author_path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.author_path });
  },
  watch: {},
  computed: {
    author_path() {
      return this.createPath({
        author_slug: this.$route.params.author_slug,
      });
    },
  },
  methods: {
    async listAuthor() {
      const author = await this.$api
        .getFolder({
          path: this.author_path,
        })
        .catch((err) => {
          this.fetch_author_error = err.response;
          this.is_loading = false;
        });

      this.is_loading = false;
      this.author = author;

      // Update document title with actual author name
      if (this.author) {
        this.updateDocumentTitle(this.author.name);
      }

      this.$eventHub.$emit("received.author", this.author);
    },
  },
};
</script>
<style lang="scss" scoped>
._authorView {
  padding-bottom: calc(var(--spacing) * 6);
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: calc(var(--spacing) * 2) auto calc(var(--spacing) * 4);
}

._card {
  // display: flex;
  // justify-content: center;
  max-width: 400px;
  margin: 0 auto;
  // border: 2px solid var(--c-gris);

  ::v-deep {
    ._topbar {
      // background: white;
      // flex-flow: column nowrap;
    }
  }
}

._backBtn {
  display: flex;
  gap: calc(var(--spacing) / 4);
  margin-bottom: calc(var(--spacing) * 2);
}
</style>
