<template>
  <div class="_mapSettings">
    <div class="">Pick starting point</div>
    <DisplayOnMap :pins="false" />
  </div>
</template>
<script>
import DisplayOnMap from "@/components/publications/cartography/DisplayOnMap.vue";

export default {
  props: {},
  components: {
    DisplayOnMap,
  },
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
._mapSettings {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background: white;
  padding: calc(var(--spacing) / 1);
}
</style>
