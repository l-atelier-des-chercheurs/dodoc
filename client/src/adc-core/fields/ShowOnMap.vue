<template>
  <DetailsPane :header="title" :icon="'map'">
    <DisplayOnMap :pins="pins" :is_small="true" />
  </DetailsPane>
  <!-- <div class="_metaField">
    <DLabel :str="title" />
    <div>



    </div>
  </div> -->
</template>
<script>
import DisplayOnMap from "@/adc-core/fields/DisplayOnMap.vue";

export default {
  props: {
    title: String,
    gps: Object,
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
      return [this.gps];
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
