<template>
  <portal to="modal_container">
    <div class="m_imageTrackingModule">
      <!-- results = {{ results }}<br /><br />
      mind_file = {{ mind_file }}<br /> -->

      <template v-if="!is_loading">
        <a-scene
          :mindar-image="`imageTargetSrc: ${mind_file};`"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          color-space="sRGB"
          renderer="colorManagement: true, physicallyCorrectLights"
        >
          <a-assets>
            <img
              v-for="(result, index) in results"
              :key="`result-${index}`"
              :id="`result-${index}`"
              :src="'/' + result.src"
            />
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
            ></a-plane>
            <!-- <a-image
              src="#result"
              width="1"
              height="1"
              rotation="0 0 0 "
              position="0 0 0.1"
            ></a-image> -->
            <!-- <a-plane
            src="#result"
            position="0 0 0"
            height="0.552"
            width="1"
            rotation="0 0 0"
          ></a-plane> -->
            <!-- <a-plane
            color="blue"
            opaciy="0.5"
            position="0 0 0"
            height="1"
            width="1"
            rotation="0 0 0"
          ></a-plane> -->
          </a-entity>
        </a-scene>
      </template>
    </div>
  </portal>
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
      return `/_publications/${this.slugPubliName}/${this.mind.media_filename}`;
    },
    results() {
      return this.ar_blocks.reduce((acc, block) => {
        if (block.result._linked_media) {
          const w = block.result._linked_media.file_meta.find((m) =>
            m.hasOwnProperty("width")
          ).width;
          const h = block.result._linked_media.file_meta.find((m) =>
            m.hasOwnProperty("height")
          ).height;
          let ratio = 1;
          if (w && h) {
            ratio = Number(h) / Number(w);
          }

          acc.push({
            src: block.result._linked_media.thumbs.find((t) => t.size === 1600)
              .path,
            ratio,
          });

          // acc.push({
          //   result: {
          //     src: block.result._linked_media.thumbs.find(
          //       (t) => t.size === 1600
          //     ).path,
          //     ratio,
          //   },
          // target: block.target._linked_media.thumbs.find(
          //   (t) => t.size === 1600
          // ).path,
          // });
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
