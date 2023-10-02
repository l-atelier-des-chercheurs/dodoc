<template>
  <div class="_mediaMap">
    <DisplayOnMap
      class="_mapContainer"
      :pins="pins"
      :is_small="false"
      @pinClicked="pinClicked"
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
      return this.medias.reduce((acc, m, index) => {
        if (m.$infos?.gps) {
          const { latitude, longitude } = m.$infos?.gps;
          if (latitude && longitude)
            acc.push({
              latitude,
              longitude,
              index,
            });
        }
        return acc;
      }, []);
    },
  },
  methods: {
    pinClicked(index) {
      this.$emit("toggleMediaFocus", this.medias[index].$path);
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
