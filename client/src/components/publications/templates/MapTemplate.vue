<template>
  <div class="_mapTemplate">
    <MapView
      :publication="publication"
      :opened_view_meta_filename="opened_view_meta_filename"
      :can_edit="can_edit"
      @toggleView="$emit('toggleView', $event)"
    />
    <PublicationSettings v-if="can_edit">
      {{ $t("nothing_to_show") }}
      <!-- <MapSettings :publication="publication" :path="publication.$path" /> -->
    </PublicationSettings>
  </div>
</template>
<script>
import MapView from "@/components/publications/cartography/MapView.vue";
import PublicationSettings from "@/components/publications/PublicationSettings.vue";
// import MapSettings from "@/components/publications/cartography/MapSettings.vue";

export default {
  props: {
    publication: Object,
    opened_view_meta_filename: String,
    can_edit: Boolean,
  },
  components: {
    MapView,
    PublicationSettings,
    // MapSettings,
  },
  data() {
    return {};
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
._mapTemplate {
  position: relative;
  width: 100%;
  height: calc(100vh - 96px);
}
</style>
