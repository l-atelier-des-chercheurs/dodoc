<template>
  <div class="_uploadFiles">
    <div
      v-for="f in files_to_upload"
      :key="f.name"
      class="_uploadFile"
      :class="cssStatus(f)"
      :style="`--progress-percent: ${
        files_to_upload_meta[f.name].upload_percentages / 100
      }`"
    >
      <div class="_uploadFile--progressBar"></div>

      <img
        v-if="
          !!f.type &&
          f.type.includes('image') &&
          files_to_upload_meta[f.name].status === 'sending'
        "
        class="_uploadFile--image"
        width="50"
        :src="getImgPreview(f)"
      />
      <div v-else class="_uploadFile--image" />

      <div :title="f.name" class="_uploadFile--filename">{{ f.name }}</div>
      <div class="_uploadFile--size">{{ formatBytes(f.size) }}</div>
      <div class="_uploadFile--action">
        <button
          type="button"
          class="u-buttonLink"
          @click="sendThisFile(f)"
          :disabled="files_to_upload_meta[f.name].status !== 'failed'"
        >
          <template v-if="!files_to_upload_meta.hasOwnProperty(f.name)">
            {{ $t("import") }}
          </template>
          <template
            v-else-if="files_to_upload_meta[f.name].status === 'waiting'"
          >
            {{ $t("waiting") }}
          </template>
          <template
            v-else-if="files_to_upload_meta[f.name].status === 'sending'"
          >
            {{ $t("sending") }}
          </template>
          <template
            v-else-if="files_to_upload_meta[f.name].status === 'success'"
          >
            {{ $t("sent") }}
          </template>
          <template
            v-else-if="files_to_upload_meta[f.name].status === 'failed'"
          >
            {{ $t("retry") }}
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    files_to_import: Array,
    path: String,
  },
  components: {},
  data() {
    return {
      files_to_upload: this.files_to_import || [],
      files_to_upload_meta: {},
      upload_percentages: 0,
    };
  },
  watch: {},
  created() {
    this.files_to_upload.map((f) => {
      this.$set(this.files_to_upload_meta, f.name, {
        upload_percentages: 0,
        status: "waiting",
      });
    });
  },
  mounted() {
    this.sendAllFiles();
  },
  beforeDestroy() {},
  computed: {},
  methods: {
    async sendThisFile(file) {
      const filename = file.name;

      this.files_to_upload_meta[filename].status = "sending";

      // let formData = new FormData();
      // formData.append("file", file, filename);

      let additional_meta = {};
      additional_meta.$origin = "collect";
      if (file.lastModified) additional_meta.$date_created = file.lastModified;

      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      const onProgress = (progressEvent) => {
        this.files_to_upload_meta[filename].upload_percentages = parseInt(
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        );
      };

      const { meta_filename } = await this.$api
        .uploadFile({
          path: this.path,
          filename,
          file,
          additional_meta,
          onProgress,
        })
        .catch((err) => {
          if (err.code !== "file_size_limit_exceeded")
            this.$alertify.delay(4000).error(err.message);
          this.files_to_upload_meta[filename].status = "failed";
          this.files_to_upload_meta[filename].upload_percentages = 0;
          throw err;
        });

      this.files_to_upload_meta[filename].status = "success";
      this.files_to_upload_meta[filename].upload_percentages = 100;

      return meta_filename;
    },
    async sendAllFiles() {
      let list_of_added_metas = [];

      for (const file of this.files_to_upload) {
        const meta_filename = await this.sendThisFile(file);
        if (meta_filename) list_of_added_metas.push(meta_filename);
      }

      // TODO : if retrying sending a file we don't emit importedmedias
      this.$emit("importedMedias", list_of_added_metas);

      setTimeout(() => {
        this.$emit("close");
      }, 1000);
    },
    getImgPreview(file) {
      return URL.createObjectURL(file);
    },
    cssStatus(f) {
      return "is--" + this.files_to_upload_meta[f.name].status;
    },
  },
};
</script>
<style lang="scss">
._uploadFiles {
  gap: calc(var(--spacing) / 2);
  display: flex;
  flex-flow: column nowrap;
}

._uploadFile {
  position: relative;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;

  font-size: 75%;
  height: 60px;

  background-color: white;
  color: var(--c-noir);

  border-radius: 4px;
  overflow: hidden;

  ._uploadFile--progressBar {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;

    transform: scale(var(--progress-percent), 1);
    transform-origin: left center;

    transition: all 0.1s;
    background-color: var(--active-color);
  }

  > * {
    flex: 1 1 auto;
    position: relative;
    z-index: 1;
  }

  &.is--success {
  }
  &.is--failed {
    &::before {
      background-color: var(--color-noir);
    }
  }

  ._uploadFile--image {
    display: block;
    flex: 0 0 60px;
    width: 60px;
    height: 60px;
    object-fit: cover;
    padding: 4px;
    object-position: center;
    background-color: rgba(220, 220, 220, 0.4);
  }

  ._uploadFile--filename {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    font-size: 75%;
    color: var(--color-noir);
    padding: calc(var(--spacing) / 4);
  }
  ._uploadFile--size {
    flex: 0 0 70px;
  }
  ._uploadFile--action {
    flex: 0 0 70px;

    button {
      // .bg-bleuvert;
      background-color: transparent;
      color: inherit;
    }
  }
}
</style>
