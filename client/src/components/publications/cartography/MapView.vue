<template>
  <div class="_mapView">
    <DisplayOnMap class="_mapContainer" :pins="initial_view" />
    <div class="_textContainer" />
  </div>
</template>
<script>
import DisplayOnMap from "@/components/publications/cartography/DisplayOnMap.vue";

export default {
  props: {
    publication: Object,
  },
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
  computed: {
    initial_view() {
      const il = this.publication.map_initial_location;
      if (!il) return false;
      const longitude = il.split(" ")[0];
      const latitude = il.split(" ")[1];
      return [{ longitude, latitude }];
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._mapView {
  width: 100%;
  min-height: 80vh;
}
._mapContainer {
  min-height: 80vh;
}
._textContainer {
  min-height: 80vh;
}
</style>
