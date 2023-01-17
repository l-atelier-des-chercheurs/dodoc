<template>
  <div>
    {{ publication.$path }}
    <div class="_allPages">
      <div class="" v-for="(page, index) in pages" :key="page.id">
        {{ $t("page") }} {{ index + 1 }}
      </div>
    </div>

    <div class="_singlePage">
      <SinglePage
        v-for="page in pages"
        :key="page.id"
        :publication_path="publication.$path"
        :page_modules="getModulesForPage(page.id)"
        :page_id="page.id"
        :width="publication.page_width"
        :height="publication.page_height"
        :can_edit="can_edit"
      />
    </div>

    <button type="button" class="u-button" @click="createPage">
      {{ $t("create_page") }}
    </button>
  </div>
</template>
<script>
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";

export default {
  props: {
    publication: Object,
    can_edit: Boolean,
  },
  components: {
    SinglePage,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    pages() {
      return this.publication.pages;
    },
  },
  methods: {
    createPage() {
      const new_page_id = (
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 2 + 6);

      let pages = this.publication.pages ? this.publication.pages.slice() : [];

      pages.push({
        id: new_page_id,
      });

      this.updatePubliMeta({
        pages,
      });
    },
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta,
      });
    },
    getModulesForPage(id) {
      return this.publication.$files.filter((f) => f.page_id === id) || [];
    },
  },
};
</script>
<style lang="scss" scoped>
._allPages {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 1);
}
</style>
