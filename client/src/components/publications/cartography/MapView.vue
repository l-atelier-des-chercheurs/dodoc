<template>
  <div class="_mapView">
    <LayersPane
      :publication_path="publication.$path"
      :sections="sections"
      :opened_section="opened_section"
      :opened_section_modules_list="opened_section_modules_list"
      :can_edit="can_edit"
      @createSection="$emit('createSection', $event)"
      @openSection="$emit('openSection', $event)"
      @closeSection="$emit('closeSection')"
      @updateOrder="$emit('updateOrder', $event)"
      @addModules="$emit('addModules', $event)"
      @insertModules="$emit('insertModules', $event)"
      @moveModuleTo="$emit('moveModuleTo', $event)"
      @removeModule="$emit('removeModule', $event)"
      @duplicatePublicationMedia="$emit('duplicatePublicationMedia', $event)"
    />
    <DisplayOnMap
      class="_mapContainer"
      :start_coords="start_coords"
      :start_zoom="start_zoom"
      :map_baselayer="publication.map_baselayer"
      :pins="pins"
      :lines="lines"
      :link_pins="opened_section_link_pins"
      :is_small="false"
      :can_add_media_to_point="opened_section !== false"
      @newPositionClicked="newPositionClicked"
    >
      <div class="" slot="popup_message">
        <div v-if="!opened_section">
          {{ $t("to_add_media_here_open_matching_layer") }}
        </div>
        <div v-else>
          <div class="">
            {{ $t("add_media") }}
          </div>
          <ModuleCreator
            :publication_path="publication.$path"
            :is_collapsed="false"
            :context="'cartography'"
            :select_mode="'single'"
            :types_available="['medias']"
            :post_addtl_meta="new_module_meta"
            @addModules="$emit('addModules', $event)"
          />
        </div>
      </div>
    </DisplayOnMap>

    <ViewPane />
  </div>
</template>
<script>
import LayersPane from "@/components/publications/cartography/LayersPane.vue";
import DisplayOnMap from "@/adc-core/fields/DisplayOnMap.vue";
import ViewPane from "@/components/publications/cartography/ViewPane.vue";
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";

export default {
  props: {
    publication: Object,
    sections: Array,
    opened_section: [Boolean, Object],
    opened_section_modules_list: Array,
    can_edit: Boolean,
  },
  components: {
    DisplayOnMap,
    LayersPane,
    ViewPane,
    ModuleCreator,
  },
  data() {
    return {
      latest_click: {
        latitude: undefined,
        longitude: undefined,
      },
    };
  },
  i18n: {
    messages: {
      fr: {
        views_list: "Liste des vues",
        to_add_media_here_open_matching_layer:
          "Pour ajouter un média à cette position, créez ou ouvrez un calque dans le panneau correspondant.",
      },
    },
  },

  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    start_coords() {
      return this.publication.map_initial_location || false;
    },
    start_zoom() {
      return this.publication.map_initial_zoom || 10;
    },

    opened_view() {
      if (this.opened_view_id === false) return false;
      return this.views_list[this.opened_view_id];
    },
    opened_section_link_pins() {
      return this.opened_section?.link_pins === true;
    },
    pins() {
      return this.sections.reduce((acc, s) => {
        if (!Array.isArray(s.modules_list)) return acc;
        s.modules_list.map((meta_filename, index) => {
          const _module = this.findModuleFromMetaFilename({
            files: this.publication.$files,
            meta_filename,
          });
          if (
            _module &&
            _module.location?.longitude &&
            _module.location?.latitude
          ) {
            acc.push({
              longitude: _module.location.longitude,
              latitude: _module.location.latitude,
              index: index,
              label: this.$t("media") + " " + (index + 1),
              color: s.section_color || `#333`,
              path: _module.$path,
              belongs_to_layer: s.$path,
              link_pins: s.link_pins || false,
              file: this.firstMedia(_module),
            });
          }
        });
        return acc;
      }, []);
    },
    lines() {
      if (this.pins.length === 0) return false;
      return this.pins.reduce((acc, pin) => {
        if (pin.link_pins) {
          const layer = pin.belongs_to_layer;
          if (!Object.prototype.hasOwnProperty.call(acc, layer))
            acc[layer] = {
              color: pin.color,
              coordinates: [],
            };
          acc[layer].coordinates.push([pin.longitude, pin.latitude]);
        }
        return acc;
      }, {});
    },
    new_module_meta() {
      return {
        // todo return location
        location: {
          longitude: this.latest_click.longitude,
          latitude: this.latest_click.latitude,
        },
      };
    },
  },
  methods: {
    newPositionClicked({ longitude, latitude }) {
      this.latest_click.longitude = longitude;
      this.latest_click.latitude = latitude;
    },
    openView(index) {
      this.opened_view_id = index;
      this.$eventHub.$emit("publication.map.navigateTo", {
        center: this.opened_view.map_center,
        zoom: this.opened_view.map_zoom,
      });
    },
    closeView() {
      this.opened_view_id = false;
      this.$eventHub.$emit("publication.map.navigateTo", {
        zoom: this.start_zoom,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._mapView {
  width: 100%;
  height: calc(100vh - 95px);

  background: var(--c-gris);
  border-radius: 4px;
  overflow: hidden;

  display: flex;
  flex-flow: row wrap;
}
._mapContainer {
  height: 100%;
}
</style>
