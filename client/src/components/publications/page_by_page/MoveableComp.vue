<template>
  <div class="container" ref="container">
    <MoveableItem
      v-for="item in items"
      :key="item.src"
      :src="`${$root.publicPath}${item.src}`"
    />
  </div>
</template>
<script>
import MoveableItem from "@/components/publications/page_by_page/MoveableItem.vue";

export default {
  props: {},
  components: { MoveableItem },

  data() {
    return {
      items: [
        { src: "i_logo.svg" },
        { src: "images/i_add.svg" },
        { src: "images/i_add_publi.svg" },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;

  > * {
    position: absolute;
  }
}
</style>
