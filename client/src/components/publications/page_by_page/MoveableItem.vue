<template>
  <div class="container">
    <!-- <div class="" style="position: absolute">
      {{ transform }}
    </div> -->
    <div class="target">
      <img :src="`${$root.publicPath}i_logo.svg`" />
    </div>
    <!-- <div class="target">
      <img :src="`${$root.publicPath}images/i_add.svg`" />
    </div> -->
    <Moveable
      v-if="is_loaded"
      className="moveable"
      :target="['.target']"
      :bounds="{ left: 0, right: 0, top: 0, bottom: 0, position: 'css' }"
      :draggable="true"
      :scalable="true"
      :rotatable="true"
      :keepRatio="true"
      :padding="{ left: 5, right: 5, top: 5, bottom: 5 }"
      @drag="onDrag"
      @scale="onScale"
      @rotate="onRotate"
    />
  </div>
</template>
<script>
import Moveable from "vue-moveable";

export default {
  name: "app",
  props: {
    src: String,
  },
  components: {
    Moveable,
  },
  data() {
    return {
      transform: undefined,
      is_loaded: false,
    };
  },
  created() {},
  mounted() {
    this.is_loaded = true;
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    /* eslint-disable no-unused-vars */
    onDrag({ target, transform }) {
      // this.transform = transform;
      debugger;
      target.style.transform = transform;
    },
    onScale({ target, drag }) {
      // this.transform = drag.transform;
      target.style.transform = drag.transform;
    },
    onRotate({ target, drag }) {
      // this.transform = drag.transform;
      target.style.transform = drag.transform;
    },
  },
};
</script>
<style lang="scss" scoped></style>
