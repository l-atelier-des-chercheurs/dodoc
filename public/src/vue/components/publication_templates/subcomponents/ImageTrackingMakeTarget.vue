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
    medias: Array,
    slugPubliName: String,
  },
  components: {
    UploadFile,
  },
  data() {
    return {
      exportedBuffer: undefined,
      current_progress: false,

      is_sending_target: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    targets_metafilename() {
      return this.medias.map((m) => m.metaFileName);
    },
    targets_thumbs() {
      return this.medias.map(
        (m) => m._linked_media.thumbs.find((t) => t.size === 1600).path
      );
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

        let tasks = [];
        this.targets_thumbs.map((tt) => {
          tasks.push(
            new Promise((resolve) => this.loadImage(tt).then(resolve))
          );
        });

        // from https://github.com/hiukim/mind-ar-js/blob/master/examples/image-tracking/compile.html
        Promise.all(tasks).then((images) => {
          if (this.$root.state.dev_mode === "debug")
            console.log(`ImageTrackingMakeTarget: image loaded`);

          compiler
            .compileImageTargets(images, (progress) => {
              this.current_progress = progress.toFixed(2);
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

              return this.$root.createMedia({
                slugFolderName: this.slugPubliName,
                type: "publications",
                rawData: new Blob([exportedBuffer]),
                additionalMeta: {
                  type: "other",
                  extension: "mind",
                  is_mind_for: this.targets_metafilename.join("/"),
                },
              });
            })
            .then((mdata) => {
              this.current_progress = false;
              this.is_sending_target = false;
            })
            .catch((err) => {
              this.current_progress = false;
              this.is_sending_target = false;
              this.$alertify
                .closeLogOnClick(true)
                .delay(4000)
                .error(this.$t("notifications.failed_to_save_media"));
            });
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
  },
};
</script>
<style lang="scss" scoped></style>
