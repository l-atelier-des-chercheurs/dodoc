<template>
  <div
    class="_openedPage"
    :class="{
      'is--editable': can_edit,
    }"
  >
    <div class="_breadcrumb">
      <button
        type="button"
        class="u-buttonLink"
        @click="$emit('closePublication')"
      >
        {{ $t("publications") }}
        <sl-icon-button name="arrow-right-short" label="" />
      </button>
      <button
        type="button"
        class="u-buttonLink"
        @click="$emit('togglePage', false)"
      >
        {{ $t("pages") }}
        <sl-icon-button name="arrow-right-short" label="" />
      </button>
    </div>
    <div class="_topMenu">
      <div class="_topMenu--content">
        <div class="">
          <transition name="fade_fast" mode="out-in">
            <b :key="page_number">{{ $t("page") }} {{ page_number + 1 }}</b>
          </transition>
          <transition v-if="spreads" name="fade_fast" mode="out-in">
            <span :key="active_spread_index">
              <template v-if="page_number !== 0">
                ({{ $t("spread") }} {{ active_spread_index }})
              </template>
              <template v-else> ({{ $t("cover") }}) </template>
            </span>
          </transition>
        </div>
        <div class="">
          <label class="u-label">{{ $t("zoom") }} ({{ zoom }})</label>
          <input
            type="range"
            v-model.number="zoom"
            min="0.1"
            max="1"
            step="0.1"
          />
        </div>
        <div class="" v-if="can_edit">
          <label class="u-label"
            >{{ $t("gridstep") }} ({{ gridstep_in_cm }})</label
          >
          <input
            type="range"
            v-model.number="gridstep_in_cm"
            min="0.25"
            max="4"
            step=".25"
          />
        </div>
        <div class="" v-if="can_edit">
          <ModuleCreator
            :publication_path="publication_path"
            :page_id="page_opened_id"
          />
        </div>
      </div>
    </div>
    <transition name="fade_fast" mode="out-in">
      <div
        v-if="!is_spread"
        :key="'page-' + page_opened_id"
        class="_pageNavigator"
      >
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
          @close="$emit('togglePage', false)"
        />
      </div>
      <div
        v-else
        :key="'spread-' + JSON.stringify(active_spread)"
        class="_spreadNavigator"
        :style="`min-width: ;`"
      >
        <div
          v-for="(page, index) in active_spread"
          :key="page.id"
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
              :gridstep_in_cm="page.id === page_opened_id ? gridstep_in_cm : 0"
              :margins="margins"
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
          <div v-else />
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
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";

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
    SinglePage,
    ModuleCreator,
  },
  data() {
    return {
      zoom: 1,
      gridstep_in_cm: 0.5,
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
      return this.spreads.findIndex((pages) =>
        pages.find((p) => p && p.id === this.page_opened_id)
      );
    },
  },
  methods: {
    getModulesForPage(id) {
      return this.modules.filter((f) => f.page_id === id) || [];
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

  &.is--editable {
    background: var(--color-publish);
  }

  > ._topMenu {
    padding: calc(var(--spacing) * 1);
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
  text-align: left;
  padding: calc(var(--spacing) / 1);
  padding-bottom: 0;
}
._topMenu {
  position: relative;
  z-index: 1;
}
._topMenu--content {
  background: white;
  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
}

._spreadNavigator {
  display: flex;
  flex-flow: row nowrap;
}
._spreadNavigator--page {
  position: relative;
  flex: 1 1 50%;
  // overflow: hidden;

  &.is--left {
    ::v-deep {
      ._content {
        transform-origin: center right;
        margin-left: auto;
        margin-right: 0;
      }
      ._margins {
        transform: scale(-1, 1);
      }
    }
  }
  &.is--right {
    ::v-deep {
      ._content {
        transform-origin: center left;
        margin-left: 0;
        margin-right: auto;
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
    background: transparent;
    padding: 0;
    // background: rgba(255, 255, 255, 0.5);
  }
}
</style>
