<template>
  <div
    class="_openedPage"
    :class="{
      'is--editable': can_edit,
    }"
  >
    <transition name="fade_fast" mode="out-in">
      <div
        v-if="!is_spread"
        :key="'page-' + page_opened_id"
        class="_pageNavigator"
      >
        <PageMenu
          :can_edit="can_edit"
          :page_number="page_number"
          :active_spread_index="active_spread_index"
          :zoom.sync="zoom"
          :gridstep_in_cm.sync="gridstep_in_cm"
          :publication_path="publication_path"
          :page_opened_id="page_opened_id"
          :active_module="active_module"
        />

        <SinglePage
          :context="'full'"
          :publication_path="publication_path"
          :page_modules="getModulesForPage(page_opened_id)"
          :page_width="page_width"
          :page_height="page_height"
          :zoom="zoom"
          :gridstep_in_cm="gridstep_in_cm"
          :margins="margins"
          :can_edit="can_edit"
          :active_module.sync="active_module"
          @close="$emit('togglePage', false)"
        />
      </div>
      <div
        v-else
        :key="'spread-' + JSON.stringify(active_spread)"
        class="_spreadNavigator"
        :style="`min-width: ;`"
      >
        <div class="_spreadNavigator--content">
          <div class="_pageMenu">
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
                @click="$emit('togglePage', false)"
                v-html="is_spread ? $t('list_of_spreads') : $t('list_of_pages')"
              />
            </div>
            <div class="_content">
              <PageMenu
                :can_edit="can_edit"
                :page_number="page_number"
                :active_spread_index="active_spread_index"
                :zoom.sync="zoom"
                :gridstep_in_cm.sync="gridstep_in_cm"
                :publication_path="publication_path"
                :page_opened_id="page_opened_id"
                :active_module="active_module"
              />
            </div>
          </div>

          <div
            v-for="(page, index) in active_spread"
            :key="page.id ? page.id : index"
            class="_spreadNavigator--page"
            :class="{
              'is--active': page.id === page_opened_id,
              'is--left': index === 0,
              'is--right': index === 1,
            }"
          >
            <template v-if="page">
              <SinglePage
                :context="'full'"
                :publication_path="publication_path"
                :page_modules="getModulesForPage(page.id)"
                :page_width="page_width"
                :page_height="page_height"
                :zoom="zoom"
                :gridstep_in_cm="
                  page.id === page_opened_id ? gridstep_in_cm : 0
                "
                :margins="margins"
                :active_module.sync="active_module"
                :can_edit="can_edit && page.id === page_opened_id"
                @close="$emit('togglePage', false)"
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
                :zoom="0.1"
                :page_modules="getModulesForPage(previous_page_id)"
                :page_width="page_width"
                :page_height="page_height"
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
                :zoom="0.1"
                :page_modules="getModulesForPage(next_page_id)"
                :page_width="page_width"
                :page_height="page_height"
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
                  :zoom="0.1"
                  :page_modules="getModulesForPage(page.id)"
                  :page_width="page_width"
                  :page_height="page_height"
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
                  :zoom="0.1"
                  :page_modules="getModulesForPage(page.id)"
                  :page_width="page_width"
                  :page_height="page_height"
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
    spreads: Array,
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
      gridstep_in_cm: 0.5,
      active_module: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    page_number() {
      return this.pages.findIndex((p) => p.id === this.page_opened_id);
    },
    previous_page_id() {
      return this.pages[this.page_number - 1].id;
    },
    next_page_id() {
      return this.pages[this.page_number + 1].id;
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
      this.$emit("togglePage", this.pages[new_index].id);
    },
    nextPage() {
      const new_index = this.page_number + 1;
      this.$emit("togglePage", this.pages[new_index].id);
    },
    setPageActive(id) {
      this.$emit("togglePage", id);
    },
    prevSpread() {
      const prev_spread = this.spreads[this.active_spread_index - 1];
      const prev_spread_first_page = prev_spread[1].id;
      this.$emit("togglePage", prev_spread_first_page);
    },
    nextSpread() {
      const next_spread = this.spreads[this.active_spread_index + 1];
      const next_spread_first_page = next_spread[0].id;
      this.$emit("togglePage", next_spread_first_page);
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
  --pagemenu-width: 260px;

  &.is--editable {
    background: var(--color-publish);
  }

  > ._topMenu {
    flex: 0 0 auto;
  }

  > ._pageNavigator,
  > ._spreadNavigator {
    flex: 1 1 auto;
    overflow: auto;
  }
}
._navBar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: auto;
  width: 100%;
  z-index: 2;
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
        transform-origin: 100% 50%;
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
        transform-origin: 0% 50%;
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

._pageMenu {
  width: var(--pagemenu-width);
  // height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 10;

  ._content {
  }
}
</style>
