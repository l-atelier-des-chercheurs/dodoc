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
          <SelectField2
            :field_name="'all_pins_icon'"
            :value="view.all_pins_icon || ''"
            :path="view.$path"
            :options="icon_options"
            :hide_validation="true"
            :can_edit="true"
          />
        </div>

        <div class="u-spacingBottom">
          <DLabel :str="$t('map_baselayer')" />
          <SelectField2
            :field_name="'map_baselayer'"
            :path="view.$path"
            :value="view.map_baselayer || 'OSM'"
            :options="map_baselayer_options"
            :hide_validation="true"
            :can_edit="true"
          />
        </div>

        <div class="u-spacingBottom" v-if="view.map_baselayer === 'image'">
          <DLabel :str="$t('image_basemap')" />
          <SingleBaseMediaPicker
            :title="$t('choose_image_basemap')"
            :field_name="'map_base_media_filename'"
            :content="view.map_base_media_filename"
            :path="view.$path"
            :selected_media_path="publication_path"
            :media_type_to_pick="'image'"
          />
        </div>

        <div class="u-spacingBottom">
          <ColorInput
            :label="$t('background_color')"
            :value="view.map_baselayer_color"
            :default_value="'#F6F8F8'"
            @save="
              updateView({
                field: 'map_baselayer_color',
                value: $event,
              })
            "
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
          text: this.$t("icon"),
        },
        {
          key: "media_preview",
          text: this.$t("media_preview"),
        },
      ],

      map_baselayer_options: [
        {
          key: "OSM",
          text: this.$t("OSM"),
        },
        {
          key: "stadia_alidade_smooth",
          text: this.$t("alidade_smooth"),
          instructions: this.$t("provided_by_stadiamaps"),
        },
        {
          key: "stadia_alidade_smooth_dark",
          text: this.$t("alidade_smooth_dark"),
          instructions: this.$t("provided_by_stadiamaps"),
        },
        {
          key: "stadia_toner",
          text: this.$t("STAMEN_toner"),
          instructions: this.$t("provided_by_stadiamaps"),
        },
        {
          key: "stadia_watercolor",
          text: this.$t("STAMEN_watercolor"),
          instructions: this.$t("provided_by_stadiamaps"),
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
        {
          key: "---2",
          text: "---",
          disabled: true,
        },
        {
          key: "color",
          text: this.$t("color"),
        },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    map_mode() {
      return this.view?.map_mode || "gps";
    },
    publication_path() {
      return this.getParent(this.view.$path);
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
  top: calc(var(--spacing) / 2);
  left: calc(44px + var(--spacing) / 2);
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
