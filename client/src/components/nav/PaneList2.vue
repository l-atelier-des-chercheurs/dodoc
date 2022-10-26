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
          v-for="(pane, index) in possible_project_panes"
          :index="index"
          class="_paneItem"
          :class="{
            'is--enabled': project_panes.some((p) => p.type === pane.type),
          }"
          :style="`--color-active: var(--color-${pane.type});`"
          :key="pane.type"
        >
          <div
            class="_btn"
            :ref="`pane_${pane.type}`"
            @click="replacePane($event, pane)"
          >
            <!-- <div v-handle class="_inlineBtn">
              <sl-icon-button
                name="grip-vertical"
                label="Déplacer"
              />
            </div> -->
            <span
              class="_icon"
              v-if="getIcon(pane.type)"
              v-html="getIcon(pane.type)"
            />
            <span>{{ $t(pane.type) }}</span>
            <!-- <span>{{ index + 1 }} • {{ $t(pane.type) }}</span> -->
            <div
              v-if="project_panes.some((p) => p.type === pane.type)"
              class="_inlineBtn"
            >
              <sl-icon-button
                name="x-lg"
                label="Fermer"
                @click.stop="removePane(pane.type)"
              />
            </div>
            <div
              v-else-if="project_panes.length > 0"
              class="_inlineBtn _addPaneBtn"
            >
              <sl-icon-button
                name="plus-circle"
                label="Ajouter"
                @click.stop="addPane($event, pane)"
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
          type: "Publier",
          pad: {},
        },
      ],
    };
  },
  created() {
    // if (this.project_panes.length === 0)
    //   this.project_panes = this.default_project_panes.slice();
  },
  mounted() {
    // this.$nextTick(() => {
    //   const lib = this.possible_project_panes.find(
    //     (pp) => pp.type === "Collecter"
    //   );
    //   this.project_panes.push(lib);
    // });
  },
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
    removePane(type) {
      this.project_panes = this.project_panes.filter((pp) => pp.type !== type);
    },
    replacePane($event, pane) {
      this.project_panes = [];
      this.addPane($event, pane);
      // if (this.project_panes.some((p) => p.type === pane.type)) {
      //   this.project_panes = this.project_panes.filter(
      //     (p) => p.type !== pane.type
      //   );
      //   return;
      // } else this.addPane($event, pane);
    },
    addPane($event, pane) {
      console.log(`PaneList2 / addPane`);

      $event.target.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
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
      if (type === "Capturer")
        return `
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 168 168" style="enable-background:new 0 0 168 168;" xml:space="preserve">
          <path style="fill:var(--c-orange);" d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84
            C168,37.6,130.4,0,84,0z"/>
          <path style="fill:var(--c-rouge);" d="M84,41.3c-23.6,0-42.7,19.1-42.7,42.7c0,23.6,19.1,42.7,42.7,42.7
            c23.6,0,42.7-19.1,42.7-42.7C126.7,60.4,107.6,41.3,84,41.3z"/>
        </svg>
        `;
      else if (type === "Collecter")
        return `
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
       viewBox="0 0 168 168" style="enable-background:new 0 0 168 168;" xml:space="preserve">
            <path style="fill:var(--c-rouge);" d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84 C168,37.6,130.4,0,84,0z"/>
            <path style="fill:var(--c-orange);" d="m42 42h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m73.2 42h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m104.4 42h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m42 73.5h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m73.2 73.5h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m104.4 73.5h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m42 105h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m73.2 105h21.6v21h-21.6z"/>
            <path style="fill:var(--c-orange);" d="m104.4 105h21.6v21h-21.6z"/>
          </svg>
        `;
      else if (type === "Remixer")
        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
            <circle cx="84.13" cy="84" r="84" style="fill: var(--c-bleuvert)"/>
            <path d="M115.33,27.75A4.07,4.07,0,0,1,118,25.89a4.44,4.44,0,0,1,3.48.67,4.51,4.51,0,0,1,2,3,4.13,4.13,0,0,1-.7,3.17l-10.6,14.72h-8.91ZM90.85,28.89A5.87,5.87,0,1,1,85,34.76,5.87,5.87,0,0,1,90.85,28.89Zm-21.39-10a8.53,8.53,0,1,1-8.53,8.53A8.54,8.54,0,0,1,69.46,18.92ZM45.51,50.58h77v8.78h-77ZM49.35,67.3h69.3c9.74,8.63,15.1,20.17,15.1,32.56a42.54,42.54,0,0,1-9.38,26.47L119.63,121l-4.41-5-4.41,5-6.35,7.18L98.11,121l-4.41-5-4.41,5-6.35,7.18L76.59,121l-4.41-5-4.41,5-6.35,7.18L55.07,121l-4.41-5-4.41,5-3.6,4.08a42.38,42.38,0,0,1-8.4-25.2C34.26,87.47,39.61,75.93,49.35,67.3ZM35.24,136.49h5.15l10.28-11.63L61.42,137l10.76-12.17L82.94,137,93.7,124.86,104.46,137l10.75-12.17,10.28,11.63h5.15v8.59H35.24Z" 
              style="fill: var(--c-bleumarine)"/>
          </svg>
        `;
      else if (type === "Publier")
        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
            <circle cx="84" cy="84" r="84" style="fill: var(--c-bleumarine)"/>
            <path d="M129.4,143.86H38.62V25.42H129.4Z" style="fill: var(--c-bleuvert)"/>
            <rect x="53.82" y="39.01" width="26.85" height="10.37" style="fill: var(--c-bleumarine)"/>
            <rect x="53.82" y="54.17" width="26.84" height="9.53" style="fill: var(--c-bleumarine)"/>
            <rect x="87.34" y="39.01" width="26.85" height="24.68" style="fill: var(--c-bleumarine)"/>
            <rect x="53.76" y="71.22" width="60.49" height="29.07" style="fill: var(--c-bleumarine)"/>
            <rect x="53.76" y="105.8" width="26.85" height="23.66" style="fill: var(--c-bleumarine)"/>
            <rect x="87.35" y="105.8" width="26.85" height="23.66" style="fill: var(--c-bleumarine)"/>
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
  position: relative;
  z-index: 10;
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
  // margin: calc(var(--spacing) / 2);
  // gap: calc(var(--spacing) / 2);

  overflow: auto;

  > * {
    flex: 0 0 0;
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

  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.03em;

  // border-radius: 4px;
  color: var(--color-active);

  &.is--enabled {
    color: white;
    background-color: var(--color-active);
  }

  sl-icon-button::part(base) {
    color: currentColor;
  }
}

._inlineBtn {
  position: relative;
  display: block;
  // width: var(--height-panebutton);
  // height: var(--height-panebutton);

  // margin: -8px 2px -8px calc(-1 * var(--spacing));

  // padding: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

._btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  gap: calc(var(--spacing) / 2);
  transition: all 0.4s ease-out;
  cursor: pointer;

  width: 100%;
  height: 100%;
  //
}

._icon {
  width: 2rem;
  height: 2rem;
}
</style>
