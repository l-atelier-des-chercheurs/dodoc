<template>
  <div class="_mapExport">
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
  computed: {
    opened_view_meta_filename() {
      return this.$route.query?.view || "";
    },
  },
  methods: {
    toggleView(view_meta_filename) {
      if (view_meta_filename === this.opened_view_meta_filename)
        view_meta_filename = false;
      this.updatePageQuery({ prop: "view", val: view_meta_filename });
    },
  },
};
</script>
<style lang="scss" scoped>
._mapExport {
  position: relative;
  width: 100%;
  height: 100vh;
}
</style>
