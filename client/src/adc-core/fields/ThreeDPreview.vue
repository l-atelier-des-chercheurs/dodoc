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
      :rotation="{
        x: Math.PI / 12,
        y: -Math.PI / 12,
        z: 0,
      }"
      :background-alpha="0.5"
      :background-color="0xffffff"
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
    return {};
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
