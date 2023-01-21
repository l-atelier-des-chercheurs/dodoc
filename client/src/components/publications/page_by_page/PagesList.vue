<template>
  <div>
    <transition name="slideup">
      <div v-if="!page_opened_id" class="_allPages" key="allpages">
        <template v-if="!publication.page_spreads">
          <div class="_page" v-for="(page, index) in pages" :key="page.id">
            <div class="_preview">
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
            <div class="_label">
              <b>{{ $t("page") }} {{ index + 1 }}</b>
              <RemoveMenu v-if="can_edit" @remove="removePage(page.id)" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="_spread" v-for="(spread, index) in spreads" :key="index">
            <div class="" v-for="(page, iindex) in spread" :key="iindex">
              <template v-if="page && page.id">
                <div class="_preview">
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
        <transition name="fade_fast" mode="out-in">
          <div :key="'page-' + page_opened_id">
            <SinglePage
              :context="'full'"
              :page_number="page_opened_index"
              :publication_path="publication.$path"
              :page_modules="getModulesForPage(page_opened_id)"
              :page_id="page_opened_id"
              :width="publication.page_width"
              :height="publication.page_height"
              :can_edit="can_edit"
              @close="$emit('togglePage', false)"
            />
            <div class="_navBar">
              <div>
                <button
                  type="button"
                  @click="prevPage"
                  :disabled="page_opened_index === 0"
                  v-if="page_opened_index !== 0"
                >
                  <sl-icon name="arrow-left" />
                  <SinglePage
                    :context="'list'"
                    :initial_zoom="0.1"
                    :page_modules="getModulesForPage(previous_page_id)"
                    :width="publication.page_width"
                    :height="publication.page_height"
                    :can_edit="false"
                  />
                </button>
              </div>
              <div>
                <button
                  type="button"
                  @click="nextPage"
                  v-if="page_opened_index < pages.length - 1"
                  :disabled="page_opened_index === pages.length - 1"
                >
                  <sl-icon name="arrow-right" />
                  <SinglePage
                    :context="'list'"
                    :initial_zoom="0.1"
                    :page_modules="getModulesForPage(next_page_id)"
                    :width="publication.page_width"
                    :height="publication.page_height"
                    :can_edit="false"
                  />
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>
<script>
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";

export default {
  props: {
    publication: Object,
    page_opened_id: String,
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
    spreads() {
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
          spreads.push([this.pages[index], this.pages[index + 1]]);
          index += 2;
        }
      }
      return spreads;
    },
    page_opened_index() {
      return this.pages.findIndex((p) => p.id === this.page_opened_id);
    },
    previous_page_id() {
      return this.pages[this.page_opened_index - 1].id;
    },
    next_page_id() {
      return this.pages[this.page_opened_index + 1].id;
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
    prevPage() {
      const new_index = this.page_opened_index - 1;
      this.$emit("togglePage", this.pages[new_index].id);
    },
    nextPage() {
      const new_index = this.page_opened_index + 1;
      this.$emit("togglePage", this.pages[new_index].id);
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

._navBar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: auto;
  width: 100%;

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  pointer-events: none;

  > * {
    pointer-events: auto;
    // width: 50px;
  }
}
</style>
