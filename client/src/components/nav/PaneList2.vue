<template>
  <div
    class="_paneList"
    :class="{
      'is--mobile': $root.is_mobile_view,
      'has--noPanes': project_panes.length === 0,
    }"
  >
    <span label="Panneaux" class="_paneList2">
      <div
        class="_projectTitle"
        v-if="!$root.is_mobile_view"
        :class="{
          'is--shown': is_stickied_to_top,
        }"
      >
        <button
          type="button"
          class="u-button u-button_transparent"
          @click="scrollToTop"
        >
          <b-icon icon="arrow-up" />
          <!-- <img v-if="cover_thumb" :src="cover_thumb" /> -->
          <span>
            {{ project.title }}
          </span>
        </button>
      </div>
      <span placement="top" class="_projectPanes" ref="drawer">
        <SlickList
          v-if="can_edit"
          class="_paneList--list"
          axis="x"
          v-model="project_panes"
          :useDragHandle="true"
        >
          <SlickItem
            v-for="(pane, index) in possible_project_panes"
            :index="index"
            class="_paneItem"
            :class="{
              'is--enabled': paneIsEnabled(pane.type),
              'is--animating': animate_pane === pane.type,
            }"
            :style="`--color-active: var(--color-${pane.type});`"
            :key="pane.type"
          >
            <div
              class="_btn"
              :ref="`pane_${pane.type}`"
              @click="replacePane(pane)"
            >
              <span
                class="u-icon"
                v-if="getIcon(pane.type)"
                v-html="getIcon(pane.type)"
              />
              <!-- <span>{{ $t(pane.type) }}</span> -->

              <span
                class="_name"
                key="'name'"
                v-if="paneIsEnabled(pane.type) || !$root.is_mobile_view"
              >
                {{ index + 1 }} • {{ $t(pane.type) }}
              </span>

              <transition name="fade" mode="out-in">
                <span
                  key="'count+'"
                  class="_count"
                  v-if="animate_pane === pane.type"
                >
                  +1
                </span>
                <div
                  v-else-if="project_panes.some((p) => p.type === pane.type)"
                  class="_inlineBtn _removePaneBtn"
                >
                  <b-icon
                    icon="x-circle-fill"
                    :label="$t('close')"
                    @click.stop="removePane(pane.type)"
                  />
                </div>
                <div
                  v-else-if="project_panes.length > 0 && !$root.is_mobile_view"
                  class="_inlineBtn _addPaneBtn"
                >
                  <b-icon
                    icon="plus-circle-fill"
                    :label="$t('add')"
                    @click.stop="addPane(pane)"
                  />
                </div>
              </transition>
            </div>
          </SlickItem>
        </SlickList>
      </span>
      <span v-if="!$root.is_mobile_view" />
    </span>
  </div>
</template>
<script>
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    panes: Array,
    project: Object,
    can_edit: Boolean,
  },
  components: {
    SlickItem,
    SlickList,
  },
  directives: { handle: HandleDirective },
  data() {
    return {
      show_panelist: false,
      is_stickied_to_top: false,

      project_panes: [],
      possible_project_panes: [
        {
          type: "capture",
        },
        {
          type: "collect",
        },
        {
          type: "make",
        },
        {
          type: "publish",
        },
      ],

      animate_pane: false,
      animate_pane_timeout: null,
    };
  },
  created() {
    // if (this.project_panes.length === 0)
    //   this.project_panes = this.default_project_panes.slice();
  },
  mounted() {
    // this.$nextTick(() => {
    //   const lib = this.possible_project_panes.find(
    //     (pp) => pp.type === "collect"
    //   );
    //   this.project_panes.push(lib);
    // });
    this.$eventHub.$on("pane.animate", this.animatePane);
    this.$eventHub.$on("pane.replacePane", this.replacePane);
    document.addEventListener("scroll", this.detectTopOfWindow);
  },
  beforeDestroy() {
    this.$eventHub.$off("pane.animate", this.animatePane);
    this.$eventHub.$off("pane.replacePane", this.replacePane);
    document.removeEventListener("scroll", this.detectTopOfWindow);
  },
  watch: {
    panes: {
      handler() {
        this.project_panes = this.panes.slice();
      },
      deep: true,
      immediate: true,
    },
    project_panes: {
      handler() {
        if (JSON.stringify(this.project_panes) === JSON.stringify(this.panes))
          return false;

        // if a pane is enabled its size cant be set to 0
        this.project_panes = this.project_panes.map((p) => {
          if (p.size === 0) p.size = 20;
          return p;
        });

        this.$emit("update:panes", this.project_panes);
      },
      deep: true,
    },
  },
  computed: {
    cover_thumb() {
      return this.makeRelativeURLFromThumbs({
        $thumbs: this.project.$cover,
        $type: "image",
        $path: this.project.$path,
        resolution: 50,
      });
    },
  },
  methods: {
    detectTopOfWindow() {
      if (this.$el.getBoundingClientRect().y <= 10)
        this.is_stickied_to_top = true;
      else this.is_stickied_to_top = false;
    },
    scrollToTop() {
      document.body.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    },
    removePane(type) {
      this.project_panes = this.project_panes.filter((pp) => pp.type !== type);
    },
    paneIsEnabled(type) {
      return this.project_panes.some((p) => p.type === type);
    },
    replacePane(pane) {
      this.project_panes = [];
      this.addPane(pane);
    },
    addPane(pane) {
      console.log(`PaneList2 / addPane`);

      this.$nextTick(() => {
        this.$el.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      });

      let pp = JSON.parse(JSON.stringify(this.project_panes));
      pp.push(pane);

      const sortingArr = this.possible_project_panes.map((p) => p.type);
      pp.sort(
        (a, b) => sortingArr.indexOf(a.type) - sortingArr.indexOf(b.type)
      );
      pp = pp.map((p) => {
        p.size = 100 / pp.length;
        return p;
      });

      this.project_panes = pp;
    },
    getIcon(type) {
      if (type === "capture") return this.dodoc_icon_capture;
      else if (type === "collect") return this.dodoc_icon_collect;
      else if (type === "make") return this.dodoc_icon_make;
      else if (type === "publish") return this.dodoc_icon_publish;
      return false;
    },
    animatePane(pane) {
      this.animate_pane = pane;
      if (this.animate_pane_timeout) clearTimeout(this.animate_pane_timeout);
      this.animate_pane_timeout = setTimeout(() => {
        this.animate_pane = false;
        this.animate_pane_timeout = null;
      }, 2000);
    },
  },
};
</script>
<style lang="scss" scoped>
._paneList {
  // font-size: var(--sl-font-size-large);
  // max-width: 1024px;
  position: relative;
  top: 0;
  overflow: visible;
  z-index: 100;
  width: 100%;
  min-height: 44px;
  padding: calc(var(--spacing) / 4) 0;
  padding: 0;
  margin: 0 auto;
  background-color: #fff;
  // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  border-top: 1px solid var(--c-gris);
  // border-bottom: 0;

  background: var(--panel-color);
  // border: var(--panel-borders);
  // box-shadow: var(--panel-shadows);
  // border-radius: var(--panel-radius);

  &.has--noPanes {
    border-bottom: 1px solid var(--c-gris);
  }
}

._paneList2 {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  overflow: hidden;

  min-height: 44px;

  > * {
    flex: 1 1 0;

    &._projectPanes {
      flex: 0 0 auto;
    }
  }

  ._paneList.is--mobile & {
    > * {
      &._projectPanes {
        flex: 1 0 auto;
      }
    }
  }
}

._paneList--list {
  // flex-basis: 300px;

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: calc(var(--spacing) / 4);

  white-space: nowrap;
  height: auto;

  > * {
    flex: 0 0 0;
    display: flex;
    justify-content: center;
    align-items: center;
    // width: 100%;

    // border-bottom: 1px solid #efefef;

    user-select: none;

    transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
  }
}

._paneItem {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  text-decoration: none;
  border-radius: 44px;

  text-decoration: none;

  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.03em;

  // border-radius: 4px;
  color: var(--color-active);

  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus {
    color: white;
    background-color: var(--color-active);
  }
  &.is--enabled,
  &.is--animating {
    color: white;
    background-color: var(--color-active);
  }
  &.is--enabled {
    &:hover,
    &:focus {
      color: var(--c-noir);
    }
  }
}

._inlineBtn {
  position: relative;
  display: block;
  --sl-transition-medium: 0;

  line-height: 0;
  padding: calc(var(--spacing) / 4);
  font-size: 120%;
  border-radius: 50%;
  transition: all 0.1s cubic-bezier(0.19, 1, 0.22, 1);
}

._addPaneBtn {
  &:hover,
  &:focus {
    background: white;
    color: var(--color-active);
  }
}
._removePaneBtn {
  &:hover,
  &:focus {
    background: white;
    color: var(--color-active);
  }
}

._btn {
  display: flex;
  justify-content: center;
  align-items: center;
  // gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 4);
  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
  cursor: pointer;

  width: 100%;
  height: 100%;
  //
  .u-icon {
    width: 2rem;
    height: 2rem;
    svg {
      width: 2rem;
      height: 2rem;
    }
  }
}

._name {
  padding: 0 calc(var(--spacing) / 2);
}
._count {
  padding: 0 calc(var(--spacing) / 2);
}

._projectTitle {
  padding: calc(var(--spacing) / 4);
  font-weight: 700;
  opacity: 0;
  transform: translateY(-100%);

  transition: 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--shown {
    opacity: 1;
    transform: translateY(0);
  }

  > button {
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 4);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: calc(var(--spacing) / 2);
  }

  img {
    width: 2rem;
    height: 2rem;
    object-fit: cover;
  }
  span {
    min-height: 2rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    display: flex;
    align-items: center;
  }
}
</style>
