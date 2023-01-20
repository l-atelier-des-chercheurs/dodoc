<template>
  <div>
    <transition name="slideup">
      <div v-if="!page_opened" class="_allPages" key="allpages">
        <div class="_page" v-for="(page, index) in pages" :key="page.id">
          <div class="_pagePreview">
            <SinglePage
              :context="'list'"
              :initial_zoom="0.2"
              :page_modules="getModulesForPage(page.id)"
              :width="publication.page_width"
              :height="publication.page_height"
              :can_edit="false"
            />
            <button
              type="button"
              class="_openPage"
              @click="$emit('togglePage', page.id)"
            />
          </div>
          <b>{{ $t("page") }} {{ index + 1 }}</b>
          <RemoveMenu v-if="can_edit" @remove="removePage(page.id)" />
        </div>

        <button type="button" class="u-button" @click="createPage">
          {{ $t("create_page") }}
        </button>
      </div>
      <div
        class="_openedPage"
        v-else
        key="openedpage"
        :class="{
          'is--editable': can_edit,
        }"
      >
        <SinglePage
          :context="'full'"
          :page_number="page_opened_index"
          :publication_path="publication.$path"
          :page_modules="getModulesForPage(page_opened)"
          :page_id="page_opened"
          :width="publication.page_width"
          :height="publication.page_height"
          :can_edit="can_edit"
          @close="$emit('togglePage', false)"
        />
      </div>
    </transition>
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
    page_opened_index() {
      return this.pages.findIndex((p) => p.id === this.page_opened);
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
    removePage(id) {
      let pages = this.publication.pages.slice();
      pages = pages.filter((p) => p.id !== id);

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
._pagePreview {
  position: relative;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06);
}

._openPage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}
._openedPage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;

  text-align: center;
  overflow: auto;

  padding: calc(var(--spacing) * 1);
  background: var(--c-bodybg);

  &.is--editable {
    background: var(--color-publish);
  }
}
</style>
