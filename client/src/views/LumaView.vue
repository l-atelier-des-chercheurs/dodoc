<template>
  <div class="_lumaView">
    <LoaderSpinner v-if="!shared_folder_path" />
    <template v-else>
      <div class="_panes">
        <AuthorList
          v-if="show_authors_modal"
          @close="show_authors_modal = false"
        />

        <div
          v-if="connected_as"
          class="_myContent"
          :class="{
            'is--shown': show_chutier,
          }"
          :key="'myContent'"
        >
          <MyChutier
            v-show="show_chutier"
            :shared_space_path="shared_folder_path"
            @showAuthorModal="showAuthorModal"
            @close="show_chutier = false"
          />
          <div class="_chutierBar">
            <button
              type="button"
              class="u-button"
              @click="show_chutier = !show_chutier"
            >
              <sl-icon name="file-earmark-arrow-down" />
            </button>
          </div>
        </div>

        <div
          class="_sharedContent"
          :class="{
            'has--chutier': show_chutier,
          }"
          :key="'sharedContent'"
        >
          <SharedFolder :shared_folder_path="shared_folder_path" />
        </div>
      </div>
    </template>
  </div>
</template>
<script>
// import { Splitpanes, Pane } from "splitpanes";

import AuthorList from "@/adc-core/author/AuthorList.vue";
import MyChutier from "@/components/MyChutier.vue";
import SharedFolder from "@/components/SharedFolder.vue";

export default {
  props: {},
  components: {
    // Splitpanes,
    // Pane,
    AuthorList,
    MyChutier,
    SharedFolder,
  },
  data() {
    return {
      path: "folders",
      folders: undefined,
      shared_folder_path: undefined,

      show_authors_modal: false,
      show_chutier: true,
    };
  },
  created() {},
  async mounted() {
    // todo add lang selector instead
    this.$i18n.locale = "fr";

    await this.loadFolder();
    // check if necerray to login or create account :

    if (!this.connected_as) this.showAuthorModal();
  },
  beforeDestroy() {},
  watch: {
    connected_as() {
      // if (this.connected_as) {
      // this.show_authors_modal = false;
      // }
    },
  },
  computed: {},
  methods: {
    async loadFolder() {
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
    showAuthorModal() {
      this.show_authors_modal = true;
    },
  },
};
</script>
<style lang="scss" scoped>
._lumaView {
  height: 100%;

  --chutier-width: 320px;
  --chutier-bar-width: 40px;
}
._panes {
  height: 100%;
}

._myContent {
  position: absolute;
  z-index: 1;

  width: var(--chutier-width);
  height: 100%;
  background: var(--chutier-bg);
  box-shadow: 0 0px 10px rgb(0 0 0 / 52%);

  transform: translate(calc(-1 * var(--chutier-width)), 0);

  transition: transform 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--shown {
    transform: translate(0, 0);
  }
}
._sharedContent {
  height: 100%;
  flex: 1 1 auto;
  overflow: auto;
  padding-left: var(--chutier-bar-width);

  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);

  &.has--chutier {
    padding-left: var(--chutier-width);
  }
}

._chutierBar {
  position: absolute;
  height: 100%;
  top: 0;
  left: 100%;
  z-index: 1;
  width: var(--chutier-bar-width);
  color: white;
  background: var(--chutier-bg);
  box-shadow: 0 0px 10px rgb(0 0 0 / 52%);

  transition: transform 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  ._myContent.is--shown & {
    left: calc(100% - var(--chutier-bar-width));
    right: auto;
    background: transparent;
    box-shadow: none;
  }
}
</style>
