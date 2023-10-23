<template>
  <div class="_viewSettings">
    <div class="_viewSettings--content">
      <!-- <div class="u-spacingBottom">
        <strong>
          {{ view.section_title }}
        </strong>
      </div> -->

      <DetailsPane :header="view.section_title" :icon="'gear'">
        <div class="u-spacingBottom">
          <ColorInput
            :label="$t('pins_color')"
            :can_toggle="false"
            :default_value="default_view_color"
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
      </DetailsPane>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    view: Object,
    default_view_color: String,
  },
  components: {},
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
        },
        {
          key: "IGN_MAP",
          text: this.$t("IGN_MAP"),
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
        remove_layer: "Supprimer ce calque et son contenu",
        OSM: "OpenStreetMap",
        IGN_MAP: "Carte IGN (en France uniquement)",
        IGN_SAT: "Photos satellite IGN (en France uniquement)",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
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
._viewSettings {
  position: absolute;
  margin: 0 auto;
  width: 100%;
  bottom: 0;

  pointer-events: none;
}
._viewSettings--content {
  width: 320px;
  margin: 0 auto;
  background: white;
  pointer-events: auto;

  // padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  // border: 4px solid var(--c-bleuvert);
  // border-bottom: none;
  overflow: hidden;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
</style>
