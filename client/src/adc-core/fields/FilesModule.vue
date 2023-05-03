<template>
  <div class="_fileList">
    <!-- <PickMediaFromProjects
      v-if="show_file_picker"
        :path="current_project_path"
        @selectMedia="fileSelect"
        @close="show_file_picker = false"
      /> -->

    <template v-if="!files || files.length === 0">
      {{ $t("no_files") }}
    </template>
    <template v-else>
      <div class="_file" v-for="(file, i) in files" :key="i">
        <div v-if="file && file.$path" class="u-sameRow">
          <!-- <MediaContent class="_preview" :file="file" :resolution="50" /> -->
          <DownloadFile class="_link" :file="file">
            <sl-icon name="file-earmark-arrow-down" />
            {{ file.$media_filename }}
          </DownloadFile>
        </div>

        <sl-icon-button
          name="x"
          size="small"
          v-if="can_edit"
          @click.prevent="removeFile(i)"
        />
      </div>
      <br />
    </template>

    <div class="">
      <button
        type="button"
        class="u-button u-button_small u-button_bleuvert _addFile"
        v-if="can_edit"
        @click="show_picker = !show_picker"
      >
        {{ $t("add") }}
      </button>

      <PickMediaFromProjects
        v-if="show_picker"
        :path="folder_path"
        @selectMedia="selectMedia"
        @close="show_picker = false"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    folder_path: String,
    downloadable_files: Array,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      show_picker: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    files() {
      if (!this.downloadable_files) return [];
      return this.downloadable_files.map((meta_filename) =>
        this.getMediaInFolder({
          folder_path: this.folder_path,
          meta_filename,
        })
      );
    },
  },
  methods: {
    async selectMedia({ path_to_source_media }) {
      const new_file = this.getFilename(path_to_source_media);
      const files = this.downloadable_files.slice() || [];
      files.push(new_file);
      this.updateFiles(files);
    },
    async removeFile(i) {
      const files = this.downloadable_files.slice().splice(i + 1, 1);
      this.updateFiles(files);
    },
    async updateFiles(files) {
      await this.$api.updateMeta({
        path: this.folder_path,
        new_meta: {
          downloadable_files: files,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._fileList {
  padding: 0;
  margin: 0;

  > ._file {
    // margin: calc(var(--spacing) / 4) 0;
    padding: 0;
    border-radius: 2px;
    min-height: 2em;
    // border: 1px solid var(--c-gris_fonce);

    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    word-break: break-word;
    align-items: center;

    gap: calc(var(--spacing) / 4);

    justify-content: space-between;

    ._preview {
      width: 2rem;
      aspect-ratio: 1/1;

      flex: 0 0 auto;
    }

    ._link {
      display: block;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;

      font-variant: none;
      font-weight: 400;
      letter-spacing: 0;
      font-size: var(--sl-font-size-small);
    }
  }
}
</style>
