<template>
  <div class="_contributeView">
    <LoaderSpinner v-if="!shared_folder_path" />
    <template v-else>
      <div class="_topBarIndication">
        <div
          v-for="pane of possible_panes"
          :key="pane.key"
          class="_topBarIndication--item"
          :style="setTopbarWidth(pane.key)"
          @click="togglePane(pane.key)"
        >
          <span class="_topBarIndication--item--names">
            <b-icon :icon="pane.icon" />
            {{ pane.label }}
          </span>
        </div>
      </div>

      <splitpanes
        class="_splitpanes"
        watch-slots
        @resize="resizeTopPane"
        @resized="resizedPane"
      >
        <pane
          v-for="pane_type in ['archive', 'collection']"
          :size="panes_width[pane_type]"
          :key="pane_type"
        >
          <!-- <div v-if="pane_type === 'chutier'" class="_myContent">
            <MyChutier
              class="_myContent--chutier"
              v-show="show_chutier"
              :shared_folder_path="shared_folder_path"
              @close="show_chutier = false"
            />
          </div> -->
          <div v-if="pane_type === 'archive'" class="_sharedContent">
            <SharedFolder2 :shared_folder_path="shared_folder_path" />
          </div>
          <CollectionsPane v-else-if="pane_type === 'collection'" />
        </pane>
      </splitpanes>
    </template>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";
import SharedFolder2 from "@/components/archive/SharedFolder2.vue";
import CollectionsPane from "@/components/collections/CollectionsPane.vue";

export default {
  props: {},
  components: {
    Splitpanes,
    Pane,
    SharedFolder2,
    CollectionsPane,
  },
  data() {
    return {
      path: "folders",
      folders: undefined,
      shared_folder_path: undefined,

      possible_panes: [
        // {
        //   key: "chutier",
        //   label: "CHUTIER",
        //   icon: "layout-sidebar-inset",
        // },
        {
          key: "archive",
          label: "ARCHIVE",
          icon: "grid3x3-gap",
        },
        {
          key: "collection",
          label: "COLLECTION",
          icon: "layout-sidebar-inset-reverse",
        },
      ],
      top_panes_width: {
        archive: 50,
        collection: 50,
      },

      panes_width: {
        archive: 50,
        collection: 50,
      },

      // show_chutier:
      //   localStorage.getItem("show_chutier") === "false" ? false : true,
      show_chutier: true,
    };
  },
  async created() {
    // todo add lang selector instead
    // this.$i18n.locale = "fr";

    const saved_panes_width = this.loadPanesWidthFromStorage();
    if (saved_panes_width) this.panes_width = saved_panes_width;
    else {
      if (this.$root.is_mobile_view) {
        this.panes_width.archive = 100;
        this.panes_width.collection = 0;
      } else {
        this.panes_width.archive = 100;
        this.panes_width.collection = 0;
      }
    }

    await this.loadFolder();
    // check if necerray to login or create account :
  },
  async mounted() {},
  beforeDestroy() {},
  watch: {
    connected_as() {},
    panes_width: {
      handler() {
        Object.entries(this.panes_width).map(
          ([pane, w]) => (this.top_panes_width[pane] = w)
        );

        this.savePanesWidthToStorage();
      },
      deep: true,
    },
  },
  computed: {
    min_toppane_width() {
      // return (20 / this.$root.window.innerWidth) * 100;
      return 0;
    },
  },
  methods: {
    async loadFolder() {
      await this.$api.getFolders({
        path: `authors`,
      });

      this.folders = await this.$api
        .getFolders({
          path: this.path,
        })
        .catch((err) => {
          this.fetch_spaces_error = err.response;
          // this.is_loading = false;
          return;
        });
      if (this.folders.length === 0) {
        await this.createFolder();
        window.location.reload();
      } else {
        this.shared_folder_path = this.folders[0].$path;
      }
    },
    async createFolder() {
      try {
        const new_space_slug = await this.$api.createFolder({
          path: this.path,
          additional_meta: {
            title: "default",
            $admins: "everyone",
          },
        });
        return new_space_slug;
      } catch (err) {
        // this.error_msg = "Error: " + err.message;
        // setTimeout(() => {
        //   this.error_msg = "";
        // }, 5000);
        // this.is_creating_project = false;
      }
    },
    resizeTopPane(panes_sizes) {
      // real time resize
      panes_sizes.map((ps, index) => {
        const pane_width = Number(ps.size.toFixed(1));
        if (index === 0) this.top_panes_width.archive = pane_width;
        if (index === 1) this.top_panes_width.collection = pane_width;
      });
    },
    resizedPane(panes_sizes) {
      // when resize end
      panes_sizes.map((ps, index) => {
        const pane_width = Number(ps.size.toFixed(1));
        if (index === 0) this.panes_width.archive = pane_width;
        if (index === 1) this.panes_width.collection = pane_width;
      });
    },
    setTopbarWidth(pane) {
      const w = this.top_panes_width[pane];
      return `
        --topPane-width: ${w}%;
      `;
    },
    togglePane(pane) {
      if (this.panes_width[pane] > 0) {
        Object.entries(this.panes_width).map(([key, w]) =>
          key === pane
            ? (this.panes_width[key] = 0)
            : (this.panes_width[key] = 100)
        );
      } else {
        Object.entries(this.panes_width).map(
          ([key, w]) => (this.panes_width[key] = 50)
        );
      }
      debugger;
    },
    savePanesWidthToStorage() {
      localStorage.setItem("panes_width", JSON.stringify(this.panes_width));
    },
    loadPanesWidthFromStorage() {
      try {
        const _panes_width = localStorage.getItem("panes_width");
        if (_panes_width) {
          const panes = JSON.parse(_panes_width);
          if (panes.format) delete panes.format;
          if (panes.chutier) delete panes.chutier;
          return panes;
        }
      } catch (e) {
        e;
      }
      return false;
    },
  },
};
</script>
<style lang="scss" scoped>
._contributeView {
  height: 100%;
  overflow: hidden;
}
._panes {
  height: 100%;
}

// ._myContent {
//   position: absolute;
//   z-index: 2;

//   width: 100%;
//   min-width: 100px;
//   height: 100%;
//   background: var(--chutier-bg);
//   // box-shadow: -4px 0px 5px inset rgba(0, 0, 0, 0.52);
//   overflow: hidden;
// }
._sharedContent {
  position: relative;
  z-index: 1;
  height: 100%;
}

._chutierBtn {
  position: absolute;
  // height: 100%;
  top: 0;
  right: 0;

  z-index: 1;

  transition: transform 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  > button {
    position: absolute;
    width: 100%;
    height: 100%;
    color: white;
    border-radius: 50%;
    // top: 0;

    // top: calc(var(--spacing) / 2);
    left: 0;
    font-size: 1.5rem;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    transform-origin: center;

    // transition: transform 0.8s cubic-bezier(0.19, 1, 0.3, 1.32);
    transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);

    &:hover,
    &:focus-visible {
      color: hsl(0, 0%, 80%);
    }
  }

  &:not(.is--showingChutier) {
    height: 100%;

    > button {
      // transform: rotate(-540deg);
      transform: rotate(-180deg);
    }
  }
}

._splitpanes {
  height: calc(100% - 20px);
  overflow: hidden;
}

._topBarIndication {
  display: flex;
  flex-flow: row nowrap;
  height: 24px;
  padding-left: 1px;
}

._topBarIndication--item {
  height: 24px;
  padding: 2px 6px;
  line-height: 1;
  font-size: var(--sl-font-size-small);
  font-family: "IBM Plex Mono";

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: calc(var(--spacing) / 2);
  white-space: nowrap;
  overflow: hidden;
  min-width: 23px;
  flex: 1 1 var(--topPane-width);

  background: var(--h-100);
  color: var(--h-700);

  // border-bottom: 1px solid #ccc;
  border-right: 1px solid var(--r-600);

  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &:last-child {
    border-right: none;
  }

  &::after {
    content: "✕";
    position: relative;
    opacity: 0;
    transition: all 0.05s cubic-bezier(0.19, 1, 0.22, 1);
  }

  &:hover,
  &:focus-visible {
    background: var(--h-300);

    &::after {
      opacity: 1;
    }
  }
}

._topBarIndication--item--names {
  display: flex;
  flex-flow: row nowrap;
  gap: 4px;
}
</style>
