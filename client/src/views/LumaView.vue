<template>
  <div class="_lumaView">
    <!-- // identifiez-vous  -->
    <!-- // une fois identifié, accès à son chutier -->
    <!-- // + accès au lot commun -->
    <LoaderSpinner v-if="!first_folder" />
    <template v-else>
      <splitpanes class="_panes">
        <pane class="_myContent" :key="'myContent'" min-size="5">
          <AuthorList
            v-if="show_authors_modal"
            @close="show_authors_modal = false"
          />

          <div class="_subscribeBtn">
            <button type="button" class="_authorBtn" @click="showAuthorModal">
              <template v-if="connected_as">
                {{ connected_as.name }}
              </template>
              <template v-else>{{ $t("login") }}</template>
            </button>
          </div>

          <div v-if="connected_as" class="">
            <MyChutier />
          </div>
        </pane>
        <pane class="_sharedContent" :key="'sharedContent'" min-size="5">
          <EspaceCommun />
        </pane>
      </splitpanes>
    </template>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";

import AuthorList from "@/adc-core/author/AuthorList.vue";
import MyChutier from "@/components/MyChutier.vue";
import EspaceCommun from "@/components/EspaceCommun.vue";

export default {
  props: {},
  components: {
    Splitpanes,
    Pane,
    AuthorList,
    MyChutier,
    EspaceCommun,
  },
  data() {
    return {
      path: "folders",
      folders: undefined,
      show_authors_modal: false,
    };
  },
  created() {},
  async mounted() {
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
  computed: {
    first_folder() {
      if (this.folders && this.folders.length > 0) return this.folders[0];
      return false;
    },
  },
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
      }

      this.$api.join({ room: this.path });
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
}

._myContent {
  width: 550px;
  min-height: 550px;
  height: 100%;
  background: white;
  box-shadow: 0 0px 5px rgb(0 0 0 / 12%);
}

._subscribeBtn {
  padding: calc(var(--spacing) / 1);
}
</style>
