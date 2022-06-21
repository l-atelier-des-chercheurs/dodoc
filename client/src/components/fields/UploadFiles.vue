<template>
  <div>
    <transition-group tag="div" name="fileupload_list">
      <div
        v-for="(f, index) in files_to_upload"
        :key="f.name"
        class="m_uploadFile"
        :class="cssStatus(f)"
        :style="`--progress-percent: ${
          files_to_upload_meta.hasOwnProperty(f.name)
            ? files_to_upload_meta[f.name].upload_percentages / 100
            : 0
        }`"
      >
        <div class="m_uploadFile--progressBar"></div>

        <img
          v-if="!!f.type && f.type.includes('image') && index < 5"
          class="m_uploadFile--image"
          width="50"
          :src="getImgPreview(f)"
        />
        <div v-else class="m_uploadFile--image" />

        <div :title="f.name" class="m_uploadFile--filename">{{ f.name }}</div>
        <div class="m_uploadFile--size">{{ formatBytes(f.size) }}</div>
        <div
          class="m_uploadFile--action"
          v-if="files_to_upload_meta.hasOwnProperty(f.name)"
        >
          <button
            type="button"
            class="buttonLink"
            @click="sendThisFile(f)"
            :disabled="
              read_only ||
              (files_to_upload_meta.hasOwnProperty(f.name) &&
                files_to_upload_meta[f.name].status === 'success')
            "
          >
            <template v-if="!files_to_upload_meta.hasOwnProperty(f.name)">{{
              $t("import")
            }}</template>
            <template
              v-else-if="files_to_upload_meta[f.name].status === 'success'"
              >{{ $t("sent") }}</template
            >
            <template
              v-else-if="files_to_upload_meta[f.name].status === 'failed'"
              >{{ $t("retry") }}</template
            >
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script>
export default {
  props: {
    selected_files: Array,
    folder_type: String,
    folder_slug: String,
    read_only: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      files_to_upload: this.selected_files,
      files_to_upload_meta: {},
      upload_percentages: 0,
    };
  },
  watch: {},
  mounted() {
    this.sendAllFiles();
  },
  beforeDestroy() {},
  computed: {},
  methods: {
    async sendThisFile(_file_to_upload) {
      const filename = _file_to_upload.name;

      this.$set(this.files_to_upload_meta, filename, {
        upload_percentages: 0,
        status: "sending",
      });

      let formData = new FormData();
      formData.append("file", _file_to_upload, filename);

      (() => {
        let additional_meta = {};
        if (_file_to_upload.lastModified)
          additional_meta.fileCreationDate = _file_to_upload.lastModified;
        // if (this.$root.current_author)
        //   additional_meta.authors = [
        //     { slugFolderName: this.$root.current_author.slugFolderName },
        //   ];
        // if (this.$api.socket.id)
        //   additional_meta.socketid = this.$api.socket.id;
        // additional_meta.caption = "will show up because of schema";
        // additional_meta.title = "will not show up because of schema";
        formData.append(filename, JSON.stringify(additional_meta));
      })();

      const path = `/${this.folder_type}/${this.folder_slug}/_upload`;
      console.log(`Posting to path ${path}`);

      let res = await this.$axios
        .post(path, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            this.files_to_upload_meta[filename].upload_percentages = parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          this.files_to_upload_meta[filename].status = "failed";
          this.files_to_upload_meta[filename].upload_percentages = 0;
          throw err;
        });

      this.files_to_upload_meta[filename].status = "success";
      this.files_to_upload_meta[filename].upload_percentages = 100;

      return res.data.meta_filename;
    },
    async sendAllFiles() {
      let list_of_added_metas = [];

      // for (let i = 0; i < 10; i++) {
      for (const file of this.files_to_upload) {
        const meta_filename = await this.sendThisFile(file);
        if (meta_filename) list_of_added_metas.push(meta_filename);
      }
      // }
      this.$emit("importedMedias", list_of_added_metas);
      this.$emit("close", "");
    },
    getImgPreview(file) {
      return URL.createObjectURL(file);
    },
    cssStatus(f) {
      if (
        Object.prototype.hasOwnProperty.call(this.files_to_upload_meta, f.name)
      ) {
        return "is--" + this.files_to_upload_meta[f.name].status;
      }
    },
    formatBytes(a, b) {
      if (0 == a) return `0 ${"bytes"}`;

      var e = ["bytes", "kb", "mb", "gb", "TB", "PB", "EB", "ZB", "YB"];

      var c = 1024,
        d = b || 2,
        f = Math.floor(Math.log(a) / Math.log(c));
      return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
    },
  },
};
</script>
