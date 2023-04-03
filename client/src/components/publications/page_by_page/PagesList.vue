<template>
  <div>
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
            <div class="_label">
              <b class="">
                {{ $t("page") }}
              </b>

              <SelectField
                :key="'page-' + index"
                :content="index + 1"
                :can_edit="can_edit"
                :options="all_pages_in_select"
                @update="
                  movePage({
                    old_position: index,
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
            </div>
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
                <div class="_label">
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
                </div>
              </template>
            </div>
          </div>
        </template>
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="createPage"
          v-if="can_edit"
          key="createPage"
        >
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
        @closePublication="$emit('closePublication')"
      />
    </transition>
  </div>
</template>
<script>
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";
import OpenedPageOrSpread from "@/components/publications/page_by_page/OpenedPageOrSpread.vue";

export default {
  props: {
    publication: Object,
    page_opened_id: String,
    can_edit: Boolean,
  },
  components: {
    SinglePage,
    OpenedPageOrSpread,
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
    modules() {
      return this.publication.$files || [];
    },
    is_spread() {
      return this.publication.page_spreads === true;
    },
    all_pages_in_select() {
      return new Array(this.pages.length)
        .fill(null)
        .map((i, index) => ({ key: index + 1, text: index + 1 }));
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
  },
  methods: {
    createPage() {
      const new_page_id = (
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 2 + 6);

      let pages = this.publication.pages ? this.publication.pages.slice() : [];

      pages.push({
        id: new_page_id,
        page_color: "white",
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
    movePage({ old_position, new_position }) {
      old_position;
      new_position;

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
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06);
  min-width: 2em;
  min-height: 2em;
  background: rgba(255, 255, 255, 0.2);
}
._label {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 8);
  margin: calc(var(--spacing) / 8);
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
}

._openPage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  color: black;
  opacity: 0;
  backdrop-filter: blur(5px);

  transition: opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus,
  &:active {
    opacity: 1;
  }
}
</style>
