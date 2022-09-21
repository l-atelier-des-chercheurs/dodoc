<template>
  <div class="_projectArticles">
    <div
      class="_projectArticles--article"
      v-for="(article, index) in articles"
      :key="index"
    >
      <ArticleContent :project_slug="project.slug" :article="article" />
    </div>
    <sl-button type="button" @click="show_create_entry = !show_create_entry">
      Créer
    </sl-button>
    <form
      v-if="show_create_entry"
      class="input-validation-required"
      @submit.prevent="createArticle"
    >
      <sl-input name="title" label="Titre" required />
      <br />
      <sl-button type="submit" variant="primary">Créer</sl-button>
    </form>
  </div>
</template>
<script>
import ArticleContent from "@/components/ArticleContent.vue";

export default {
  props: {
    project: Object,
    articles: Array,
  },
  components: {
    ArticleContent,
  },
  data() {
    return {
      show_create_entry: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createArticle($event) {
      const formData = new FormData($event.target);
      const formProps = Object.fromEntries(formData);

      const title = formProps.title;
      if (!title) throw new Error("Missing title");

      const meta_filename = await this.$api.uploadText({
        folder_type: "projects",
        folder_slug: this.project.slug,
        filename: "article-" + title + ".txt",
        additional_meta: {
          title,
          is_article: true,
        },
      });
      meta_filename;

      this.show_create_entry = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._projectArticles {
  position: relative;
  width: 100%;
  background: #f4f3ef;
}

._projectArticles--article {
  // position: sticky;
  // top: 0;
  background: white;
  padding: calc(var(--spacing) / 1);
  margin: calc(var(--spacing) / 1);
}
</style>
