<template>
  <div class="_pageMenu"></div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
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
._pageMenu {
  flex: 0 0 200px;
  width: 200px;
  height: 100%;
  background: red;
  position: sticky;
  left: 0;
  top: 0;
  z-index: 10;
  padding: calc(var(--spacing) * 1);
  margin: calc(var(--spacing) * 1);
}
</style>
