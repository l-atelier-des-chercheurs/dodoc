<template>
  <div class="_mapView">
    <LayersPane
      :publication="publication"
      :layers="layers"
      :opened_layer_path.sync="opened_layer_path"
      :opened_pin_path.sync="opened_pin_path"
      :can_edit="can_edit"
    />
    <DisplayOnMap
      class="_mapContainer"
      :start_coords="start_coords"
      :start_zoom="start_zoom"
      :map_baselayer="publication.map_baselayer"
      :pins="pins"
      :lines="lines"
      :is_small="false"
      :opened_pin_path.sync="opened_pin_path"
      :can_add_media_to_point="!!opened_layer_path"
      @newPositionClicked="newPositionClicked"
    >
      <div class="" slot="popup_message" v-if="can_edit">
        <div v-if="!opened_layer_path">
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
            @addModules="addModules"
          />
        </div>
      </div>
    </DisplayOnMap>
    <ViewPane
      :publication="publication"
      :views="views"
      :opened_view_path="opened_view_path"
      :can_edit="can_edit"
      @toggleView="$emit('toggleView', $event)"
    />
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
    opened_view_path: String,
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
      opened_layer_path: undefined,
      opened_pin_path: undefined,
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
  watch: {
    opened_pin_path() {
      // open corresponding layer when clicking on pin
      // if (this.opened_pin_path) {
      //   const layer = this.layers.find((l) =>
      //     l.modules_list?.includes(this.getFilename(this.opened_pin_path))
      //   );
      //   if (layer) return (this.opened_layer_path = layer.$path);
      // }
      // return (this.opened_layer_path = undefined);
    },
  },
  computed: {
    layers() {
      return this.getSectionsWithProps({
        publication: this.publication,
        group: "layers_list",
      });
    },
    views() {
      return this.getSectionsWithProps({
        publication: this.publication,
        group: "views_list",
      });
    },
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
    pins() {
      return this.layers.reduce((acc, l) => {
        if (!Array.isArray(l.modules_list)) return acc;
        l.modules_list.map((meta_filename, index) => {
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
              color: l.section_color || `#333`,
              path: _module.$path,
              belongs_to_layer: l.$path,
              link_pins: l.link_pins || false,
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
    async addModules({ meta_filenames }) {
      const opened_layer = this.layers.find(
        (l) => l.$path === this.opened_layer_path
      );
      await this.insertModuleMetaFilenamesToList2({
        publication: this.publication,
        section: opened_layer,
        meta_filenames,
      });

      const meta_filename = meta_filenames.at(-1);
      const pin_path = this.publication.$path + "/" + meta_filename;
      setTimeout(() => {
        this.opened_pin_path = pin_path;
        // this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
        // this.$eventHub.$emit(`module.panTo.${meta_filename}`);
      }, 150);

      // todo scroll to last meta_filename
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
