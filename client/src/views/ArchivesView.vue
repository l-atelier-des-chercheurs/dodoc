<template>
  <div class="mainContent">
    <div v-if="!opened_folder_path">
      Espaces archives disponibles
      <ol>
        <li v-for="folder in folders" :key="folder.$path">
          <button type="button" @click="openFolder(folder.$path)">
            {{ folder.title || $t("untitled") }}
          </button>
        </li>
      </ol>
    </div>

    <SharedFolder2
      v-if="opened_folder_path"
      :shared_folder_path="opened_folder_path"
    />
  </div>
</template>
<script>
import SharedFolder2 from "@/components/archive/SharedFolder2.vue";

export default {
  props: {},
  components: {
    SharedFolder2,
  },
  data() {
    return {
      folders: undefined,
      path_to_folders: "folders",
    };
  },
  created() {},
  mounted() {
    this.initFolders();
    debugger;
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    opened_folder_path() {
      if (this.$route.params.folder_slug)
        return "folders/" + this.$route.params.folder_slug;
      return false;
    },
  },
  methods: {
    async initFolders() {
      this.folders = await this.$api.getFolders({
        path: this.path_to_folders,
      });
      if (!this.opened_folder_path) this.openFolder(this.folders[0].$path);
    },
    openFolder(path) {
      const folder_slug = this.getFilename(path);
      this.$router.push("/archives/" + folder_slug);
    },
  },
};
</script>
<style lang="scss" scoped></style>
