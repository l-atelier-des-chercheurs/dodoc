<template>
  <div class="_singlePage" :style="page_styles">
    <!-- <div class="_htmlLayer"> -->
    <MoveableComp />
  </div>
</template>
<script>
import MoveableComp from "@/components/publications/page_by_page/MoveableComp.vue";
export default {
  props: {
    id: String,
    width: Number,
    height: Number,
  },
  components: {
    MoveableComp,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    page_styles() {
      return `
        --page-width: ${this.width}cm;
        --page-height: ${this.height}cm;
      `;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._singlePage {
  display: block;
  position: relative;

  width: var(--page-width, 10cm);
  height: var(--page-height, 10cm);

  background: white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

._htmlLayer {
  // position: absolute;
  // top: 0;
  // left: 0;
  // contain: layout style size;
  width: 100%;
  height: 100%;

  // transform: scale(0.4386);
}

.target {
  width: 50px;
  height: 50px;
}
</style>
