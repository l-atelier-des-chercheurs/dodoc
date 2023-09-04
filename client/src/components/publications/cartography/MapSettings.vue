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

    <div v-if="map_mode === 'gps'">
      <PositionPicker
        :format="'gps'"
        :start_value="publication.map_initial_location || ''"
        :edit_mode="true"
        @update="updateBasePosition"
      />
    </div>
    <div v-else-if="map_mode === 'image'">SingleBaseMediaPicker</div>
  </div>
</template>
<script>
import PositionPicker from "@/components/publications/cartography/PositionPicker.vue";

export default {
  props: {
    publication: Object,
    path: String,
  },
  components: {
    PositionPicker,
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
        map_mode_image: "Fond de plan image",
        map_mode_image_instr:
          "Pour cartographier un espace intérieur ou très réduit ou un espace non-cartographique.",
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
    async updateBasePosition(val) {
      await this.updatePubli({
        map_initial_location: val,
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
