<template>
  <div
    class="_openedPage"
    :class="{
      'is--editable': can_edit,
    }"
  >
    <div class="_topMenu">
      <div class="">
        <button
          type="button"
          class="u-buttonLink"
          @close="$emit('togglePage', false)"
        >
          <sl-icon name="arrow-left-short" />
          {{ $t("pages") }}
        </button>
        &nbsp;
        <b>{{ $t("page") }} {{ page_number + 1 }}</b>
      </div>
      <div class="">
        <label class="u-label">{{ $t("zoom") }} ({{ zoom }})</label>
        <input
          type="range"
          v-model.number="zoom"
          min="0.1"
          max="2"
          step="0.1"
        />
      </div>
      <div class="">
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
      <div class="">
        <ModuleCreator
          v-if="can_edit"
          :publication_path="publication_path"
          :page_id="page_opened_id"
        />
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
          :page_id="page_opened_id"
          :page_width="page_width"
          :page_height="page_height"
          :zoom="zoom"
          :gridstep_in_cm="gridstep_in_cm"
          :can_edit="can_edit"
          @close="$emit('togglePage', false)"
        />
        <div class="_navBar">
          <div>
            <button
              type="button"
              @click="prevPage"
              :disabled="page_number === 0"
              v-if="page_number !== 0"
            >
              <sl-icon name="arrow-left" />
              <SinglePage
                :context="'list'"
                :initial_zoom="0.1"
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
              :disabled="page_number === pages.length - 1"
            >
              <sl-icon name="arrow-right" />
              <SinglePage
                :context="'list'"
                :initial_zoom="0.1"
                :page_modules="getModulesForPage(next_page_id)"
                :page_width="page_width"
                :page_height="page_height"
                :can_edit="false"
              />
            </button>
          </div>
        </div>
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
          <SinglePage
            :context="'full'"
            :publication_path="publication_path"
            :page_modules="getModulesForPage(page.id)"
            :page_id="page.id"
            :page_width="page_width"
            :page_height="page_height"
            :zoom="zoom"
            :gridstep_in_cm="gridstep_in_cm"
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
        </div>
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
    can_edit: Boolean,
  },
  components: {
    SinglePage,
    ModuleCreator,
  },
  data() {
    return {
      zoom: 0.5,
      gridstep_in_cm: 1,
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
      return this.spreads.find((pages) =>
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

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  pointer-events: none;

  > * {
    pointer-events: auto;
    // width: 50px;
  }
}
._topMenu {
  position: relative;
  background: white;
  z-index: 1;
  margin: calc(var(--spacing) * 1);
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
  flex: 1 1 auto;
  // overflow: hidden;

  &.is--left {
    ::v-deep {
      ._content {
        transform-origin: top right;
      }
    }
  }
  &.is--right {
    ::v-deep {
      ._content {
        transform-origin: top left;
      }
    }
  }

  &.is--active {
    z-index: 1;

    ::v-deep {
      ._content {
        // &::after {
        //   content: "";
        //   position: absolute;
        //   inset: 0;
        //   background: rgba(255, 255, 255, 0.5);
        // }
      }
    }
  }
  &:not(.is--active) {
    // opacity: 0.8;

    ::v-deep {
      ._content {
        // overflow: hidden;
        &::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.5);
          // background: rgba(255, 0, 255, 0.5);
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
