<template>
  <div class="_fileList">
    <template v-if="listed_files.length === 0">
      {{ $t("no_files") }}
    </template>
    <template v-else>
      <div class="_file" v-for="(file, i) in listed_files" :key="i">
        <DownloadFile v-if="file && file.$path" class="_link" :file="file">
          <MediaContent
            class="_preview"
            :file="file"
            :resolution="50"
            v-if="
              ['image', 'video', 'audio', 'pdf', 'stl', 'url'].includes(
                file.$type
              )
            "
          />
          <sl-icon
            name="file-earmark-arrow-down-fill"
            class="_preview"
            v-else
          />
          <span class="_link--filename" v-text="file.$media_filename" />
        </DownloadFile>

        <sl-icon-button
          name="x"
          size="small"
          v-if="can_edit"
          @click.prevent="removeFile(file.$path)"
        />
      </div>
    </template>

    <div class="_addBtn">
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
    downloadable_files: {
      type: Array,
      default: () => [],
    },
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
    listed_files() {
      return this.downloadable_files.reduce((acc, meta_filename) => {
        const m = this.getMediaInFolder({
          folder_path: this.folder_path,
          meta_filename,
        });
        if (m) acc.push(m);
        return acc;
      }, []);
    },
  },
  methods: {
    async selectMedia({ path_to_source_media_meta }) {
      const new_file = this.getFilename(path_to_source_media_meta);
      const files = this.downloadable_files.slice() || [];
      files.push(new_file);
      this.updateFiles(files);
    },
    async removeFile(path) {
      let _files = this.downloadable_files.slice();
      _files = _files.filter((f) => !path.endsWith("/" + f));
      this.updateFiles(_files);
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

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);

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
    align-items: stretch;

    gap: calc(var(--spacing) / 4);
    border-radius: 4px;

    justify-content: space-between;

    &:hover {
      background: var(--c-gris);
    }

    ._link {
      flex: 1 1 auto;
      overflow: hidden;

      display: block;

      font-variant: none;
      font-weight: 400;
      letter-spacing: 0;
      font-size: var(--sl-font-size-x-small);
      text-decoration: none;

      display: flex;
      flex-flow: row nowrap;

      ._preview {
        flex: 0 0 auto;
        font-size: 100%;

        width: 25px;
        height: 25px;
        overflow: hidden;

        ::v-deep ._mediaContent--image {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
          max-width: none;
        }
      }

      ._link--filename {
        // text-overflow: ellipsis;
        // white-space: nowrap;
        // overflow: hidden;
        white-space: break-spaces;
      }
    }
  }
}

._addBtn {
  text-align: center;
}
</style>
