<template>
  <transition name="slideup">
    <div v-if="!page_opened_id">
      <div class="_setPreviewSize">
        <h2>
          <template v-if="!is_spread">{{ $t("list_of_pages") }}</template>
          <template v-else>{{ $t("list_of_spreads") }}</template>
        </h2>

        <div class="u-spacingBottom" />

        <RangeValueInput
          :label="$t('previews_size')"
          :value="previews_size"
          :can_toggle="false"
          :min="20"
          :max="600"
          :step="1"
          :ticks="[20, 50, 100, 200, 400, 600]"
          :default_value="200"
          @save="previews_size = $event"
        />
      </div>

      <transition-group
        tag="div"
        name="listComplete"
        class="_allPages"
        key="allpages"
      >
        <template v-if="!is_spread">
          <div
            v-for="(page, index) in pages"
            :key="'page-' + page.id"
            class="u-sameRow _singlePage"
          >
            <div class="_createPageBtn">
              <EditBtn
                v-if="can_edit"
                :style="
                  is_creating_page
                    ? 'opacity: 0 !important;'
                    : 'opacity: 1 !important;'
                "
                :btn_type="'create_page'"
                :key="'createPage' + index"
                @click="createPage(index)"
              />
            </div>
            <div class="_page">
              <div class="_preview">
                <SinglePage
                  :context="'preview'"
                  :zoom="page_preview_zoom"
                  :page_modules="
                    getModulesForPage({ modules, page_id: page.id })
                  "
                  :page_width="publication.page_width"
                  :page_height="publication.page_height"
                  :layout_mode="publication.layout_mode"
                  :page_color="page.page_color"
                  :page_number="index"
                  :pagination="pagination"
                  :hide_pagination="page.hide_pagination === true"
                  :can_edit="false"
                />
                <button
                  type="button"
                  class="u-button _openPage"
                  @click="$emit('togglePage', page.id)"
                  v-html="$t('open')"
                />
              </div>
              <PageLabel
                class="_pageLabel"
                :index="index"
                :number_of_pages="pages.length"
                :can_edit="can_edit"
                @movePage="
                  movePage({
                    old_position: $event.old_position,
                    new_position: $event.new_position,
                  })
                "
                @duplicatePage="duplicatePage(page.id)"
                @removePage="removePage(page.id)"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <template v-for="(spread, index) in spreads">
            <template v-for="(page, iindex) in spread">
              <EditBtn
                v-if="can_edit && iindex === 0"
                class="_createPage"
                :style="
                  is_creating_page
                    ? 'opacity: 0 !important;'
                    : 'opacity: 1 !important;'
                "
                :btn_type="'create_page'"
                :key="'createPage-' + Math.max(0, index * 2 + iindex - 1)"
                @click="createPage(Math.max(0, index * 2 + iindex - 1))"
              />
              <div
                :key="page ? page.id : iindex"
                :data-pageposition="iindex === 0 ? 'left' : 'right'"
              >
                <template v-if="page && page.id">
                  <div class="_preview">
                    <SinglePage
                      :context="'preview'"
                      :zoom="page_preview_zoom"
                      :page_modules="
                        getModulesForPage({ modules, page_id: page.id })
                      "
                      :page_width="publication.page_width"
                      :page_height="publication.page_height"
                      :layout_mode="publication.layout_mode"
                      :page_color="page.page_color"
                      :page_number="index * 2 + iindex"
                      :pagination="pagination"
                      :hide_pagination="page.hide_pagination === true"
                      :page_is_left="iindex === 0"
                      :can_edit="false"
                    />
                    <button
                      type="button"
                      class="u-button _openPage"
                      @click="$emit('togglePage', page.id)"
                      v-html="$t('open')"
                    />
                    <!-- <div v-else>No preview</div> -->
                  </div>
                  <PageLabel
                    :index="index * 2 + iindex - 1"
                    :number_of_pages="pages.length"
                    :can_edit="can_edit"
                    @movePage="
                      movePage({
                        old_position: $event.old_position,
                        new_position: $event.new_position,
                      })
                    "
                    @duplicatePage="duplicatePage(page.id)"
                    @removePage="removePage(page.id)"
                  />
                </template>
              </div>
            </template>
          </template>
        </template>
        <span
          v-if="can_edit"
          :key="'createPage'"
          :style="
            is_creating_page
              ? 'opacity: 0 !important;'
              : 'opacity: 1 !important;'
          "
        >
          <EditBtn
            :btn_type="'create_page'"
            :is_unfolded="true"
            @click="createPage"
          />
        </span>
      </transition-group>
    </div>
    <OpenedPageOrSpread
      v-else
      key="openedpage"
      :page_opened_id="page_opened_id"
      :publication_title="publication.title"
      :publication_path="publication.$path"
      :pages="pages"
      :spreads="spreads"
      :modules="modules"
      :is_spread="is_spread"
      :page_width="publication.page_width"
      :page_height="publication.page_height"
      :layout_mode="publication.layout_mode"
      :margins="margins"
      :pagination="pagination"
      :can_edit="can_edit"
      @togglePage="$emit('togglePage', $event)"
      @updatePageOptions="updatePageOptions"
    />
  </transition>
</template>
<script>
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";
import OpenedPageOrSpread from "@/components/publications/page_by_page/OpenedPageOrSpread.vue";
import PageLabel from "@/components/publications/page_by_page/PageLabel.vue";

export default {
  props: {
    publication: Object,
    page_opened_id: String,
    can_edit: Boolean,
  },
  components: {
    SinglePage,
    OpenedPageOrSpread,
    PageLabel,
  },
  provide() {
    return {
      $getMetaFilenamesAlreadyPresent: () =>
        this.meta_filenames_already_present,
    };
  },

  data() {
    return {
      is_creating_page: false,
      previews_size: 200,
    };
  },

  created() {
    this.$eventHub.$on("publication.togglePage", this.togglePage);
  },
  mounted() {},
  beforeDestroy() {
    this.$eventHub.$off("publication.togglePage", this.togglePage);
  },
  watch: {},
  computed: {
    pages() {
      return this.publication.pages;
    },
    modules() {
      return this.publication.$files || [];
    },
    is_spread() {
      return this.publication.page_spreads === true;
    },

    page_preview_zoom() {
      return this.calculateZoomToFit({
        width: this.publication.page_width,
        height: this.publication.page_height,
        desired_largest_dimension: this.previews_size,
        magnification:
          this.publication.layout_mode === "screen"
            ? 1
            : this.$root.page_magnification,
      });
    },
    spreads() {
      if (!this.is_spread) return false;
      return this.makeSpread({
        pages: this.pages,
      });
    },
    margins() {
      return {
        left: this.publication.page_margin_left || 0,
        right: this.publication.page_margin_right || 0,
        top: this.publication.page_margin_top || 0,
        bottom: this.publication.page_margin_bottom || 0,
      };
    },
    pagination() {
      return this.setPaginationFromPublication(this.publication);
    },
    meta_filenames_already_present() {
      const current = [];
      const other = [];

      this.pages.map((p) => {
        const page_id = p.id;
        const is_current_page = page_id === this.page_opened_id;

        const page_modules = this.getModulesForPage({
          modules: this.modules,
          page_id: page_id,
        });

        page_modules.map((page_module) => {
          if (
            page_module?.source_medias &&
            Array.isArray(page_module.source_medias)
          )
            page_module.source_medias.map((sm) => {
              if (!sm.meta_filename_in_project) return;
              if (is_current_page) current.push(sm.meta_filename_in_project);
              else other.push(sm.meta_filename_in_project);
            });
        });
      });

      return [
        {
          label: this.$t("on_this_page"),
          medias: current,
          color: "var(--c-orange)",
        },
        {
          label: this.$t("on_other_pages"),
          medias: other,
          color: "var(--c-bleuvert)",
        },
      ];
    },
  },
  methods: {
    async createPage(index) {
      this.is_creating_page = true;

      const new_page_id = this.generatePageID();

      let pages = this.publication.pages ? this.publication.pages.slice() : [];

      const p = {
        id: new_page_id,
        page_color: "white",
      };

      if (typeof index !== "number") pages.push(p);
      else pages.splice(index, 0, p);

      await this.updatePubliMeta({
        pages,
      });

      await new Promise((r) => setTimeout(r, 500));
      this.is_creating_page = false;
    },
    removePage(id) {
      let pages = this.publication.pages.slice();
      pages = pages.filter((p) => p.id !== id);
      this.updatePubliMeta({
        pages,
      });
    },
    async duplicatePage(id) {
      // get original page
      let new_page_id = this.generatePageID();
      const pages = this.publication.pages.reduce((acc, p) => {
        acc.push(p);
        if (p.id === id) {
          const new_page = JSON.parse(JSON.stringify(p));
          new_page.id = new_page_id;
          acc.push(new_page);
        }
        return acc;
      }, []);

      await this.updatePubliMeta({
        pages,
      });

      const og_modules = this.getModulesForPage({
        modules: this.modules,
        page_id: id,
      });
      if (og_modules.length === 0) return;

      const addtl_meta_to_module = { page_id: new_page_id };
      for (const og_module of og_modules) {
        await this.duplicateModuleWithSourceMedias({
          og_module,
          addtl_meta_to_module,
        });
      }
      // for each module, copy them individually while changing their page_id to new_page_id
    },

    movePage({ old_position, new_position }) {
      // console.log("movePage " + old_position + " to " + new_position);
      let pages = this.publication.pages.slice();

      function array_move(arr, old_index, new_index) {
        if (new_index >= arr.length) {
          var k = new_index - arr.length + 1;
          while (k--) {
            arr.push(undefined);
          }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
      }

      array_move(pages, old_position, new_position);

      this.updatePubliMeta({
        pages,
      });
    },
    generatePageID() {
      return (Math.random().toString(36) + "00000000000000000").slice(2, 2 + 6);
    },
    togglePage(page_id) {
      this.$emit("togglePage", page_id);
    },
    async updatePageOptions({ page_number, value }) {
      let pages = this.publication.pages.slice();
      Object.assign(pages[page_number], value);
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
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) * 1) 0;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 2)
    calc(var(--spacing) * 4);

  > * {
    margin-right: calc(var(--spacing) * 1);

    &[data-pageposition="left"] {
      margin-right: 0;
    }
  }
}

._page {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  // position: relative;
  // background: white;
  // box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  // width: 210px;
  // height: 297px;
}
._singlePage {
  gap: calc(var(--spacing) * 1);
}
._createPageBtn {
  margin-bottom: 3rem;
}

._preview {
  position: relative;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  // min-width: 2em;
  // min-height: 2em;
  background: rgba(255, 255, 255, 0.2);
}
._openPage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6) !important;
  // background: rgba(0, 0, 0, 0.6) !important;
  color: black;
  opacity: 0;
  backdrop-filter: blur(4px);

  transition: opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus,
  &:active {
    opacity: 1;
  }
}
._createPage {
  margin-right: calc(var(--spacing) * 1);
}

._setPreviewSize {
  max-width: 320px;
  margin: 0 auto;
  margin-left: 0;
  padding: calc(var(--spacing) / 1);
}
</style>
