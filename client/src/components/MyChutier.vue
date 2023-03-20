<template>
  <div class="_myChutier">
    <div class="_topContent">
      <h1>MyChutier</h1>
      <div class="_importBtn">
        <input
          type="file"
          multiple="multiple"
          :id="id + '-add_file'"
          name="file"
          accept=""
          class="inputfile-2"
          @change="updateInputFiles($event)"
        />
        <label :for="id + '-add_file'">
          <svg width="20" height="17" viewBox="0 0 20 17">
            <path
              d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
            />
          </svg>
          {{ $t("import") }}
        </label>
        <UploadFiles
          v-if="selected_files.length > 0"
          :selected_files="selected_files"
          :path="path"
          @close="selected_files = []"
        />
      </div>
    </div>
    <div v-if="chutier" class="_items">
      <div class="_item" v-for="file in chutier.$files" :key="file.$path">
        <MediaContent
          class="_item--preview"
          :file="file"
          :context="'preview'"
        />
        <TitleField
          :field_name="'title'"
          class="_title"
          :content="file.title || file.$media_filename"
          :path="file.$path"
          :required="true"
          :maxlength="40"
          :can_edit="true"
        />
        <TitleField
          :field_name="'description'"
          class="_description"
          :content="file.description"
          :path="file.$path"
          :required="false"
          :maxlength="240"
          :can_edit="true"
        />

        <button
          type="button"
          class="u-button u-button_transparent"
          @click="moveToSharedSpace(file.$path)"
        >
          <sl-icon name="arrow-right-square" />
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    shared_space_path: String,
  },
  components: {},
  data() {
    return {
      chutier: undefined,
      selected_files: [],
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,
    };
  },
  created() {},
  mounted() {
    this.listChutier();
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    path() {
      return this.connected_as.$path;
    },
  },
  methods: {
    async listChutier() {
      this.chutier = await this.$api
        .getFolder({
          path: this.path,
        })
        .catch((err) => {
          this.fetch_project_error = err.response;
          this.is_loading = false;
        });
    },
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    async moveToSharedSpace(file_path) {
      const destination_path_to_folder = this.shared_space_path;
      await this.$api.copyFile({ path: file_path, destination_path_to_folder });
    },
  },
};
</script>
<style lang="scss" scoped>
._myChutier {
  // padding: 0 calc(var(--spacing) / 1);
}
._topContent {
  padding: 0 calc(var(--spacing) / 1);
}
._importBtn {
  padding: calc(var(--spacing) / 1) 0;
}

._items {
  padding: calc(var(--spacing) / 2) 0;
}

._item {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  width: 100%;
  border-bottom: 1px solid black;
}
._item--preview {
  height: 100px;
  width: 100px;
  flex: 0 0 auto;
  overflow: hidden;

  ::v-deep ._mediaContent--image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}
</style>
