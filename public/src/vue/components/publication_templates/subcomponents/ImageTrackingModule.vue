<template>
  <!-- <portal to="modal_container"> -->
  <div class="m_imageTrackingModule">
    <pre>results = {{ results }}</pre>

    <template v-if="!is_loading && mind_file">
      <a-scene
        :mindar-image="`imageTargetSrc: ${mind_file};`"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        color-space="sRGB"
        renderer="colorManagement: true, physicallyCorrectLights"
      >
        <a-assets>
          <template v-for="(medias, index) in results">
            <template v-for="(media, _index) in medias">
              <img
                v-if="media.type === 'image'"
                :key="`result-${index}+${_index}`"
                :id="`result-${index}`"
                :src="'/' + media.src"
              />
              <video
                v-if="media.type === 'video'"
                :key="`result-${index}+${_index}`"
                :id="`result-${index}`"
                :src="'/' + media.src"
                preload="auto"
                autoplay
                loop="true"
                muted
              />
            </template>
          </template>
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

        <a-entity
          v-for="(result, index) in results"
          :mindar-image-target="`targetIndex: ${index}`"
          :key="`result-${index}`"
        >
          <a-plane
            :src="`#result-${index}`"
            position="0 0 0"
            :height="result.ratio"
            width="1"
            rotation="0 0 0"
          />
        </a-entity>
      </a-scene>
    </template>
  </div>
  <!-- </portal> -->
</template>
<script>
export default {
  props: {
    ar_blocks: Array,
    mind: Object,
    slugPubliName: String,
  },
  components: {},
  data() {
    return {
      mindarThree: undefined,
      is_loading: true,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    this.mindarThree.stop();
    this.mindarThree.renderer.setAnimationLoop(null);
  },
  watch: {
    results: {
      handler() {
        if (this.results.length > 0) this.initAR();
      },
      immediate: true,
    },
  },
  computed: {
    mind_file() {
      if (!this.mind || !this.mind.media_filename) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.missing_mind_file"));
        return false;
      }

      return `/_publications/${this.slugPubliName}/${this.mind.media_filename}`;
    },
    results() {
      return this.ar_blocks.reduce((acc, block, index) => {
        if (block.results && block.results.length > 0) {
          acc[index] = [];

          block.results.map((media) => {
            if (media._linked_media) {
              let result = {};

              if (media._linked_media.type === "image") {
                result.src = media._linked_media.thumbs.find(
                  (t) => t.size === 1600
                ).path;
              } else if (media._linked_media.type === "video") {
                result.src = `${media._linked_media.slugProjectName}/${media._linked_media.media_filename}`;
                // result.src = `${media._linked_media.slugFolderName}/${media._linked_media.media_filename}`;
              }

              result.type = media._linked_media.type;
              result.ratio = 1;

              if (media._linked_media.file_meta) {
                const w = media._linked_media.file_meta.find((m) =>
                  m.hasOwnProperty("width")
                ).width;
                const h = media._linked_media.file_meta.find((m) =>
                  m.hasOwnProperty("height")
                ).height;
                if (w && h) result.ratio = Number(h) / Number(w);
              }

              if (result.src) acc[index].push(result);
            }
          });
        }
        return acc;
      }, []);
    },
  },
  methods: {
    initAR() {
      this.$loadScript(
        `https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.1.4/dist/mindar-image.prod.js`
      )
        .then(() =>
          this.$loadScript(`https://aframe.io/releases/1.2.0/aframe.min.js`)
        )
        .then(() =>
          this.$loadScript(
            `https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.1.4/dist/mindar-image-aframe.prod.js`
          )
        )
        .then(() => {
          if (this.$root.state.dev_mode === "debug")
            console.log(
              `ImageTrackingModule: startImageTracking / mindar has loaded`
            );
          this.is_loading = false;

          this.$nextTick(() => {
            this.$nextTick(() => {
              this.$el.querySelectorAll("a-entity").forEach((target, index) => {
                target.addEventListener("targetFound", (event) => {
                  console.log("target found for", index);
                });
              });
            });
          });

          // const THREE = window.MINDAR.IMAGE.THREE;
          // this.mindarThree = new window.MINDAR.IMAGE.MindARThree({
          //   container: this.$refs.imInner,
          //   imageTargetSrc: this.mind_and_results[0].mind,
          // });
          // const { renderer, scene, camera } = this.mindarThree;
          // const anchor = this.mindarThree.addAnchor(0);
          // const geometry = new THREE.PlaneGeometry(1, 0.55);
          // const material = new THREE.MeshBasicMaterial({
          //   color: 0x00ffff,
          //   transparent: true,
          //   opacity: 0.5,
          // });
          // const plane = new THREE.Mesh(geometry, material);
          // anchor.group.add(plane);
          // // const start = async () => {
          // this.mindarThree.start().then(() =>
          //   renderer.setAnimationLoop(() => {
          //     renderer.render(scene, camera);
          //   })
          // );
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.m_imageTrackingModule {
  overflow: hidden;
  position: absolute;
  width: 100vw;
  height: 100vh;
  height: -webkit-fill-available;

  top: 0;
}
._refImg {
  position: absolute;

  width: 50px;
}
</style>
