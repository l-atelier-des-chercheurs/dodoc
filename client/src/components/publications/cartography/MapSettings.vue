<template>
  <div class="_mapSettings"></div>
</template>
<script>
// import PositionPicker from "@/components/publications/cartography/PositionPicker.vue";

export default {
  props: {
    publication: Object,
    path: String,
  },
  components: {
    // PositionPicker,
  },
  data() {
    return {};
  },
  i18n: {
    // `i18n` option, setup locale info for component
    messages: {
      fr: {},
      en: {},
    },
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
}
</style>
