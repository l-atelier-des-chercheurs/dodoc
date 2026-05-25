<template>
  <div class="_mapForPrint" :data-display="display_mode">
    <template v-if="display_mode === 'section'">
      <MapView
        class="_mapStoryContainer"
        :publication="publication"
        :opened_view_meta_filename="opened_view_meta_filename"
        :can_edit="false"
        :display="'linear'"
        :print_layout="true"
        @toggleView="toggleView"
        @mapReady="onMapReady"
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
          :print_layout="true"
          @toggleView="toggleView"
          @mapReady="onMapReady"
        />
      </div>
    </template>
  </div>
</template>
<script>
import MapView from "@/components/publications/cartography/MapView.vue";
import PublicationReady from "@/mixins/PublicationReady.js";

export default {
  props: {
    publication: Object,
  },
  mixins: [PublicationReady],
  components: {
    MapView,
  },
  data() {
    return {
      display_mode: "all",
      pending_maps_count: 0,
      ready_maps_count: 0,
      export_ready_initialized: false,
      ready_fallback_timeout: null,
      ready_settle_timeout: null,
    };
  },
  created() {
    if (
      this.$route.query?.display === "section" ||
      window.app_infos.page_is_standalone_html
    )
      this.display_mode = "section";

    this.pending_maps_count = this.expected_maps_count;
    this.setPublicationReadyState(false);
  },
  mounted() {
    this.export_ready_initialized = true;

    if (this.pending_maps_count === 0) {
      this.setPublicationReadyState(true);
      return;
    }

    this.checkAllMapsReady();

    this.ready_fallback_timeout = setTimeout(() => {
      this.setPublicationReadyState(true);
    }, 8_000);
  },
  beforeDestroy() {
    if (this.ready_fallback_timeout) clearTimeout(this.ready_fallback_timeout);
    if (this.ready_settle_timeout) clearTimeout(this.ready_settle_timeout);
  },
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
    expected_maps_count() {
      if (this.display_mode === "section") return 1;
      return this.openable_views_meta_filenames.length;
    },
  },
  methods: {
    toggleView(view_meta) {
      if (view_meta === this.opened_view_meta_filename) view_meta = false;
      this.updatePageQuery({ prop: "view", val: view_meta });
    },
    onMapReady() {
      this.ready_maps_count++;
      if (!this.export_ready_initialized) return;
      this.checkAllMapsReady();
    },
    checkAllMapsReady() {
      if (this.pending_maps_count === 0) {
        this.setPublicationReadyState(true);
        return;
      }
      if (this.ready_maps_count < this.pending_maps_count) return;

      if (this.ready_settle_timeout) clearTimeout(this.ready_settle_timeout);
      this.ready_settle_timeout = setTimeout(() => {
        if (this.ready_fallback_timeout) {
          clearTimeout(this.ready_fallback_timeout);
          this.ready_fallback_timeout = null;
        }
        this.setPublicationReadyState(true);
      }, 500);
    },
  },
};
</script>
<style lang="scss" scoped>
._mapForPrint {
  &[data-display="section"] {
    height: auto;
  }
}
._mapStoryContainer {
  page-break-after: always;

  &:last-child {
    page-break-after: auto;
  }
}
</style>
