<template>
  <div class="_contributeView">
    <LoaderSpinner v-if="is_loading" />
    <template v-else>
      <div class="_selectFolder">
        <div>
          <label for="shared_folder_path">
            {{ $t("access_corpus") }}
          </label>

          <select v-model="shared_folder_path">
            <option value="">{{ $t("select_corpus") }}</option>
            <option
              v-for="folder in folders"
              :key="folder.$path"
              :value="folder.$path"
            >
              {{ folder.title || $t("untitled") }}
            </option>
            <option value="new">+ {{ $t("new_corpus") }}</option>
          </select>
          <div class="u-spacingBottom" />

          <div v-if="shared_folder_path === 'new'" class="u-spacingBottom">
            <!-- <input
              type="text"
              v-model="new_corpus_name"
              :placeholder="$t('new_corpus_name')"
            /> -->
            <TextInput
              :content.sync="new_corpus_name"
              :placeholder="$t('new_corpus_name')"
              :required="true"
              :input_type="'text'"
              :maxlength="30"
            />
          </div>

          <div class="_btnRow">
            <div />
            <button
              v-if="shared_folder_path !== 'new'"
              type="button"
              :disabled="!shared_folder_path"
              class="u-button"
              @click="openFolder(shared_folder_path)"
            >
              {{ $t("open") }}
            </button>
            <button
              v-else-if="shared_folder_path === 'new'"
              type="button"
              class="u-button"
              :disabled="!new_corpus_name || is_creating_corpus"
              @click="createCorpus"
            >
              {{ $t("create") }}
            </button>
          </div>

          <div v-if="is_creating_corpus">
            <LoaderSpinner />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      path: "folders",
      is_loading: true,

      folders: undefined,
      shared_folder_path: "",
      new_corpus_name: "",
      // show_chutier:
      //   localStorage.getItem("show_chutier") === "false" ? false : true,
      show_chutier: true,
      is_creating_corpus: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        access_corpus: "Accéder à un corpus",
        corpus: "Corpus",
        select_corpus: "– sélectionner un corpus –",
        new_corpus: "nouveau corpus",
        new_corpus_name: "Nom du corpus",
      },
      en: {
        access_corpus: "Access a corpus",
        corpus: "Corpus",
        select_corpus: "– select a corpus –",
        new_corpus: "new corpus",
        new_corpus_name: "Corpus name",
      },
    },
  },
  async created() {
    // todo add lang selector instead
    // this.$i18n.locale = "fr";

    await this.loadFolders();
    this.$api.join({ room: this.path });

    const last_opened_folder_slug = localStorage.getItem(
      "last_opened_folder_slug"
    );
    if (last_opened_folder_slug) {
      this.openFolder(last_opened_folder_slug);
    } else if (this.folders) {
      const first_folder = this.folders[0];
      this.openFolder(first_folder.$path);
    }

    this.is_loading = false;
    // check if necerray to login or create account :
  },
  async mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
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
    async loadFolders() {
      this.folders = await this.$api
        .getFolders({
          path: this.path,
        })
        .catch((err) => {
          this.fetch_spaces_error = err.response;
          return;
        });
    },
    openFolder(path) {
      const folder_slug = path.split("/").pop();
      localStorage.setItem("last_opened_folder_slug", folder_slug);
      this.$router.push(`/explore/${folder_slug}`);
    },

    async createCorpus() {
      this.is_creating_corpus = true;
      const slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: this.new_corpus_name,
          $admins: "everyone",
        },
      });
      setTimeout(() => {
        this.shared_folder_path = "folders/" + slug;
        this.is_creating_corpus = false;
      }, 1000);
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

._selectFolder {
  position: relative;
  max-width: 240px;
  padding: var(--spacing);
  margin: var(--spacing) auto;

  > div {
    background: var(--h-100);
    border-radius: 4px;
    padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 2);

    > label {
      font-size: var(--sl-font-size-small);
      font-family: "IBM Plex Mono";
    }
  }
}

._btnRow {
  display: flex;
  flex-flow: row nowrap;
  align-items: space-between;
  justify-content: space-between;
}
</style>
