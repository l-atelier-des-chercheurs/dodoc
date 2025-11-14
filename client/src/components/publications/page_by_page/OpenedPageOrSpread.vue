<template>
  <div
    class="_openedPage"
    :class="{
      'is--editable': can_edit && !display_as_public,
    }"
  >
    <div class="_spreadNavigator">
      <div
        class="_spreadNavigator--content"
        @click.self="setActiveModule(false)"
      >
        <div class="_sideCont">
          <div class="_content">
            <PageMenu
              :can_edit="can_edit"
              :pages="pages"
              :active_page_number="active_page_number"
              :active_spread_index="active_spread_index"
              :is_spread="is_spread"
              :page_width="page_width"
              :page_height="page_height"
              :scale="scale"
              :show_grid.sync="page_settings.show_grid"
              :snap_to_grid.sync="page_settings.snap_to_grid"
              :grid_z_index.sync="page_settings.grid_z_index"
              :gridstep_in_mm.sync="page_settings.gridstep_in_mm"
              :layout_mode="layout_mode"
              :page_color="current_page.page_color"
              :pagination="pagination"
              :publication_path="publication_path"
              :page_opened_id="page_opened_id"
              :page_modules="
                getModulesForPage({ modules, page_id: page_opened_id })
              "
              :active_module="active_module"
              :display_as_public.sync="display_as_public"
              @updatePageOptions="$emit('updatePageOptions', $event)"
              @update:scale="scale = $event"
              @prevPage="prevPage()"
              @nextPage="nextPage()"
              @createPage="$emit('createPage')"
              @close="setPageActive(false)"
            />
          </div>
        </div>
        <div class="_pagePan">
          <PanZoom2
            :scale.sync="scale"
            :content-width="page_width"
            :content-height="page_height"
            :magnification="current_page_magnification"
          >
            <transition name="pagechange" mode="out-in">
              <div
                class="_pageCont"
                @click.self="setActiveModule(false)"
                :key="
                  is_spread
                    ? 'spread-' + JSON.stringify(active_spread.map((s) => s.id))
                    : 'page-' + page_opened_id
                "
              >
                <SinglePage
                  v-if="!is_spread"
                  class="_spreadNavigator--page is--active"
                  :context="'full'"
                  :page_modules="
                    getModulesForPage({ modules, page_id: page_opened_id })
                  "
                  :page_width="page_width"
                  :page_height="page_height"
                  :layout_mode="layout_mode"
                  :page_color="current_page.page_color"
                  :scale="scale"
                  :show_grid="page_settings.show_grid"
                  :snap_to_grid="page_settings.snap_to_grid"
                  :grid_z_index="page_settings.grid_z_index"
                  :gridstep_in_mm="page_settings.gridstep_in_mm"
                  :margins="margins"
                  :page_number="active_page_number"
                  :pagination="pagination"
                  :hide_pagination="current_page.hide_pagination === true"
                  :active_module="active_module"
                  :can_edit="can_edit && !display_as_public"
                  @close="setPageActive(false)"
                />

                <template v-else>
                  <div
                    v-for="(page, index) in active_spread"
                    :key="page.id ? page.id : index"
                    class="_spreadNavigator--page"
                    :class="{
                      'is--active': page.id === page_opened_id,
                    }"
                  >
                    <template v-if="page">
                      <SinglePage
                        :context="'full'"
                        :page_modules="
                          getModulesForPage({ modules, page_id: page.id })
                        "
                        :page_width="page_width"
                        :page_height="page_height"
                        :layout_mode="layout_mode"
                        :page_color="page.page_color"
                        :scale="scale"
                        :show_grid="page_settings.show_grid"
                        :snap_to_grid="page_settings.snap_to_grid"
                        :grid_z_index="page_settings.grid_z_index"
                        :gridstep_in_mm="page_settings.gridstep_in_mm"
                        :margins="margins"
                        :page_number="getCorrectPageNumber(page.id)"
                        :pagination="pagination"
                        :hide_pagination="current_page.hide_pagination === true"
                        :active_module="active_module"
                        :page_is_left="index === 0"
                        :can_edit="
                          can_edit &&
                          page.id === page_opened_id &&
                          !display_as_public
                        "
                        @close="setPageActive(false)"
                      />
                      <template v-if="page.id !== page_opened_id">
                        <button
                          type="button"
                          class="_openAdjacentPageBtn"
                          @mousedown.self="setPageActive(page.id)"
                        />
                      </template>
                    </template>
                    <div v-else class="_noPage" />
                  </div>
                </template>
              </div>
            </transition>
          </PanZoom2>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import PageMenu from "@/components/publications/page_by_page/PageMenu.vue";
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";
import PanZoom2 from "@/components/publications/page_by_page/PanZoom2.vue";

export default {
  props: {
    page_opened_id: String,
    publication_path: String,
    publication_title: String,
    pages: Array,
    spreads: [Boolean, Array],
    modules: Array,
    is_spread: Boolean,
    page_width: Number,
    page_height: Number,
    layout_mode: String,
    margins: Object,
    pagination: [Boolean, Object],
    can_edit: Boolean,
  },
  components: {
    PageMenu,
    SinglePage,
    PanZoom2,
  },
  data() {
    return {
      scale: 1,

      page_settings: {
        show_grid: false,
        snap_to_grid: false,
        grid_z_index: "under",
        gridstep_in_mm: 10,
      },

      display_as_public: false,

      active_module_path: false,
    };
  },
  created() {
    this.$eventHub.$on(`module.setActive`, this.setActiveModule);
    document.addEventListener("keydown", this.keyPressed);
    this.loadSettings();
  },
  mounted() {},
  beforeDestroy() {
    this.$eventHub.$off(`module.setActive`, this.setActiveModule);
    document.removeEventListener("keydown", this.keyPressed);
  },
  watch: {
    page_opened_id() {
      this.$nextTick(() => {
        // const active_page = this.$el.querySelector(
        //   "._spreadNavigator--page.is--active"
        // );
        // todo replace with panzoom
        // if (active_page)
        // if (this.$el.scrollIntoViewIfNeeded)
        //   active_page.scrollIntoViewIfNeeded({
        //     behavior: "smooth",
        //     block: "nearest",
        //     inline: "center",
        //   });
        // else
        //   active_page.scrollIntoView({
        //     behavior: "smooth",
        //     block: "nearest",
        //     inline: "center",
        //   });
      });
    },
    page_settings: {
      handler() {
        this.saveSettings();
      },
      deep: true,
    },
  },
  computed: {
    active_module() {
      if (!this.active_module_path) return false;

      return this.modules.find((m) => m.$path === this.active_module_path);
    },
    active_module_first_media() {
      return this.firstMedia(this.active_module);
    },
    active_module_meta_filename() {
      return this.active_module.$path.substring(
        this.active_module.$path.lastIndexOf("/") + 1
      );
    },
    active_page_number() {
      return this.pages.findIndex((p) => p.id === this.page_opened_id);
    },
    current_page() {
      return this.pages.find((p) => p.id === this.page_opened_id);
    },
    previous_page() {
      return this.pages[this.active_page_number - 1];
    },
    next_page() {
      return this.pages[this.active_page_number + 1];
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
    current_page_magnification() {
      if (this.layout_mode === "screen") return 1;
      return this.$root.page_magnification;
    },
  },
  methods: {
    loadSettings() {
      const ls = localStorage.getItem(
        `publication.page_settings.${this.publication_path}`
      );
      if (ls) this.page_settings = JSON.parse(ls);
    },
    saveSettings() {
      localStorage.setItem(
        `publication.page_settings.${this.publication_path}`,
        JSON.stringify(this.page_settings)
      );
    },
    keyPressed(event) {
      if (
        this.$root.modal_is_opened ||
        event.target.tagName.toLowerCase() === "input" ||
        event.target.tagName.toLowerCase() === "textarea" ||
        event.target.className.includes("ql-editor") ||
        event.target.hasAttribute("contenteditable")
      )
        return;

      let action = "";
      // let detail = "";

      if (event.key === "Backspace" || event.key === "Delete") {
        action = "remove";
        this.$eventHub.$emit(`module.open_remove_modal`);
      }
      // else if (event.key === "ArrowUp") {
      //   action = "move";
      //   detail = { x: 0, y: -1 };
      // } else if (event.key === "ArrowDown") {
      //   action = "move";
      //   detail = { x: 0, y: 1 };
      // } else if (event.key === "ArrowLeft") {
      //   action = "move";
      //   detail = { x: -1, y: 0 };
      // } else if (event.key === "ArrowRight") {
      //   action = "move";
      //   detail = { x: 1, y: 0 };
      // }

      if (action) event.preventDefault();

      // this.$eventHub.$emit("publication.selected.triggerAction", {
      //   action,
      //   detail,
      // });
    },
    setActiveModule(path) {
      this.active_module_path = path;
    },
    prevPage() {
      const new_index = this.active_page_number - 1;
      this.setPageActive(this.pages[new_index].id);
    },
    nextPage() {
      const new_index = this.active_page_number + 1;
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
    getCorrectPageNumber(page_id) {
      const page_index = this.pages.findIndex((p) => p.id === page_id);
      return page_index;
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
  // z-index: 10;

  text-align: center;

  display: flex;
  flex-flow: column nowrap;

  background: var(--c-gris_clair);

  --pagemenu-width: 280px;

  &.is--editable {
    // background: var(--color-publish);
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
  overflow: hidden;
  width: 100%;
  height: 100%;

  @include scrollbar(8px, 5px, 6px);
}

._spreadNavigator--menu {
}

._spreadNavigator--content {
  display: flex;
  flex: row nowrap;
  width: 100%;
  height: 100%;
  // padding: calc(var(--spacing) * 1);
}
._pageCont {
  display: flex;
  flex-flow: row nowrap;
  width: max-content;

  // border: 1px solid black;
}

._spreadNavigator--page {
  position: relative;
  flex: 1 1 50%;
  // padding: calc(var(--spacing) * 4);

  ::v-deep {
    ._pagecontent {
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 1000000;
        background: rgba(255, 255, 255, 0.6);
        transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        pointer-events: none;
        // backdrop-filter: blur(2px);
      }
    }
  }
  &.is--active {
    z-index: 1;

    ::v-deep {
      ._pagecontent {
        &::after {
          opacity: 0;
        }
      }
    }
  }
  &:not(.is--active) {
    // opacity: 0.8;
    z-index: 2;

    ::v-deep {
      ._pagecontent {
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
  flex: 0 0 auto;

  height: 100%;
  background: white;
  border-right: 2px solid var(--c-gris_clair);

  overflow-x: visible;
  overflow-y: auto;
  @include scrollbar(8px, 5px, 6px);

  > * {
    &._content {
      margin: 0 0 calc(var(--spacing) * 2) 0;
    }
  }
}
._pagePan {
  width: 100%;
  height: 100%;
}
</style>
