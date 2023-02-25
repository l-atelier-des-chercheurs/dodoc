<template>
  <div
    class="_openedPage"
    :class="{
      'is--editable': can_edit,
    }"
  >
    <transition name="fade_fast" mode="out-in">
      <div
        :key="
          is_spread
            ? 'spread-' + JSON.stringify(active_spread.map((s) => s.id))
            : 'page-' + page_opened_id
        "
        class="_spreadNavigator"
      >
        <div
          class="_spreadNavigator--content"
          @click.self="setActiveModule(false)"
        >
          <div class="_sideCont">
            <div class="_breadcrumb">
              <button
                type="button"
                class="u-buttonLink"
                @click="$emit('closePublication')"
              >
                {{ $t("publications") }}
              </button>
              <sl-icon name="arrow-right-short" label="" />
              <button
                type="button"
                class="u-buttonLink"
                @click="setPageActive(false)"
                v-html="is_spread ? $t('list_of_spreads') : $t('list_of_pages')"
              />
            </div>
            <div class="_content">
              <PageMenu
                :can_edit="can_edit"
                :page_number="page_number"
                :active_spread_index="active_spread_index"
                :zoom.sync="zoom"
                :show_grid.sync="show_grid"
                :snap_to_grid.sync="snap_to_grid"
                :gridstep_in_cm.sync="gridstep_in_cm"
                :page_color="current_page.page_color"
                :publication_path="publication_path"
                :page_opened_id="page_opened_id"
                :page_modules="getModulesForPage(page_opened_id)"
                :active_module="active_module"
                @updatePageOptions="$emit('updatePageOptions', $event)"
              />
            </div>
          </div>

          <SinglePage
            v-if="!is_spread"
            class="_spreadNavigator--page is--active"
            :context="'full'"
            :publication_path="publication_path"
            :page_modules="getModulesForPage(page_opened_id)"
            :page_width="page_width"
            :page_height="page_height"
            :page_color="current_page.page_color"
            :zoom="zoom"
            :show_grid="show_grid"
            :snap_to_grid="snap_to_grid"
            :gridstep_in_cm="gridstep_in_cm"
            :margins="margins"
            :active_module="active_module"
            :can_edit="can_edit"
            @close="setPageActive(false)"
          />

          <div
            v-else
            v-for="(page, index) in active_spread"
            :key="page.id ? page.id : index"
            class="_spreadNavigator--page"
            :class="{
              'is--active': page.id === page_opened_id,
              'is--left': index === 0,
              'is--right': index === 1,
            }"
            @click.self="setActiveModule(false)"
          >
            <template v-if="page">
              <SinglePage
                :context="'full'"
                :publication_path="publication_path"
                :page_modules="getModulesForPage(page.id)"
                :page_width="page_width"
                :page_height="page_height"
                :page_color="page.page_color"
                :zoom="zoom"
                :show_grid="show_grid"
                :snap_to_grid="snap_to_grid"
                :gridstep_in_cm="gridstep_in_cm"
                :margins="margins"
                :active_module="active_module"
                :can_edit="can_edit && page.id === page_opened_id"
                @close="setPageActive(false)"
              />
              <template v-if="page.id !== page_opened_id">
                <button
                  type="button"
                  class="_openAdjacentPageBtn"
                  @click="setPageActive(page.id)"
                />
              </template>
            </template>
            <div v-else class="_noPage" />
          </div>
        </div>
      </div>
    </transition>

    <transition name="slideup" mode="out-in">
      <div class="_navBar" :key="active_spread_index">
        <template v-if="!is_spread">
          <div>
            <button type="button" @click="prevPage" v-if="page_number > 0">
              <sl-icon name="arrow-left" />
              <SinglePage
                :context="'list'"
                :zoom="preview_zoom"
                :page_modules="getModulesForPage(previous_page.id)"
                :page_width="page_width"
                :page_height="page_height"
                :page_color="previous_page.page_color"
                :can_edit="false"
              />
            </button>
          </div>
          <div>
            <button
              type="button"
              @click="nextPage"
              v-if="page_number < pages.length - 1"
            >
              <SinglePage
                :context="'list'"
                :zoom="preview_zoom"
                :page_modules="getModulesForPage(next_page.id)"
                :page_width="page_width"
                :page_height="page_height"
                :page_color="next_page.page_color"
                :can_edit="false"
              />
              <sl-icon name="arrow-right" />
            </button>
          </div>
        </template>
        <template v-else>
          <div class="">
            <button
              type="button"
              @click="prevSpread"
              v-if="active_spread_index > 0"
            >
              <sl-icon name="arrow-left" />
              <template v-for="page in spreads[active_spread_index - 1]">
                <SinglePage
                  v-if="page"
                  :key="page.id"
                  :context="'list'"
                  :zoom="preview_zoom"
                  :page_modules="getModulesForPage(page.id)"
                  :page_width="page_width"
                  :page_height="page_height"
                  :page_color="page.page_color"
                  :can_edit="false"
                />
              </template>
            </button>
          </div>
          <div class="">
            <button
              type="button"
              @click="nextSpread"
              v-if="active_spread_index < spreads.length - 1"
            >
              <template v-for="page in spreads[active_spread_index + 1]">
                <SinglePage
                  v-if="page"
                  :key="page.id"
                  :context="'list'"
                  :zoom="preview_zoom"
                  :page_modules="getModulesForPage(page.id)"
                  :page_width="page_width"
                  :page_height="page_height"
                  :page_color="page.page_color"
                  :can_edit="false"
                />
              </template>
              <sl-icon name="arrow-right" />
            </button>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>
<script>
import PageMenu from "@/components/publications/page_by_page/PageMenu.vue";
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";

export default {
  props: {
    page_opened_id: String,
    publication_path: String,
    pages: Array,
    spreads: [Boolean, Array],
    modules: Array,
    is_spread: Boolean,
    page_width: Number,
    page_height: Number,
    margins: Object,
    can_edit: Boolean,
  },
  components: {
    PageMenu,
    SinglePage,
  },
  data() {
    return {
      zoom: 1,

      show_grid: true,
      snap_to_grid: false,
      gridstep_in_cm: 0.5,

      preview_zoom: 0.05,
      active_module_path: false,
    };
  },
  created() {
    this.$eventHub.$on(`module.setActive`, this.setActiveModule);
  },
  mounted() {},
  beforeDestroy() {
    this.$eventHub.$off(`module.setActive`, this.setActiveModule);
  },
  watch: {},
  computed: {
    active_module() {
      if (!this.active_module_path) return false;

      return this.modules.find((m) => m.$path === this.active_module_path);
    },
    page_number() {
      return this.pages.findIndex((p) => p.id === this.page_opened_id);
    },
    current_page() {
      return this.pages.find((p) => p.id === this.page_opened_id);
    },
    previous_page() {
      return this.pages[this.page_number - 1];
    },
    next_page() {
      return this.pages[this.page_number + 1];
    },
    active_spread() {
      return this.spreads[this.active_spread_index];
    },
    active_spread_index() {
      return (
        this.is_spread &&
        this.spreads.findIndex((pages) =>
          pages.find((p) => p && p.id === this.page_opened_id)
        )
      );
    },
  },
  methods: {
    setActiveModule(path) {
      this.active_module_path = path;
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
    prevPage() {
      const new_index = this.page_number - 1;
      this.setPageActive(this.pages[new_index].id);
    },
    nextPage() {
      const new_index = this.page_number + 1;
      this.setPageActive(this.pages[new_index].id);
    },
    setPageActive(id) {
      this.setActiveModule(false);
      this.$emit("togglePage", id);
    },
    prevSpread() {
      const prev_spread = this.spreads[this.active_spread_index - 1];
      const prev_spread_first_page = prev_spread[1].id;
      this.setPageActive(prev_spread_first_page);
    },
    nextSpread() {
      const next_spread = this.spreads[this.active_spread_index + 1];
      const next_spread_first_page = next_spread[0].id;
      this.setPageActive(next_spread_first_page);
    },
  },
};
</script>
<style lang="scss" scoped>
._openedPage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;

  text-align: center;

  display: flex;
  flex-flow: column nowrap;

  background: var(--c-bodybg);
  --pagemenu-width: 280px;

  &.is--editable {
    background: var(--color-publish);
  }

  > ._topMenu {
    flex: 0 0 auto;
  }

  > ._spreadNavigator {
    flex: 1 1 auto;
  }
}
._navBar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: auto;
  width: 100%;
  z-index: 12;
  overflow: hidden;

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  pointer-events: none;

  button {
    pointer-events: auto;
    display: flex;
    align-items: center;
    margin: calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 2);
    gap: 1px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(12px);
    border-radius: 4px;
  }
}

._breadcrumb {
  padding: calc(var(--spacing) / 1);
  display: flex;
}
._topMenu {
  position: relative;
  z-index: 10;
  padding: 0 calc(var(--spacing) * 1);
}
._topMenu--content {
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
}

._spreadNavigator {
  overflow: auto;
  @include scrollbar(8px, 5px, 6px);
}

._spreadNavigator--menu {
}

._spreadNavigator--content {
  display: flex;
  flex-flow: row nowrap;

  padding-left: var(--pagemenu-width);
  // padding: calc(var(--spacing) * 1);
}

._spreadNavigator--page {
  position: relative;
  flex: 1 1 50%;
  padding: calc(var(--spacing) * 2);

  &.is--left {
    padding-right: 0;

    ::v-deep {
      ._container {
        transform-origin: 100% 0%;
        margin-right: 0;
      }
      ._margins {
        transform: scale(-1, 1);
      }
    }
  }
  &.is--right {
    padding-left: 0;
    ::v-deep {
      ._container {
        transform-origin: 0% 0%;
        margin-left: 0;
      }
    }
  }

  ::v-deep {
    ._content {
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.5);
        transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        pointer-events: none;
      }
    }
  }
  &.is--active {
    z-index: 1;

    ::v-deep {
      ._content {
        &::after {
          opacity: 0;
        }
      }
    }
  }
  &:not(.is--active) {
    // opacity: 0.8;

    ::v-deep {
      ._content {
        // overflow: hidden;
        &::after {
          pointer-events: auto;
          opacity: 1;
        }
      }
    }
  }

  ._openAdjacentPageBtn {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    padding: 0;

    &:hover,
    &:focus {
      // background: rgba(255, 255, 255, 0.2);
    }
  }
}

._noPage {
  background: rgba(0, 0, 0, 0.1);
}

._sideCont {
  width: var(--pagemenu-width);

  position: absolute;
  left: 0;
  top: 0;
  z-index: 10;
  height: 100%;
  // padding-right: calc(var(--spacing) / 2);
  overflow: auto;
  // pointer-events: none;
  @include scrollbar(8px, 5px, 6px);

  > * {
    // pointer-events: auto;

    &._content {
      margin: 0 calc(var(--spacing) / 2) calc(var(--spacing) * 2);
    }
  }
}
</style>
