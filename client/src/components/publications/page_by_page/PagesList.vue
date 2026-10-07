<template>
  <transition name="slideup">
    <div v-if="!page_opened_id" class="_pagesList">
      <div class="_topRow">
        <h2 class="_title">
          <b-icon icon="grid" />
          <template v-if="!is_spread">{{ $t("list_of_pages") }}</template>
          <template v-else>{{ $t("list_of_spreads") }}</template>
        </h2>

        <div class="_topRow--actions">
          <div class="_previewsSize" :title="$t('previews_size')">
            <button
              type="button"
              class="u-button u-button_icon u-button_small"
              :disabled="previews_size <= previews_sizes[0]"
              @click="stepPreviewsSize(-1)"
            >
              <b-icon icon="zoom-out" :aria-label="$t('previews_size')" />
            </button>
            <span class="_previewsSize--value">{{ previews_size }}%</span>
            <button
              type="button"
              class="u-button u-button_icon u-button_small"
              :disabled="
                previews_size >= previews_sizes[previews_sizes.length - 1]
              "
              @click="stepPreviewsSize(1)"
            >
              <b-icon icon="zoom-in" :aria-label="$t('previews_size')" />
            </button>
          </div>

          <component
            :is="can_edit ? 'button' : 'div'"
            :type="can_edit ? 'button' : undefined"
            class="u-button u-button_small _paperFormat"
            :class="{ 'is--static': !can_edit }"
            :title="can_edit ? $t('settings') : undefined"
            @click="can_edit && $eventHub.$emit('publication.settings.toggle')"
          >
            <span v-if="format_name" class="_paperFormat--name">
              {{ format_name }}
            </span>
            <span class="_paperFormat--size">
              {{ publication.page_width }} × {{ publication.page_height }}
              {{ format_unit }}
            </span>
            <b-icon v-if="can_edit" icon="gear" :aria-label="$t('settings')" />
          </component>
        </div>
      </div>

      <transition-group
        tag="div"
        name="listComplete"
        class="_allPages"
        key="allpages"
        :style="{
          '--preview-width': preview_width + 'px',
          '--preview-height': preview_height + 'px',
        }"
      >
        <template v-if="!is_spread">
          <div
            v-for="(page, index) in pages"
            :key="'page-' + page.id"
            class="_singlePage"
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
                  :page_number="getCorrectPageNumber(page.id)"
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
          <div
            v-for="(spread, index) in spreads"
            :key="'spread-' + spread.map((p) => (p ? p.id : '')).join('-')"
            class="_singlePage"
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
                @click="createPage(Math.max(0, index * 2 - 1))"
              />
            </div>
            <div class="_spread">
              <div
                v-for="(page, iindex) in spread"
                :key="iindex"
                class="_spreadPage"
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
                      :page_number="getCorrectPageNumber(page.id)"
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
                <div v-else class="_emptyPage" />
              </div>
            </div>
          </div>
        </template>
        <span
          v-if="can_edit"
          :key="'createPage'"
          class="_createPageBtn"
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
      @createPage="createPage"
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
      previews_sizes: [20, 50, 100, 200, 400, 600],
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
    preview_width() {
      const { page_width, page_height } = this.publication;
      return (
        (this.previews_size * page_width) / Math.max(page_width, page_height)
      );
    },
    preview_height() {
      const { page_width, page_height } = this.publication;
      return (
        (this.previews_size * page_height) / Math.max(page_width, page_height)
      );
    },
    format_unit() {
      return this.publication.layout_mode === "screen" ? "px" : "mm";
    },
    format_name() {
      if (this.publication.layout_mode === "screen") return false;
      const { page_width: w, page_height: h } = this.publication;
      const formats = {
        A4_portrait: [210, 297],
        A4_landscape: [297, 210],
        A5_portrait: [148, 210],
        A5_landscape: [210, 148],
      };
      const key = Object.keys(formats).find(
        (k) => formats[k][0] === w && formats[k][1] === h
      );
      return key ? this.$t(key) : false;
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
    stepPreviewsSize(direction) {
      const sizes = this.previews_sizes;
      if (direction > 0)
        this.previews_size =
          sizes.find((s) => s > this.previews_size) || sizes[sizes.length - 1];
      else
        this.previews_size =
          sizes
            .slice()
            .reverse()
            .find((s) => s < this.previews_size) || sizes[0];
    },
    getCorrectPageNumber(page_id) {
      const page_index = this.pages.findIndex((p) => p.id === page_id);
      return page_index;
    },
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
._pagesList {
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: 0 auto;
}

._topRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
  padding: calc(var(--spacing) / 1);
}
._title {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  margin: 0;
}
._topRow--actions {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}

._previewsSize {
  display: flex;
  align-items: center;
}
._previewsSize--value {
  min-width: 3.5em;
  text-align: center;
  font-size: var(--sl-font-size-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-gris_fonce);
}

._paperFormat {
  flex: 0 0 auto;
  gap: calc(var(--spacing) / 2);

  &.is--static {
    cursor: default;
  }
}
._paperFormat--size {
  color: var(--c-gris_fonce);
  font-variant-numeric: tabular-nums;
}

._allPages {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: flex-start;
  gap: calc(var(--spacing) * 1) 0;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 2)
    calc(var(--spacing) * 4);

  > * {
    margin-right: calc(var(--spacing) * 1);
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
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  gap: calc(var(--spacing) * 1);
}
._createPageBtn {
  display: flex;
  align-items: center;
  height: var(--preview-height);
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
  border-radius: 0;
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

._spread {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
}
// pages meet at the spine, labels stay under their page without overlapping
._spreadPage {
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;

  &[data-pageposition="right"] {
    align-items: flex-start;
  }
}
._emptyPage {
  width: var(--preview-width);
  height: var(--preview-height);
}
</style>
