<template>
  <div>
    <!-- <h5p :src="src" :l10n="translations" @xapi="handleXAPIEvent">
      Loading...
      <template #error> Resource not available. :( </template>
    </h5p> -->
  </div>
</template>
<script>
import { H5P } from "h5p-standalone"; // ES6
// import h5p from "vue-h5p";

export default {
  props: {
    src: String,
  },
  components: {
    // h5p,
  },
  data() {
    return {};
  },
  created() {},
  async mounted() {
    await new H5P(this.$el, {
      src: this.src,
    });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    handleXAPIEvent(ev) {
      console.log("H5P emitted X-API event");
    },
  },
};
</script>
<style lang="scss" scoped></style>
