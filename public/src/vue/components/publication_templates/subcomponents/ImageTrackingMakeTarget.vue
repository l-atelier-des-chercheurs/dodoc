<template>
  <div>
    <button
      type="button"
      class="bg-bleuvert"
      :key="'create_page'"
      @click="makeTarget"
      :disabled="current_progress !== false || is_sending_target"
    >
      <template v-if="current_progress === false">
        {{ $t("create_target") }}
      </template>
      <template v-else> {{ current_progress }}% </template>
    </button>
    <transition name="fade_fast" :duration="150">
      <Loader v-if="is_sending_target" />
    </transition>
  </div>
</template>
<script>
import UploadFile from "../../subcomponents/UploadFile.vue";

export default {
  props: {
    media: Object,
    slugPubliName: String,
  },
  components: {
    UploadFile,
  },
  data() {
    return {
      exportedBuffer: undefined,
      current_progress: false,
      selected_files: [],

      is_sending_target: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    target_thumb() {
      return this.media._linked_media.thumbs.find((t) => t.size === 1600).path;
    },
  },
  methods: {
    makeTarget() {
      this.current_progress = 0;

      const path_to_mindar =
        this.$root.state.mode === "export_publication"
          ? "./_libs/ar/mindar-image.prod.js"
          : "/libs/ar/mindar-image.prod.js";

      this.$loadScript(path_to_mindar).then(() => {
        if (this.$root.state.dev_mode === "debug")
          console.log(`ImageTrackingMakeTarget: mindar has loaded`);

        const compiler = new window.MINDAR.IMAGE.Compiler();

        // from https://github.com/hiukim/mind-ar-js/blob/master/examples/image-tracking/compile.html
        this.loadImage(this.target_thumb)
          .then((image) => {
            if (this.$root.state.dev_mode === "debug")
              console.log(`ImageTrackingMakeTarget: image loaded`);

            return compiler.compileImageTargets([image], (progress) => {
              this.current_progress = progress.toFixed(2);
            });
          })
          .then((dataList) => {
            return compiler.exportData();
          })
          .then((exportedBuffer) => {
            // var blob = new Blob([buffer]);
            // aLink.href = window.URL.createObjectURL(blob);

            // todo : save .mind file somewhere serverside to use when previewing
            this.current_progress = 100;
            this.is_sending_target = true;

            this.$root
              .createMedia({
                slugFolderName: this.slugPubliName,
                type: "publications",
                rawData: new Blob([exportedBuffer]),
                additionalMeta: {
                  type: "other",
                  extension: "mind",
                  page_id: this.media.page_id,
                },
              })
              .then((mdata) => {
                this.current_progress = false;
                this.is_sending_target = false;
                this.$refs.videoElement.play();
              })
              .catch((err) => {
                this.current_progress = false;
                this.is_sending_target = false;
                this.$alertify
                  .closeLogOnClick(true)
                  .delay(4000)
                  .error(this.$t("notifications.failed_to_save_media"));
              });

            this.selected_files = [exportedBuffer];
          });
      });
    },
    loadImage(src) {
      return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
        //img.src = src
      });
    },
    compileFiles(image) {
      // let _start = new Date().getTime();
      // const dataList = await console.log(
      //   "exec time compile: ",
      //   new Date().getTime() - _start
      // );
      // for (let i = 0; i < dataList.length; i++) {
      //   showData(dataList[i]);
      // }
      // const exportedBuffer = await compiler.exportData();
      // document
      //   .getElementById("downloadButton")
      //   .addEventListener("click", function () {
      //     download(exportedBuffer);
      //   });
    },
    uploadTarget() {},
  },
};
</script>
<style lang="scss" scoped></style>
