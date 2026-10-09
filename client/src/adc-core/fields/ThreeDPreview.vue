<template>
  <div
    @click.stop.prevent
    @mousedown.stop.prevent
    @mousewheel.stop.prevent
    @drag.stop.prevent
    @dragstart.stop.prevent
    @dragend.stop.prevent
  >
    <component
      :is="tag"
      ref="viewer"
      :src="src"
      :rotation="rotation"
      :background-alpha="0.5"
      :background-color="background_color"
      :lights="lights"
      @on-load="$emit('loaded')"
    />
  </div>
</template>
<script>
import { ModelStl, ModelObj } from "vue-3d-model";

export default {
  props: {
    file_type: String,
    src: String,
    // saved point of view, see getViewMatrix
    view_matrix: Array,
  },
  components: {
    ModelStl,
    ModelObj,
  },
  data() {
    return {
      background_color: "#f5f8ff",
      // read once: the camera already shows a newly saved view
      rotation: this.viewToRotation(this.view_matrix),
      lights: [
        {
          type: "AmbientLight",
          color: 0xffffff,
          intensity: 0.42,
        },
        {
          type: "DirectionalLight",
          color: 0xffffff,
          intensity: 0.78,
          position: { x: 1.2, y: 1.4, z: 1.1 },
        },
        {
          type: "DirectionalLight",
          color: 0xdde6ff,
          intensity: 0.28,
          position: { x: -1.1, y: 0.3, z: 0.5 },
        },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    tag() {
      if (this.file_type === "obj") return "ModelObj";
      return "ModelStl";
    },
  },
  methods: {
    viewToRotation(r) {
      if (!Array.isArray(r) || r.length !== 9)
        return { x: Math.PI / 18, y: -Math.PI / 10, z: 0 };

      // camera starts looking down -z: the view is the model rotation,
      // converted back to a three.js "XYZ" euler
      const y = Math.asin(Math.max(-1, Math.min(1, r[2])));
      if (Math.abs(r[2]) < 0.9999999)
        return { x: Math.atan2(-r[5], r[8]), y, z: Math.atan2(-r[1], r[0]) };
      return { x: Math.atan2(r[7], r[4]), y, z: 0 };
    },
    // rotation from model to camera space, row-major 3x3, as used by
    // core2/mesh-thumb.js to render thumbs
    getViewMatrix() {
      const { camera, object } = this.$refs.viewer || {};
      if (!camera || !object) return false;

      camera.updateMatrixWorld();
      object.updateMatrixWorld();
      const m = camera.matrixWorldInverse
        .clone()
        .multiply(object.matrixWorld).elements;

      // three.js matrices are column-major, drop scale from each column
      const cols = [0, 1, 2].map((j) => {
        const col = [m[j * 4], m[j * 4 + 1], m[j * 4 + 2]];
        const length = Math.hypot(...col) || 1;
        return col.map((v) => v / length);
      });
      return [0, 1, 2].flatMap((i) => cols.map((col) => +col[i].toFixed(5)));
    },
  },
};
</script>
<style lang="scss" scoped></style>
