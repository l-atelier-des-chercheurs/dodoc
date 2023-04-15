<template>
  <div
    class="_lumaView"
    :class="{
      'is--mobile_view': $root.is_mobile_view,
    }"
  >
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

          <div
            class="_chutierBtn"
            :class="{
              'is--showingChutier': show_chutier,
            }"
          >
            <button type="button" @click="show_chutier = !show_chutier">
              <sl-icon
                :name="show_chutier ? 'arrow-bar-left' : 'arrow-bar-right'"
              />
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
  --chutier-bar-width: 40px;
  --chutier-width: 420px;

  &.is--mobile_view {
    --chutier-width: 320px;
  }
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

  transform: translate(
    calc(-1 * (var(--chutier-width) - var(--chutier-bar-width))),
    0
  );

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

  // transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);

  &.has--chutier {
    padding-left: var(--chutier-width);
  }
}

._chutierBtn {
  position: absolute;
  // height: 100%;
  top: 0;
  right: 0;
  width: var(--chutier-bar-width);
  height: var(--chutier-bar-width);
  z-index: 1;

  background: transparent;

  transition: transform 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &:not(.is--showingChutier) {
    // height: 100%;
  }

  > button {
    position: absolute;
    width: 100%;
    height: 100%;
    color: white;
    // top: 0;
    top: calc(var(--spacing) / 2);
    left: 0;
    font-size: 1.5rem;
    background: transparent;
  }
}
</style>
