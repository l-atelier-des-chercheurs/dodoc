<template>
  <transition name="slideup">
    <transition-group
      v-if="!page_opened_id"
      tag="div"
      name="listComplete"
      class="_allPages"
      key="allpages"
    >
      <template v-if="!is_spread">
        <div
          class="_page"
          v-for="(page, index) in pages"
          :key="'page-' + page.id"
        >
          <div class="_preview">
            <SinglePage
              :context="'preview'"
              :zoom="page_preview_zoom"
              :page_modules="getModulesForPage({ modules, page_id: page.id })"
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
      </template>
      <template v-else>
        <div
          class="_spread"
          v-for="(spread, index) in spreads"
          :key="'spread-' + index"
        >
          <div
            class=""
            v-for="(page, iindex) in spread"
            :key="page ? page.id : iindex"
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

              <!-- <div class="_label">
                  <b>{{ $t("page") }}</b>
                  <SelectField
                    :key="'page-' + index * 2 + iindex"
                    :content="index * 2 + iindex"
                    :can_edit="can_edit"
                    :options="all_pages_in_select"
                    @update="
                      movePage({
                        old_position: index * 2 + iindex - 1,
                        new_position: $event - 1,
                      })
                    "
                  />
                  <RemoveMenu
                    v-if="can_edit"
                    :remove_text="$t('remove_page_and_content')"
                    :show_button_text="false"
                    @remove="removePage(page.id)"
                  />
                </div> -->
            </template>
          </div>
        </div>
      </template>
      <button
        type="button"
        class="u-button u-button_transparent _createPage"
        @click="createPage"
        v-if="can_edit"
        :style="is_creating_page ? 'opacity: 0;' : 'opacity: 1'"
        key="createPage"
      >
        <sl-icon name="plus-circle" />
        {{ $t("create_page") }}
      </button>
    </transition-group>
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
    };
  },
  i18n: {
    messages: {
      fr: {
        on_this_page: "Sur cette page",
        on_other_pages: "Sur d’autres pages",
      },
      en: {
        on_this_page: "On this page",
        on_other_pages: "On other pages",
      },
    },
  },

  created() {},
  mounted() {},
  beforeDestroy() {},
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
        desired_largest_dimension: 200,
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
    async createPage() {
      this.is_creating_page = true;

      const new_page_id = this.generatePageID();

      let pages = this.publication.pages ? this.publication.pages.slice() : [];

      pages.push({
        id: new_page_id,
        page_color: "white",
      });

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
  gap: calc(var(--spacing) / 1);
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 2);
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
._spread {
  display: flex;
  flex-flow: row nowrap;
}
._preview {
  position: relative;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  min-width: 2em;
  min-height: 2em;
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
  margin-bottom: calc(var(--spacing) * 3);
}
</style>
