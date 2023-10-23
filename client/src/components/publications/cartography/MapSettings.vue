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
      <template v-if="map_mode === 'image'">
        <DLabel :str="$t('image_basemap')" />
        <SingleBaseMediaPicker
          :field_name="'map_basemap'"
          :content="publication.map_basemap"
          :path="publication.$path"
          :media_type_to_pick="'image'"
        />
      </template>
    </div>
  </div>
</template>
<script>
// import PositionPicker from "@/components/publications/cartography/PositionPicker.vue";
import SingleBaseMediaPicker from "@/components/makes/SingleBaseMediaPicker.vue"; // eslint-disable-line

export default {
  props: {
    publication: Object,
    path: String,
  },
  components: {
    // PositionPicker,
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

      map_baselayer_options: [
        {
          key: "OSM",
          text: this.$t("OSM"),
        },
        {
          key: "IGN_SAT",
          text: this.$t("IGN_SAT"),
        },
        {
          key: "IGN_MAP",
          text: this.$t("IGN_MAP"),
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
        map_baselayer: "Type de fond de carte",

        default_map_framing: "Cadrage de référence de la carte",
        default_map_framing_instr:
          "Cliquez sur la carte sur le point qui sera utilisé pour centrer la carte à l’ouverture. Le niveau de zoom sera aussi conservé.",
        map_mode_image: "Fond de plan image",
        map_mode_image_instr:
          "Pour cartographier un espace intérieur ou très réduit ou un espace non-cartographique.",
        image_basemap: "Image utilisée comme fond de carte",

        OSM: "OpenStreetMap",
        IGN_MAP: "Carte IGN (en France uniquement)",
        IGN_SAT: "Photos satellite IGN (en France uniquement)",
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
      return this.publication?.map_mode || "gps";
      // gps or image
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._mapSettings {
}
</style>
