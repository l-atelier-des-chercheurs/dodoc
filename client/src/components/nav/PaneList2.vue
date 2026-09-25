<template>
  <div
    class="_paneList"
    :class="{
      'is--mobile': $root.is_mobile_view,
      'has--noPanes': project_panes.length === 0,
    }"
  >
    <div label="Panneaux" class="_paneList2">
      <button
        type="button"
        class="_projectTitle"
        v-if="!$root.is_mobile_view"
        :class="{
          'is--shown': is_stickied_to_top,
        }"
        @click="scrollToTop"
      >
        <span style="font-size: 2em">
          <b-icon icon="arrow-up-short" />
        </span>
        <img v-if="cover_thumb" :src="cover_thumb" />
        <span>
          {{ project.title }}
        </span>
      </button>
      <span placement="top" class="_projectPanes">
        <div v-if="can_edit" class="_paneList--list">
          <PaneItem
            v-for="pane in possible_project_panes"
            :key="pane.type"
            :pane="pane"
            variant="main"
            :is_enabled="paneIsEnabled(pane.type)"
            :is_animating="animate_pane === pane.type"
            :show_name="paneIsEnabled(pane.type) || !has_enabled_panes"
            :show_add_remove="project_panes.length > 0 && !$root.is_mobile_view"
            :color_active="`var(--color-${pane.type})`"
            @click="togglePane(pane)"
            @add="addPane(pane)"
            @remove="removePane(pane.type)"
          />
        </div>
      </span>
      <div class="_optionsBtnContainer">
        <div class="_secondaryPanes">
          <PaneItem
            v-for="pane in secondery_posible_project_panes"
            :key="pane.type"
            :pane="pane"
            variant="secondary"
            :is_enabled="paneIsEnabled(pane.type)"
            :is_animating="animate_pane === pane.type"
            :show_name="paneIsEnabled(pane.type) || false"
            :show_add_remove="project_panes.length > 0 && !$root.is_mobile_view"
            :color_active="`var(--color-${pane.type})`"
            @click="togglePane(pane)"
            @add="addPane(pane)"
            @remove="removePane(pane.type)"
          />
        </div>
        <button
          type="button"
          class="u-button u-button_icon"
          :title="$t('options')"
          @click="show_pane_list_modal = true"
        >
          <!-- <b-icon
            icon="three-dots"
            style="flex: 0 0 auto"
            :aria-label="$t('options')"
          /> -->
          <svg
            width="16"
            xmlns="http://www.w3.org/2000/svg"
            height="16"
            id="screenshot-e5b0a7de-5e02-8077-8007-963dad311f91"
            viewBox="0 0 16 16"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            fill="none"
            version="1.1"
          >
            <g
              id="shape-e5b0a7de-5e02-8077-8007-963dad311f91"
              width="1em"
              height="1em"
              class="bi-window-dock mx-auto b-icon bi"
              rx="0"
              ry="0"
              style="fill: rgb(0, 0, 0)"
            >
              <g
                id="shape-e5b0a7de-5e02-8077-8007-963dad32a3d6"
                style="display: none"
              >
                <g
                  class="fills"
                  id="fills-e5b0a7de-5e02-8077-8007-963dad32a3d6"
                >
                  <rect
                    width="16"
                    height="16"
                    x="0"
                    transform="matrix(1.000000, 0.000000, 0.000000, 1.000000, 0.000000, 0.000000)"
                    style="fill: none"
                    ry="0"
                    fill="none"
                    rx="0"
                    y="0"
                  />
                </g>
              </g>
              <g id="shape-e5b0a7de-5e02-8077-8007-963dad347567">
                <g
                  class="fills"
                  id="fills-e5b0a7de-5e02-8077-8007-963dad347567"
                >
                  <path
                    d="M3.5,7C3.223876953125,7,3,7.223876953125,3,7.5L3,8.5C3,8.776123046875,3.223876953125,9,3.5,9L4.5,9C4.776123046875,9,5,8.776123046875,5,8.5L5,7.5C5,7.223876953125,4.776123046875,7,4.5,7ZM7,7.5C7,7.223876953125,7.223876953125,7,7.5,7L8.5,7C8.776123046875,7,9,7.223876953125,9,7.5L9,8.5C9,8.776123046875,8.776123046875,9,8.5,9L7.5,9C7.223876953125,9,7,8.776123046875,7,8.5ZM11.5,7C11.223876953125,7,11,7.223876953125,11,7.5L11,8.5C11,8.776123046875,11.223876953125,9,11.5,9L12.5,9C12.776123046875,9,13,8.776123046875,13,8.5L13,7.5C13,7.223876953125,12.776123046875,7,12.5,7Z"
                    style="fill: rgb(0, 0, 0)"
                  />
                </g>
              </g>
              <g id="shape-e5b0a7de-5e02-8077-8007-963dad3554f2">
                <g
                  class="fills"
                  id="fills-e5b0a7de-5e02-8077-8007-963dad3554f2"
                >
                  <path
                    d="M14,1C15.1046142578125,1,16,1.8953857421875,16,3L16,13C16,14.1046142578125,15.1046142578125,15,14,15L2,15C0.8953857421875,15,0,14.1046142578125,0,13L0,3C0,1.8953857421875,0.8953857421875,1,2,1L14,1M2,14L14,14C14.55224609375,14,15,13.55224609375,15,13L15,2L1,2L1,13C1,13.55224609375,1.44775390625,14,2,14M2,2C1.44775390625,2,1,2.44775390625,1,3L1,2L15,2L15,3C15,2.44775390625,14.55224609375,2,14,2L2,2"
                    style="fill: rgb(0, 0, 0)"
                  />
                </g>
              </g>
            </g>
          </svg>
        </button>
        <PaneListModal
          v-if="show_pane_list_modal"
          :project="project"
          :disabled_panes="disabled_panes_from_project"
          :can_edit="can_edit"
          @close="show_pane_list_modal = false"
          @updateDisabledPanes="$emit('updateDisabledPanes', $event)"
        />
      </div>
    </div>
  </div>
</template>
<script>
import PaneListModal from "@/components/nav/PaneListModal.vue";
import PaneItem from "@/components/nav/PaneItem.vue";

export default {
  props: {
    panes: Array,
    project: Object,
    can_edit: Boolean,
  },
  components: {
    PaneListModal,
    PaneItem,
  },
  data() {
    return {
      show_panelist: false,
      is_stickied_to_top: false,

      project_panes: [],

      animate_pane: false,
      animate_pane_timeout: null,
      show_pane_list_modal: false,
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
    has_enabled_panes() {
      return this.project_panes.length > 0;
    },
    disabled_panes_from_project() {
      return this.project?.disabled_panes || [];
    },
    possible_project_panes() {
      let list = [
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
      ];

      // When project has disabled_panes set, hide those pane icons
      const disabled_set = new Set(this.disabled_panes_from_project);
      list = list.filter((p) => !disabled_set.has(p.type));
      return list;
    },
    secondery_posible_project_panes() {
      let list = [
        {
          type: "notes_todo",
        },
      ];
      // Filter out chats pane if enable_chats is not enabled
      if (this.$root.app_infos?.instance_meta?.enable_chats === true) {
        list.push({
          type: "chats",
        });
      }

      // When project has disabled_panes set, hide those pane icons
      const disabled_set = new Set(this.disabled_panes_from_project);
      list = list.filter((p) => !disabled_set.has(p.type));
      return list;
    },
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
    togglePane(pane) {
      if (this.paneIsEnabled(pane.type)) this.removePane(pane.type);
      else this.replacePane(pane);
    },
    addPane(pane) {
      console.log(`PaneList2 / addPane`);

      let pp = JSON.parse(JSON.stringify(this.project_panes));
      pp.push(pane);

      const all_possible_panes = [
        ...this.possible_project_panes,
        ...this.secondery_posible_project_panes,
      ];

      const sortingArr = all_possible_panes.map((p) => p.type);
      pp.sort(
        (a, b) => sortingArr.indexOf(a.type) - sortingArr.indexOf(b.type)
      );
      pp = pp.map((p) => {
        p.size = 100 / pp.length;
        return p;
      });

      this.project_panes = pp;

      setTimeout(() => {
        this.$el.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 100);
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
  // border-top: 1px solid var(--c-gris);
  // border-bottom: 0;

  background: var(--panel-color);
  // border: var(--panel-borders);
  // box-shadow: var(--panel-shadows);
  // border-radius: var(--panel-radius);

  &.has--noPanes {
    // border-bottom: 1px solid var(--c-gris);
  }
}

._paneList2 {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  overflow: auto;

  min-height: 44px;

  > * {
    flex: 1 1 0;

    &._projectPanes {
      flex: 0 0 auto;
    }
  }

  ._paneList.is--mobile & {
    justify-content: safe center;
    > * {
      &._projectPanes {
        // flex: 1 0 auto;
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

._projectTitle {
  padding: calc(var(--spacing) / 4);
  font-weight: 700;
  opacity: 0;
  transform: translateY(-100%);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 4);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  background: transparent;

  transition: 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--shown {
    opacity: 1;
    transform: translateY(0);
  }

  img {
    width: 2rem;
    height: 2rem;
    object-fit: cover;
  }
  span {
    min-height: 2rem;
    max-width: 20ch;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    display: flex;
    align-items: center;
    // background: var(--c-gris);
  }
}
._optionsBtnContainer {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  margin-left: calc(var(--spacing) / 2);
  padding-right: calc(var(--spacing) / 2);
}
</style>
