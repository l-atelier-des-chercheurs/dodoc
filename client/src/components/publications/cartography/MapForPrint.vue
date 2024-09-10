<template>
  <div class="_mapForPrint" :data-display="display_mode">
    <template v-if="display_mode === 'section'">
      <MapView
        class="_mapStoryContainer"
        :publication="publication"
        :opened_view_meta_filename="opened_view_meta_filename"
        :can_edit="false"
        @toggleView="toggleView"
      />
    </template>
    <template v-else>
      <div
        v-for="view_meta_filename in openable_views_meta_filenames"
        class="_mapStoryContainer"
        :key="view_meta_filename"
      >
        <MapView
          :publication="publication"
          :opened_view_meta_filename="view_meta_filename"
          :can_edit="false"
          :display="'linear'"
          @toggleView="toggleView"
        />
      </div>
    </template>
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
    return {
      display_mode: "all",
    };
  },
  created() {
    if (
      this.$route.query?.display === "section" ||
      window.app_infos.page_is_standalone_html
    )
      this.display_mode = "section";
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    opened_view_meta_filename() {
      return this.$route.query?.view || undefined;
    },
    views() {
      return this.getSectionsWithProps({
        publication: this.publication,
        group: "sections_list",
      });
    },
    openable_views_meta_filenames() {
      return this.views.map((view) => this.getFilename(view.$path));
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
  &[data-display="section"] {
    height: 100vh;
  }
}
._mapStoryContainer {
  page-break-inside: avoid;
}
</style>
