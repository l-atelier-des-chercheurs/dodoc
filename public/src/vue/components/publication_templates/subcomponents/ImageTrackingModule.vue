<template>
  <portal to="modal_container">
    <div>
      <img :src="'/' + mind_and_results[0].target" class="_refImg" />

      <template v-if="!is_loading">
        <a-scene
          :mindar-image="`imageTargetSrc: ${mind_and_results[0].mind}; filterMinCF:0.1; filterBeta: 10;`"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          color-space="sRGB"
          renderer="colorManagement: true, physicallyCorrectLights"
        >
          <a-assets>
            <img id="result" :src="'/' + mind_and_results[0].result" />
          </a-assets>

          <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

          <a-entity mindar-image-target="targetIndex: 0">
            <a-plane
              src="#result"
              position="0 0 0"
              height="0.552"
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

      <!-- <pre>
      {{ mind_and_results }}
    </pre> -->
    </div>
  </portal>
</template>
<script>
export default {
  props: {
    ar_blocks: Array,
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
    mind_and_results: {
      handler() {
        if (this.mind_and_results.length > 0) this.initAR();
      },
      immediate: true,
    },
  },
  computed: {
    mind_and_results() {
      return this.ar_blocks.reduce((acc, block) => {
        if (block.mind && block.result._linked_media) {
          acc.push({
            // id: block.id,
            mind: `/_publications/${this.slugPubliName}/${block.mind.media_filename}`,
            result: block.result._linked_media.thumbs.find(
              (t) => t.size === 1600
            ).path,
            target: block.target._linked_media.thumbs.find(
              (t) => t.size === 1600
            ).path,
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
._refImg {
  width: 50px;
}
</style>
