<template>
  <div>
    <div class="_allPages">
      <div class="_page" v-for="(page, index) in pages" :key="page.id">
        <SinglePage
          :context="'list'"
          :initial_zoom="0.2"
          :page_modules="getModulesForPage(page.id)"
          :width="publication.page_width"
          :height="publication.page_height"
          :can_edit="false"
        />
        {{ $t("page") }} {{ index + 1 }} <br />

        <button
          type="button"
          class="_openPage"
          @click="$emit('togglePage', page.id)"
        />
      </div>

      <button type="button" class="u-button" @click="createPage">
        {{ $t("create_page") }}
      </button>
    </div>

    <div class="_openedPage" v-if="page_opened">
      <SinglePage
        :context="'full'"
        :publication_path="publication.$path"
        :page_modules="getModulesForPage(page_opened)"
        :page_id="page_opened"
        :width="publication.page_width"
        :height="publication.page_height"
        :can_edit="can_edit"
        @close="$emit('togglePage', false)"
      />
    </div>
  </div>
</template>
<script>
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";

export default {
  props: {
    publication: Object,
    page_opened: String,
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
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}

._page {
  position: relative;
  // background: white;
  // box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  // width: 210px;
  // height: 297px;
}

._openedPage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;

  background: var(--color-publish);

  text-align: center;
  overflow: auto;

  padding: calc(var(--spacing) * 2);
}

._openPage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}
</style>
