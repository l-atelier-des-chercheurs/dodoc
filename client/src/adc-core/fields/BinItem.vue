<template>
  <div class="_item">
    <slot>
      <!-- Default slot content goes here -->
    </slot>
  </div>
</template>

<script>
export default {
  name: "BinItem",
};
</script>

<style lang="scss" scoped>
._item {
  display: flex;
  flex-flow: column nowrap;
  justify-content: stretch;
  align-items: stretch;
}
</style>
