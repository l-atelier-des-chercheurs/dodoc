<template>
  <div class="_viewOptions">
    <div class="_viewOptions--content">
      <!-- <div class="u-spacingBottom">
        <strong>
          {{ view.section_title }}
        </strong>
      </div> -->

      <DetailsPane
        class="_detailsInfo"
        :header="view.section_title"
        :icon="'gear'"
      >
        <div class="u-spacingBottom">
          <ColorInput
            :label="$t('pins_color')"
            :can_toggle="false"
            :default_value="default_view_color"
            :default_colors="[
              '#b9b9b9',
              '#ffffff',
              '#B0BDED',
              '#52c5b9',
              '#ffbe32',
              '#fc4b60',
            ]"
            :value="view.section_color"
            @save="updateView({ field: 'section_color', value: $event })"
          />
        </div>
        <div class="u-spacingBottom">
          <ToggleInput
            :label="$t('link_pins')"
            :content="view.link_pins"
            @update:content="updateView({ field: 'link_pins', value: $event })"
          />
        </div>
        <div class="u-spacingBottom">
          <DLabel :str="$t('pin_icons')" />
          <RadioCheckboxField
            :field_name="'all_pins_icon'"
            :input_type="'radio'"
            :content="view.all_pins_icon || ''"
            :path="view.$path"
            :options="icon_options"
            :can_edit="true"
          />
        </div>

        <div class="u-spacingBottom">
          <DLabel :str="$t('map_baselayer')" />
          <SelectField2
            :value="view.map_baselayer || 'OSM'"
            :options="map_baselayer_options"
            :can_edit="true"
            :hide_validation="false"
            @update="updateView({ field: 'map_baselayer', value: $event })"
          />
        </div>

        <div class="u-spacingBottom" v-if="view.map_baselayer === 'image'">
          <DLabel :str="$t('image_basemap')" />
          <SingleBaseMediaPicker
            :field_name="'map_base_media_filename'"
            :content="view.map_base_media_filename"
            :path="view.$path"
            :media_type_to_pick="'image'"
          />
        </div>

        <div class="u-spacingBottom">
          <RangeValueInput
            :label="$t('opacity')"
            :value="view.map_baselayer_opacity"
            :min="0"
            :max="1"
            :step="0.01"
            :default_value="1"
            @save="
              updateView({
                field: 'map_baselayer_opacity',
                value: $event,
              })
            "
          />
        </div>

        <div class="u-spacingBottom">
          <ToggleInput
            :label="$t('bw_filter')"
            :content="view.map_baselayer_bw"
            @update:content="
              updateView({
                field: 'map_baselayer_bw',
                value: $event,
              })
            "
          />
        </div>
      </DetailsPane>
    </div>
  </div>
</template>
<script>
import SingleBaseMediaPicker from "@/components/makes/SingleBaseMediaPicker.vue";

export default {
  props: {
    view: Object,
    default_view_color: String,
  },
  components: {
    SingleBaseMediaPicker,
  },
  data() {
    return {
      icon_options: [
        // {
        //   key: "",
        //   label: this.$t("circle"),
        // },
        {
          key: "",
          label: this.$t("icon"),
        },
        {
          key: "media_preview",
          label: this.$t("media_preview"),
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
          instructions: this.$t("IGN_max_zoom_limits"),
        },
        {
          key: "IGN_MAP",
          text: this.$t("IGN_MAP"),
          instructions: this.$t("IGN_max_zoom_limits"),
        },
        {
          key: "---",
          text: "---",
          disabled: true,
        },
        {
          key: "image",
          text: this.$t("image_or_drawing"),
        },
      ],
    };
  },
  i18n: {
    messages: {
      fr: {
        pins_color: "Couleur des épingles",
        link_pins: "Relier les épingles",
        pin_icons: "Apparence des épingles",
        icon: "Icône",
        media_preview: "Image sur la carte",

        image_basemap: "Image utilisée comme fond de carte",

        map_baselayer: "Fond de carte",
        OSM: "OpenStreetMap",
        IGN_MAP: "Carte IGN (en France uniquement)",
        IGN_SAT: "Photos satellite IGN (en France uniquement)",
        image_or_drawing: "Image ou dessin",
        bw_filter: "Filtre noir et blanc",

        IGN_max_zoom_limits:
          "Les fonds de carte proposés par l’IGN ne permettent pas d’utiliser un niveau de zoom maximal.",
      },
      en: {
        pins_color: "Pin color",
        link_pins: "Link pins",
        pin_icons: "Pin icons",
        icon: "Icon",
        media_preview: "Image on map",

        image_basemap: "Image used as the basemap",

        map_baselayer: "Basemap",
        OSM: "OpenStreetMap",
        IGN_MAP: "IGN map (France only)",
        IGN_SAT: "IGN satellite pictures (France only)",
        image_or_drawing: "Image or drawing",
        bw_filter: "Black and white filter",

        IGN_max_zoom_limits:
          "Maps provided by the French IGN organization only work in France and with a limited max zoom level.",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    map_mode() {
      return this.view?.map_mode || "gps";
    },
  },
  methods: {
    async updateView({ field, value }) {
      await this.$api.updateMeta({
        path: this.view.$path,
        new_meta: {
          [field]: value,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._viewOptions {
  position: absolute;
  top: calc(var(--spacing) / 1);
  right: calc(var(--spacing) / 1);
  margin: 0 auto;
  width: 100%;

  pointer-events: none;
}
._viewOptions--content {
  position: relative;
  width: 220px;
  margin: 0 auto;
  pointer-events: auto;

  margin: calc(var(--spacing) / 2);
  margin-left: auto;

  &::before {
    position: absolute;
    inset: -1px;
    background: black;
    content: "";
    border-radius: 5px;
    opacity: 0.1;
    z-index: 0;
  }
}

._detailsInfo {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background: white;
}
</style>
