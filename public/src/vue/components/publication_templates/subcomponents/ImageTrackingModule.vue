<template>
  <div>
    <!-- <img :src="mind_and_results[0].result" /> -->
    <div ref="imInner" />

    <pre>
      {{ mind_and_results }}
      <!-- {{ medias }} -->
    </pre>
  </div>
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
          });
        }
        return acc;
      }, []);
    },
  },
  methods: {
    initAR() {
      this.is_loading = true;
      const path_to_mindar =
        this.$root.state.mode === "export_publication"
          ? "./_libs/ar/mindar-image-three.prod.js"
          : "/libs/ar/mindar-image-three.prod.js";

      this.$loadScript(path_to_mindar).then(() => {
        if (this.$root.state.dev_mode === "debug")
          console.log(
            `ImageTrackingModule: startImageTracking / mindar has loaded`
          );

        const THREE = window.MINDAR.IMAGE.THREE;
        this.mindarThree = new window.MINDAR.IMAGE.MindARThree({
          container: this.$refs.imInner,
          imageTargetSrc: this.mind_and_results[0].mind,
        });
        const { renderer, scene, camera } = this.mindarThree;
        const anchor = this.mindarThree.addAnchor(0);
        const geometry = new THREE.PlaneGeometry(1, 0.55);
        const material = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.5,
        });
        const plane = new THREE.Mesh(geometry, material);
        anchor.group.add(plane);
        // const start = async () => {
        this.mindarThree.start().then(() =>
          renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
          })
        );

        // detect target found
        this.$refs.imInner.addEventListener("targetFound", (event) => {
          console.log("target found");
        });
        // detect target lost
        this.$refs.imInner.addEventListener("targetLost", (event) => {
          console.log("target lost");
        });
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
