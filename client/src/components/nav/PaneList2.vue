<template>
  <div
    class="_paneList"
    :class="{
      'is--mobile': $root.is_mobile_view,
    }"
  >
    <component
      :is="$root.is_mobile_view ? 'sl-drawer' : 'span'"
      label="Panneaux"
      class="_paneList2"
      placement="top"
      ref="drawer"
    >
      <SlickList
        class="_paneList--list"
        axis="x"
        v-model="project_panes"
        :useDragHandle="true"
      >
        <SlickItem
          v-for="(item, index) in possible_project_panes"
          :index="index"
          class="_paneItem"
          :class="{
            'is--enabled': project_panes.some((p) => p.type === item.type),
          }"
          :style="`--color-active: var(--color-${item.type});`"
          :key="item.key"
        >
          <div class="_btn" @click="togglePane($event, item)">
            <!-- <div v-handle class="_inlineBtn">
              <sl-icon-button
                name="grip-vertical"
                label="Déplacer"
              />
            </div> -->
            <span
              class="_icon"
              v-if="getIcon(item.type)"
              v-html="getIcon(item.type)"
            />
            <span>{{ index + 1 }} • {{ $t(item.type) }}</span>
            <div
              v-if="project_panes.some((p) => p.type === item.type)"
              class="_inlineBtn _remove"
            >
              <sl-icon-button
                name="x"
                label="Supprimer"
                @click.stop="removePane(index)"
              />
            </div>
          </div>
        </SlickItem>
      </SlickList>
      <!-- <sl-icon name="plus-square-fill" label="Panneaux" />
      <sl-icon name="plus" label="Panneaux" /> -->
      <!-- <sl-dropdown>
        <sl-button slot="trigger" variant="primary" circle>
          <sl-icon name="plus" label="Panneaux" />
        </sl-button>
        <sl-menu>
          <sl-menu-label>Ajouter un panneau</sl-menu-label>
          <sl-menu-item
            v-for="pane in possible_project_panes"
            :key="pane.type"
            v-html="$t(pane.type)"
            @click="newPaneSelected(pane)"
          />
        </sl-menu>
      </sl-dropdown> -->
    </component>

    <!-- // TODO -->

    <sl-button
      v-if="$root.is_mobile_view"
      @click="$refs.drawer.show()"
      pill
      type="primary"
      size="small"
    >
      <sl-icon name="layout-three-columns" label="Panneaux" />
    </sl-button>
  </div>
</template>
<script>
import { SlickList, SlickItem, HandleDirective } from "vue-slicksort";

export default {
  props: {
    panes: Array,
  },
  components: {
    SlickItem,
    SlickList,
  },
  directives: { handle: HandleDirective },
  data() {
    return {
      show_panelist: false,

      project_panes: [],
      possible_project_panes: [
        {
          type: "Capturer",
          mode: false,
        },
        {
          type: "Collecter",
          focus: false,
          focus_height: 0,
        },
        {
          type: "Remixer",
          pad: {},
        },
        {
          type: "Partager",
          pad: {},
        },
      ],
    };
  },
  created() {
    // if (this.project_panes.length === 0)
    //   this.project_panes = this.default_project_panes.slice();
  },
  mounted() {},
  beforeDestroy() {},
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
    "$root.is_mobile_view"() {
      if (this.$root.is_mobile_view) {
        // this.project_panes.map()
      }
    },
  },
  computed: {},
  methods: {
    newPaneSelected(pane) {
      // $evt.detail.item.value;
      pane.key = (Math.random().toString(36) + "00000000000000000").slice(2, 5);
      // this.project_panes = [];
      pane.size = this.project_panes.length > 0 ? 50 : 100;

      this.project_panes.push(pane);
    },
    removePane(index) {
      this.project_panes.splice(index, 1);
    },
    togglePane($event, pane) {
      if (this.project_panes.some((p) => p.type === pane.type)) {
        this.project_panes = this.project_panes.filter(
          (p) => p.type !== pane.type
        );
        return;
      }
      $event.target.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });

      this.newPaneSelected(pane);
    },
    getIcon(type) {
      if (type === "Capturer")
        return `
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 168 168" style="enable-background:new 0 0 168 168;" xml:space="preserve">
          <path id="FOND_2_" style="fill:var(--c-orange);" d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84
            C168,37.6,130.4,0,84,0z"/>
          <path id="CENTRE_2_" style="fill:var(--c-rouge);" d="M84,41.3c-23.6,0-42.7,19.1-42.7,42.7c0,23.6,19.1,42.7,42.7,42.7
            c23.6,0,42.7-19.1,42.7-42.7C126.7,60.4,107.6,41.3,84,41.3z"/>
        </svg>
        `;

      return false;
    },
  },
};
</script>
<style lang="scss">
._paneList {
  // font-size: var(--sl-font-size-large);
  // max-width: 1024px;
  width: 100%;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

._paneList--list {
  // flex-basis: 300px;

  height: auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  // justify-content: flex-end;
  white-space: nowrap;

  overflow: auto;

  > * {
    flex: 1 1 25%;
    display: flex;
    justify-content: center;
    align-items: center;
    // width: 100%;

    // border-bottom: 1px solid #efefef;

    user-select: none;

    transition: all 0.4s;
  }
}

._paneItem {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  text-decoration: none;
  padding: 0;
  text-decoration: none;
  // overrided by pane type color
  --color-active: #ccc;
  // --height-panebutton: 32px;

  color: var(--color-active);

  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.03em;
  // border-radius: 4px;

  &.is--enabled {
    color: white;
    background-color: var(--color-active);
  }
}

._inlineBtn {
  position: relative;
  display: block;
  // width: var(--height-panebutton);
  // height: var(--height-panebutton);

  // margin: -8px 2px -8px calc(-1 * var(--spacing));

  // padding: 10px;
  border: 1px solid transparent;
  border-radius: 50%;
}

._btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);
  transition: all 0.4s ease-out;
  cursor: pointer;

  width: 100%;
  height: 100%;
  //
}

._icon {
  width: 2em;
  height: 2em;
}
</style>
