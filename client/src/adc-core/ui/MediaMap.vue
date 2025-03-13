<template>
  <div class="_mediaMap">
    <DisplayOnMap
      class="_mapContainer"
      :pins="pins"
      :is_small="false"
      @update:opened_pin_path="pinClicked($event)"
    />
  </div>
</template>
<script>
export default {
  props: {
    medias: Array,
  },
  components: {
    DisplayOnMap: () => import("@/adc-core/fields/DisplayOnMap.vue"),
  },
  data() {
    return {};
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
        if (m.$location) {
          const { latitude, longitude } = m.$location;
          if (latitude && longitude)
            acc.push({
              latitude,
              longitude,
              path: m.$path,
            });
        }
        return acc;
      }, []);
    },
  },
  methods: {
    pinClicked(path) {
      this.$emit("toggleMediaFocus", path);
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaMap {
  width: 100%;
  height: 90%;
}
</style>
