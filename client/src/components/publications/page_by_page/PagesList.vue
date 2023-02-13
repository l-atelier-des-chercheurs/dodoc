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
                :context="'list'"
                :zoom="0.2"
                :page_modules="getModulesForPage(page.id)"
                :page_width="publication.page_width"
                :page_height="publication.page_height"
                :page_color="page.page_color"
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
              <b>{{ $t("page") }} {{ index + 1 }}</b>
              <RemoveMenu v-if="can_edit" @remove="removePage(page.id)" />
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
                    :context="'list'"
                    :zoom="0.2"
                    :page_modules="getModulesForPage(page.id)"
                    :page_width="publication.page_width"
                    :page_height="publication.page_height"
                    :page_color="page.page_color"
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
                  <b>{{ $t("page") }} {{ index * 2 + iindex }}</b>
                  <RemoveMenu v-if="can_edit" @remove="removePage(page.id)" />
                </div>
              </template>
            </div>
          </div>
        </template>
        <button
          type="button"
          class="u-button"
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
        :publication_path="publication.$path"
        :pages="pages"
        :spreads="spreads"
        :modules="modules"
        :is_spread="is_spread"
        :page_width="publication.page_width"
        :page_height="publication.page_height"
        :margins="margins"
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
    spreads() {
      if (!this.is_spread) return false;
      // turn pages array into [[{id:""}, {id:""}], [{id:""}, {id:""}], [{id:""}, {id:""}], …]
      //
      const number_of_spreads = Math.floor(this.pages.length / 2 + 1);
      let spreads = [];
      let index = 0;

      for (let i = 0; i < number_of_spreads; i++) {
        if (spreads.length === 0) {
          spreads.push([false, this.pages[index]]);
          index += 1;
        } else {
          const left_page = this.pages[index];
          const right_page =
            index + 1 < this.pages.length ? this.pages[index + 1] : false;

          spreads.push([left_page, right_page]);
          index += 2;
        }
      }
      return spreads;
    },
    margins() {
      return {
        left: this.publication.page_margin_left || 0,
        right: this.publication.page_margin_right || 0,
        top: this.publication.page_margin_top || 0,
        bottom: this.publication.page_margin_bottom || 0,
      };
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
    getModulesForPage(id) {
      return (
        this.modules
          .filter((f) => f.page_id === id)
          .sort(
            (a, b) => +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded)
          ) || []
      ).reverse();
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
}
._label {
  display: flex;
  justify-content: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 4) 0;
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

  transition: opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus,
  &:active {
    opacity: 1;
  }
}
</style>
