<template>
  <div class="container" ref="container">
    <MoveableItem :src="`${$root.publicPath}i_logo.svg`" />
    <!-- <MoveableItem :src="`${$root.publicPath}images/i_add.svg`" />
    <MoveableItem :src="`${$root.publicPath}images/i_add_publi.svg`" /> -->
  </div>
</template>
<script>
import MoveableItem from "@/components/publications/page_by_page/MoveableItem.vue";

export default {
  name: "app",
  components: { MoveableItem },
  methods: {},
};
</script>
<style lang="scss" scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
