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
import * as axios from "axios";
import { setTimeout } from "timers";
// import UAparser from "ua-parser-js";

export default {
  props: {
    slugFolderName: String,
    type: String,
    selected_files: Array,
  },
  components: {},
  data() {
    return {
      files_to_upload: this.selected_files,
      files_to_upload_meta: {},
      upload_percentages: 0,

      list_of_medias_to_add_to_fragment: [],
    };
  },
  watch: {},
  mounted() {
    this.sendAllFiles();
  },
  beforeDestroy() {},
  computed: {
    uriToUploadMedia: function () {
      return (
        window.location.origin +
        `/_file-upload/${this.type}/${this.slugFolderName}/?socketid=${this.$root.$socketio.socket.id}`
      );
    },
  },
  methods: {
    sendThisFile(f) {
      return new Promise((resolve, reject) => {
        if (this.$root.state.dev_mode === "debug") {
          console.log(`METHODS • UploadFile / sendThisFile : name = ${f.name}`);
        }

        const filename = f.name;
        const modified = f.lastModified;

        this.$set(this.files_to_upload_meta, filename, {
          upload_percentages: 0,
          status: "sending",
        });

        let formData = new FormData();
        formData.append("files", f, filename);

        let meta = {
          fileCreationDate: modified,
          authors: this.$root.current_author
            ? [{ slugFolderName: this.$root.current_author.slugFolderName }]
            : "",
        };

        // const parser = new UAparser();
        // const result = parser.getResult();
        // if (result) {
        //   meta.device_infos = [];
        //   const browser = Object.assign(result.browser, { type: "browser" });
        //   const device = Object.assign(result.device, { type: "device" });
        //   const os = Object.assign(result.os, { type: "os" });
        //   meta.device_infos.push(browser, device, os);
        // }

        formData.append(filename, JSON.stringify(meta));

        const socketid = this.$socketio.socket.id;
        if (socketid !== undefined) {
          formData.append("socketid", socketid);
        }

        if (this.$root.state.dev_mode === "debug")
          console.log(
            `UploadFile • METHODS: name = ${filename} / formData is ready / sending to ${this.uriToUploadMedia}`
          );

        // TODO : possibilité de cancel
        axios
          .post(this.uriToUploadMedia, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: function (progressEvent) {
              this.files_to_upload_meta[filename].upload_percentages = parseInt(
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              );
            }.bind(this),
          })
          .then((x) => x.data)
          .then((x) => {
            if (this.$root.state.dev_mode === "debug")
              console.log(
                `UploadFile • METHODS: name = ${filename} / success uploading`
              );

            this.files_to_upload_meta[filename].status = "success";
            this.files_to_upload_meta[filename].upload_percentages = 100;

            this.list_of_medias_to_add_to_fragment.push(x.metaFileNames[0]);
            return resolve();

            // const catchMediaCreation = (d) => {
            //   if (this.$root.state.dev_mode === "debug")
            //     console.log(`UploadFile • METHODS: catchMediaCreation`);

            //   if (
            //     d.hasOwnProperty(this.type) &&
            //     d[this.type].hasOwnProperty(this.slugFolderName)
            //   ) {
            //     const new_media = Object.values(
            //       d[this.type][this.slugFolderName].medias
            //     ).find((m) => m.media_filename === x.medias_filenames[0]);

            //     if (new_media) {
            //       console.log(
            //         `UploadFile • METHODS: sendThisFile. Will emit insertMedia for = ${new_media}`
            //       );

            //       this.list_of_medias_to_add_to_fragment.push(new_media);
            //     }
            //     return resolve();
            //   }
            //   this.$eventHub.$once(
            //     `socketio.${this.type}.listMedia`,
            //     catchMediaCreation
            //   );
            // };
            // this.$eventHub.$once(
            //   `socketio.${this.type}.listMedia`,
            //   catchMediaCreation
            // );
            // resolve(x.map(img => Object.assign({}, img, { url: `${BASE_URL}/images/${img.id}` })));
          })
          .catch((err) => {
            if (this.$root.state.dev_mode === "debug")
              console.log(
                `METHODS • sendThisFile: name = ${filename} / failed uploading`
              );

            this.files_to_upload_meta[filename].status = "failed";
            this.files_to_upload_meta[filename].upload_percentages = 0;
            return reject();
          });
      });
    },
    sendAllFiles() {
      const executeSequentially = (array) => {
        return this.sendThisFile(this.files_to_upload[array.shift()]).then(
          (x) => {
            if (this.$root.state.dev_mode === "debug")
              console.log(
                `UploadFile • METHODS: sendAllFiles / finished sending file, onto next`
              );

            return array.length === 0 ? x : executeSequentially(array);
          }
        );
      };

      executeSequentially(
        Array.from(Array(this.files_to_upload.length).keys())
      ).then((x) => {
        if (this.$root.state.dev_mode === "debug")
          console.log(
            `UploadFile • METHODS: sendAllFiles / finished uploading sequentially`
          );
        this.$emit("insertMedias", this.list_of_medias_to_add_to_fragment);
        this.$emit("close", "");
      });

      // const test = async () => {
      //   for (let task of Array.from(Array(this.files_to_upload.length).keys()).map()) {
      //     await sendThisFile(task);
      //   }
      // }
    },
    formatBytes(a, b) {
      if (0 == a) return `0 ${this.$t("bytes")}`;

      var e = [
        this.$t("bytes"),
        this.$t("kb"),
        this.$t("mb"),
        this.$t("gb"),
        "TB",
        "PB",
        "EB",
        "ZB",
        "YB",
      ];

      var c = 1024,
        d = b || 2,
        f = Math.floor(Math.log(a) / Math.log(c));
      return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
    },
    getImgPreview(file) {
      return URL.createObjectURL(file);
    },
    cssStatus(f) {
      if (this.files_to_upload_meta.hasOwnProperty(f.name)) {
        return "is--" + this.files_to_upload_meta[f.name].status;
      }
    },
  },
};
</script>
