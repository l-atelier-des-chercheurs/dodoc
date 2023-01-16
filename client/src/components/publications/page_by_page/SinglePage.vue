<template>
  <div class="_singlePage" :style="page_styles">
    <div class="_htmlLayer">PLOP</div>
  </div>
</template>
<script>
export default {
  props: {
    id: String,
    width: Number,
    height: Number,
  },
  components: {},
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

  width: var(--page-width, 10cm);
  height: var(--page-height, 10cm);

  background: white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

._htmlLayer {
  position: absolute;
  top: 0;
  left: 0;
  contain: layout style size;

  transform: scale(0.4386);
}
</style>
