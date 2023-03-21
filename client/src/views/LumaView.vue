<template>
  <div class="_lumaView">
    <LoaderSpinner v-if="!shared_folder_path" />
    <template v-else>
      <div class="_panes">
        <div class="_myContent" :key="'myContent'" min-size="5">
          <AuthorList
            v-if="show_authors_modal"
            @close="show_authors_modal = false"
          />
          <MyChutier
            v-if="connected_as"
            :shared_space_path="shared_folder_path"
            @showAuthorModal="showAuthorModal"
          />
        </div>
        <div class="_sharedContent" :key="'sharedContent'" min-size="5">
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
}
._panes {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
}

._myContent {
  // width: 550px;
  // min-height: 550px;
  flex: 0 0 420px;

  height: 100%;
  background: white;
  box-shadow: 0 0px 5px rgb(0 0 0 / 12%);
  // overflow: auto;
}
._sharedContent {
  height: 100%;
  flex: 1 1 auto;
}
</style>
