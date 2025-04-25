<template>
  <div class="_destinationCorpusSelector">
    <select
      :value="selected_destination_folder_path"
      class="u-select"
      @change="
        $emit(
          'update:selected_destination_folder_path',
          selected_destination_folder_path
        )
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
    modelValue: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      selected_destination_folder_path: this.modelValue,
      folders: [],
      fetch_spaces_error: null,
    };
  },
  watch: {
    modelValue(newVal) {
      this.selected_destination_folder_path = newVal;
    },
  },
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
          this.selected_destination_folder_path = destination_folders[0].$path;
          this.$emit(
            "update:selected_destination_folder_path",
            this.selected_destination_folder_path
          );
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
