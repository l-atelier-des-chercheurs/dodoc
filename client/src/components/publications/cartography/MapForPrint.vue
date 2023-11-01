<template>
  <div class="_mapForPrint">
    <MapView
      :publication="publication"
      :opened_view_meta_filename="opened_view_meta_filename"
      :can_edit="false"
      @toggleView="toggleView"
    />
  </div>
</template>
<script>
import MapView from "@/components/publications/cartography/MapView.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    MapView,
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
    opened_view_meta_filename() {
      return this.$route.query?.view || undefined;
    },
  },
  methods: {
    toggleView(view_meta) {
      if (view_meta === this.opened_view_meta_filename) view_meta = false;
      this.updatePageQuery({ prop: "view", val: view_meta });
    },
  },
};
</script>
<style lang="scss" scoped>
._mapForPrint {
  height: 100vh;
}
</style>
