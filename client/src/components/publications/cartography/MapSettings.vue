<template>
  <div class="_mapSettings">
    <div class="u-spacingBottom">
      <DLabel :str="$t('map_mode')" />
      <RadioCheckboxField
        :field_name="'map_mode'"
        :input_type="'radio'"
        :content="map_mode"
        :path="publication.$path"
        :can_edit="true"
        :options="map_mode_options"
      />
    </div>

    <div class="u-spacingBottom">
      <template v-if="map_mode === 'gps'">
        <DLabel :str="$t('default_map_framing')" />
        <div class="u-instructions">
          {{ $t("default_map_framing_instr") }}
        </div>

        <PositionPicker
          :start_coords="publication.map_initial_location || false"
          :start_zoom="publication.map_initial_zoom || false"
          :edit_mode="true"
          @update="updateBasePosition"
        />
      </template>
      <template v-else-if="map_mode === 'image'">
        <DLabel :str="$t('image_basemap')" />
        <SingleBaseMediaPicker
          :field_name="'map_basemap'"
          :content="publication.map_basemap"
          :path="publication.$path"
          :media_type_to_pick="'image'"
        />
      </template>
    </div>
    {{ publication.map_basemap }}
  </div>
</template>
<script>
import PositionPicker from "@/components/publications/cartography/PositionPicker.vue";
import SingleBaseMediaPicker from "@/components/makes/SingleBaseMediaPicker.vue"; // eslint-disable-line

export default {
  props: {
    publication: Object,
    path: String,
  },
  components: {
    PositionPicker,
    SingleBaseMediaPicker,
  },
  data() {
    return {
      map_mode_options: [
        {
          key: "gps",
          label: this.$t("map_mode_gps"),
          instructions: this.$t("map_mode_gps_instr"),
        },
        {
          key: "image",
          label: this.$t("map_mode_image"),
          instructions: this.$t("map_mode_image_instr"),
        },
      ],
    };
  },
  i18n: {
    // `i18n` option, setup locale info for component
    messages: {
      fr: {
        map_mode: "Mode de cartographie",

        map_mode_gps: "Coordonnées GPS avec un fond de carte OpenStreetMap",
        map_mode_gps_instr: "Pour cartographier un espace extérieur.",
        default_map_framing: "Cadrage de référence de la carte",
        default_map_framing_instr:
          "Cliquez sur la carte sur le point qui sera utilisé pour centrer la carte à l’ouverture. Le niveau de zoom sera aussi conservé.",
        map_mode_image: "Fond de plan image",
        map_mode_image_instr:
          "Pour cartographier un espace intérieur ou très réduit ou un espace non-cartographique.",
        image_basemap: "Image utilisée comme fond de carte",
      },
      en: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    map_mode() {
      return this.publication.map_mode || "gps";
      // gps or image
    },
  },
  methods: {
    async updateBasePosition({ location, zoom }) {
      await this.updatePubli({
        map_initial_location: location,
        map_initial_zoom: zoom,
      });
    },

    async updatePubli(new_meta) {
      await this.$api.updateMeta({
        path: this.path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._mapSettings {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background: white;
  padding: calc(var(--spacing) / 1);
}
</style>
