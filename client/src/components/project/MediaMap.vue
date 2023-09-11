<template>
  <div class="_mediaMap">
    <DisplayOnMap class="_mapContainer" :pins="pins" :is_small="false" />
  </div>
</template>
<script>
import DisplayOnMap from "@/adc-core/fields/DisplayOnMap.vue";

export default {
  props: {
    medias: Array,
  },
  components: {
    DisplayOnMap,
  },
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    pins() {
      // return [
      //   {
      //     longitude: 5.39,
      //     latitude: 43.31,
      //   },
      //   {
      //     longitude: 5.29,
      //     latitude: 43.21,
      //   },
      //   {
      //     longitude: 5.19,
      //     latitude: 43.11,
      //   },
      // ];
      return this.medias.reduce((acc, m) => {
        const gps = m.$infos?.gps;
        if (gps) acc.push(gps);
        return acc;
      }, []);
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._mediaMap {
  width: 100%;
  height: 100%;
}
</style>
