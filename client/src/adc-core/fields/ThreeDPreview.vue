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
      :src="src"
      :rotation="rotation"
      :background-alpha="0.5"
      :background-color="background_color"
      :lights="lights"
    />
  </div>
</template>
<script>
import { ModelStl, ModelObj } from "vue-3d-model";

export default {
  props: {
    file_type: String,
    src: String,
  },
  components: {
    ModelStl,
    ModelObj,
  },
  data() {
    return {
      background_color: "#f5f8ff",
      rotation: {
        x: Math.PI / 18,
        y: -Math.PI / 10,
        z: 0,
      },
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
  methods: {},
};
</script>
<style lang="scss" scoped></style>
