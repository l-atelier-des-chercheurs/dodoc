<template>
  <div class="_mapView">
    <splitpanes>
      <!-- <pane min-size="5">
        <LayersPane
          :publication="publication"
          :layers="layers"
          :opened_layer_path.sync="opened_layer_path"
          :opened_pin_path.sync="opened_pin_path"
          :can_edit="can_edit"
        />
      </pane> -->
      <pane min-size="5">
        <DisplayOnMap
          class="_mapContainer"
          :start_coords="start_coords"
          :start_zoom="start_zoom"
          :map_baselayer="publication.map_baselayer"
          :pins="pins"
          :lines="lines"
          :is_small="false"
          :opened_pin_path.sync="opened_pin_path"
          :can_add_media_to_point="!!opened_view_meta_filename"
          @newPositionClicked="newPositionClicked"
        >
          <div class="" slot="popup_message" v-if="can_edit">
            <div v-if="!opened_view_meta_filename">
              {{ $t("to_add_media_here_open_matching_layer") }}
            </div>
            <div v-else>
              <ModuleCreator
                :publication_path="publication.$path"
                :start_collapsed="false"
                :context="'cartography'"
                :select_mode="'single'"
                :types_available="['medias', 'text']"
                :post_addtl_meta="new_module_meta"
                @addModules="addModules"
              />
            </div>
          </div>
        </DisplayOnMap>
      </pane>
      <pane min-size="5">
        <ViewPane
          :publication="publication"
          :opened_view_meta_filename="opened_view_meta_filename"
          :opened_pin_path.sync="opened_pin_path"
          :can_edit="can_edit"
          @toggleView="$emit('toggleView', $event)"
        />
      </pane>
    </splitpanes>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";
// import LayersPane from "@/components/publications/cartography/LayersPane.vue";
import DisplayOnMap from "@/adc-core/fields/DisplayOnMap.vue";
import ViewPane from "@/components/publications/cartography/ViewPane.vue";
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";

export default {
  props: {
    publication: Object,
    opened_view_meta_filename: String,
    can_edit: Boolean,
  },
  components: {
    Splitpanes,
    Pane,

    DisplayOnMap,
    // LayersPane,
    ViewPane,
    ModuleCreator,
  },
  data() {
    return {
      latest_click: {
        latitude: undefined,
        longitude: undefined,
      },
      opened_pin_path: undefined,
    };
  },
  i18n: {
    messages: {
      fr: {
        views_list: "Liste des vues",
        to_add_media_here_open_matching_layer:
          "Pour ajouter un média à cette position, créez ou ouvrez une vue dans le panneau correspondant.",
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
    // layers() {
    //   return this.getSectionsWithProps({
    //     publication: this.publication,
    //     group: "layers_list",
    //   });
    // },
    views() {
      return this.getSectionsWithProps({
        publication: this.publication,
        group: "sections_list",
      });
    },
    start_coords() {
      return this.publication.map_initial_location || false;
    },
    start_zoom() {
      return this.publication.map_initial_zoom || 10;
    },
    opened_view() {
      if (!this.opened_view_meta_filename) return false;
      return this.views.find(
        (v) => this.getFilename(v.$path) === this.opened_view_meta_filename
      );
    },
    pins() {
      return this.views.reduce((acc, _view) => {
        if (this.opened_view_meta_filename)
          if (this.getFilename(_view.$path) !== this.opened_view_meta_filename)
            return acc;

        const modules = this.getModulesForSection({
          publication: this.publication,
          section: _view,
        }).map(({ _module }) => _module);

        modules.map((_module, index) => {
          if (
            _module &&
            _module.location?.longitude &&
            _module.location?.latitude
          ) {
            let pin_label_items = [];
            if (_view.link_pins) pin_label_items.push(index + 1);
            if (_module.pin_name) pin_label_items.push(_module.pin_name);

            const pin_label =
              pin_label_items.length > 0 ? pin_label_items.join(" • ") : false;

            let pin_preview = "circle";
            if (_view.all_pins_icon === "media_preview") {
              const thumb = this.getFirstThumbURLForMedia({
                file: this.firstMedia(_module),
                resolution: 50,
              });
              if (thumb) pin_preview = thumb;
            }
            acc.push({
              longitude: _module.location.longitude,
              latitude: _module.location.latitude,
              label: pin_label,
              color: _view.section_color || `#333`,
              path: _module.$path,
              belongs_to_view: _view.$path,
              link_pins: _view.link_pins || false,
              pin_preview,
              file: this.firstMedia(_module),
              module: _module,
            });
          }
        });
        return acc;
      }, []);
    },
    lines() {
      // if (this.pins.length === 0) return false;
      // return this.pins.reduce((acc, pin) => {
      //   if (pin.link_pins) {
      //     const layer = pin.belongs_to_layer;
      //     if (!Object.prototype.hasOwnProperty.call(acc, layer))
      //       acc[layer] = {
      //         color: pin.color,
      //         coordinates: [],
      //       };
      //     acc[layer].coordinates.push([pin.longitude, pin.latitude]);
      //   }
      //   return acc;
      // }, {});
      return {};
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
    async addModules({ meta_filenames }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.publication,
        section: this.opened_view,
        meta_filenames,
      });

      const meta_filename = meta_filenames.at(-1);
      const pin_path = this.publication.$path + "/" + meta_filename;
      setTimeout(() => {
        this.opened_pin_path = pin_path;
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

  // border-top: 1px solid black;

  background: var(--c-gris);
  border-radius: 4px;
  overflow: hidden;

  // display: flex;
  // flex-flow: row wrap;
}
._mapContainer {
  height: 100%;
}
</style>
