<template>
  <div class="_destinationCorpusSelector">
    <select
      class="u-select"
      :value="selected_destination_folder_path"
      @change="
        $emit('update:selected_destination_folder_path', $event.target.value)
      "
    >
      <option
        v-for="folder in folders"
        :key="folder.$path"
        :value="folder.$path"
      >
        {{ folder.title || getFilename(folder.$path) }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    selected_destination_folder_path: String,
  },
  data() {
    return {
      folders: [],
      fetch_spaces_error: null,
    };
  },
  watch: {},
  async mounted() {
    await this.listDestinationFolders();
  },
  methods: {
    getFilename(path) {
      return path.split("/").pop();
    },
    async listDestinationFolders() {
      const destination_folders = await this.$api
        .getFolders({
          path: "folders",
        })
        .catch((err) => {
          this.fetch_spaces_error = err.response;
          return;
        });

      if (destination_folders?.length > 0) {
        this.folders = destination_folders;

        if (!this.selected_destination_folder_path) {
          if (localStorage.getItem("last_opened_folder_slug")) {
            this.$emit(
              "update:selected_destination_folder_path",
              "folders/" + localStorage.getItem("last_opened_folder_slug")
            );
          } else {
            this.$emit(
              "update:selected_destination_folder_path",
              destination_folders[0].$path
            );
          }
        }
      } else {
        this.folders = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
._destinationCorpusSelector {
  width: 100%;
}

.u-select {
}
</style>
