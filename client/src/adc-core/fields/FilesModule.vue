<template>
  <div class="_fileList">
    <template v-if="listed_files.length === 0">
      <div class="u-instructions">
        {{ $t("no_files") }}
      </div>
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
          <div v-else class="_preview" />
          <span class="_link--filename" v-text="file.$media_filename" />
          <b-icon icon="file-earmark-arrow-down" />
        </DownloadFile>

        <button
          type="button"
          v-if="can_edit"
          class="u-button u-button_icon"
          @click.prevent="removeFile(file.$path)"
        >
          <b-icon icon="x" />
        </button>
      </div>
    </template>

    <div class="_addBtn" v-if="can_edit">
      <LoaderSpinner v-if="is_loading" />
      <button
        type="button"
        class="u-button u-button_small u-button_bleuvert _addFile"
        :disabled="is_loading"
        @click="show_picker = !show_picker"
      >
        <b-icon icon="plus-circle" />
        <span>{{ $t("add") }}</span>
      </button>

      <PickMediaFromProjects
        v-if="show_picker"
        :title="$t('pick_medias')"
        :path="project_path"
        :select_mode="'multiple'"
        @pickMedias="pickMedias"
        @close="show_picker = false"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    field_name: String,
    path: String,
    project_path: String,
    content: {
      type: Array,
      default: () => [],
    },
    can_edit: Boolean,
  },
  components: {},
  provide() {
    return {
      $getMetaFilenamesAlreadyPresent: () =>
        this.meta_filenames_already_present,
    };
  },
  data() {
    return {
      show_picker: false,
      is_loading: false,
      processing_file_index: 0,
      processing_file_count: 0,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    listed_files() {
      return this.content.reduce((acc, meta_filename) => {
        const m = this.getMediaInFolder({
          folder_path: this.project_path,
          meta_filename,
        });
        if (m) acc.push(m);
        return acc;
      }, []);
    },
    meta_filenames_already_present() {
      const current = [];

      this.listed_files.map((lf) => {
        current.push(this.getFilename(lf.$path));
      });

      return [
        {
          label: this.$t("on_this_list"),
          medias: current,
          color: "var(--c-orange)",
        },
      ];
    },
  },
  methods: {
    async pickMedias(medias) {
      this.is_loading = true;
      let new_files = [];

      this.processing_file_index = 0;
      this.processing_file_count = medias.length;

      // for each media, check if it's already in project
      // if not, copy it to project
      for (const m of medias) {
        const media_already_in_project =
          this.getParent(m.$path) === this.project_path;

        if (!media_already_in_project) {
          const new_file = await this.$api.copyFile({
            path: m.$path,
            path_to_destination_folder: this.project_path,
          });
          new_files.push(new_file);
        } else {
          new_files.push(this.getFilename(m.$path));
        }

        this.processing_file_index++;
      }

      // const new_files = medias.map((m) => this.getFilename(m.$path));
      const files = this.content.slice() || [];
      const new_files_list = files.concat(new_files);
      this.updateFiles(new_files_list);
      this.is_loading = false;
    },
    async removeFile(path) {
      let _files = this.content.slice();
      _files = _files.filter((f) => !path.endsWith("/" + f));
      this.updateFiles(_files);
    },
    async updateFiles(files) {
      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          [this.field_name]: files,
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
    min-height: 2em;
    // border: 1px solid var(--c-gris_fonce);

    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    word-break: break-word;
    align-items: stretch;

    gap: calc(var(--spacing) / 4);
    border-radius: 4px;
    overflow: hidden;

    justify-content: space-between;

    &:hover,
    &:focus-visible {
      background: var(--c-gris);
    }

    ._link {
      flex: 1 1 auto;
      overflow: hidden;

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

        flex: 0 0 auto;
        width: 35px;
        height: 35px;
        overflow: hidden;
        background-color: var(--c-gris);

        ::v-deep ._mediaContent--image {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
          max-width: none;
        }
      }

      ._link--filename {
        flex: 1 1 auto;
        white-space: break-spaces;
      }
    }
  }
}

._addBtn {
  text-align: center;
  padding: calc(var(--spacing) / 4);
}
</style>
