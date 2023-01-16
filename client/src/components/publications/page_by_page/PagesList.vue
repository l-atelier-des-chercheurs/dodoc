<template>
  <div>
    <div class="_allPages">
      <SinglePage
        :id="publication.pages[0].id"
        :width="publication.page_width"
        :height="publication.page_height"
      />
      <!-- <SinglePage
        v-for="page in publication.pages"
        :key="page.id"
        :id="page.id"
        :width="publication.page_width"
        :height="publication.page_height"
      /> -->
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
  computed: {},
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
