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
          :map_baselayer="opened_view ? opened_view.map_baselayer : undefined"
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
                :select_mode="'single'"
                :types_available="['medias', 'text']"
                :post_addtl_meta="new_module_meta"
                @addModules="addModules"
              />
            </div>
          </div>
        </DisplayOnMap>
        <transition name="pagechange" mode="out-in">
          <ViewOptions
            v-if="opened_view && can_edit"
            :key="opened_view.$path"
            :view="opened_view"
            :default_view_color="default_view_color"
          />
        </transition>
      </pane>
      <pane min-size="5">
        <ViewPane
          :publication="publication"
          :opened_view_meta_filename="opened_view_meta_filename"
          :default_view_color="default_view_color"
          :opened_pin_path="opened_pin_path"
          :pins="pins"
          :can_edit="can_edit"
          @toggleView="$emit('toggleView', $event)"
          @togglePin="opened_pin_path = $event"
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
import ViewOptions from "@/components/publications/cartography/ViewOptions.vue";
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
    ViewOptions,
    ModuleCreator,
  },
  data() {
    return {
      latest_click: {
        latitude: undefined,
        longitude: undefined,
      },
      opened_pin_path: undefined,
      default_view_color: "#FFBE33",
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
      // open corresponding view when clicking on pin
      if (this.opened_pin_path) {
        const view = this.views.find((l) =>
          l.modules_list?.includes(this.getFilename(this.opened_pin_path))
        );
        if (view) {
          const view_meta_filename = this.getFilename(view.$path);
          if (this.opened_view_meta_filename !== view_meta_filename)
            this.$emit("toggleView", view_meta_filename);
        }
      } else {
        // dont quit view when unselecting pin
        // if (this.opened_view_meta_filename) this.$emit("toggleView", undefined);
      }

      this.$nextTick(() => {
        // scrollto pin in view
        if (this.opened_pin_path) {
          const module_meta_filename = this.getFilename(this.opened_pin_path);
          module_meta_filename;
          // this.$eventHub.$emit(`module.show.${module_meta_filename}`);
        }
      });
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

        let index = 0;
        modules.map((_module) => {
          if (!_module.location?.longitude || !_module.location?.latitude)
            return;

          let pin_label_items = [];
          if (_view.link_pins) pin_label_items.push(index + 1);
          if (_module.pin_name) pin_label_items.push(_module.pin_name);

          const pin_label =
            pin_label_items.length > 0 ? pin_label_items.join(" • ") : false;

          const pin_color = _view.section_color || this.default_view_color;

          let pin_preview = "icon";
          let pin_preview_src;
          if (_view.all_pins_icon === "media_preview") {
            const thumb = this.getFirstThumbURLForMedia({
              file: this.firstMedia(_module),
              resolution: 50,
            });
            if (thumb) {
              pin_preview = "media_preview";
              pin_preview_src = thumb;
            }
          } else {
            const svg = `
              <svg enable-background="new 0 0 100 100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
                <path
                  d="m78.527 5h-57.054c-4.104 0-7.431 3.324-7.431 7.428v57.059c0 4.106 3.326 7.433 7.431 7.433h11.965l16.501 18.08 16.5-18.085h12.088c4.104 0 7.431-3.322 7.431-7.429v-57.058c-.001-4.104-3.327-7.428-7.431-7.428z"
                  fill="${pin_color}" 
                  stroke="#000" 
                  stroke-width="4px"
                />
                <text x="50" y="55" fill="#000000" text-anchor="middle" font-size="48px" font-weight="500" font-family="Fira Mono">
                  ${index + 1}  
                </text>
              </svg>`;
            const b64 = btoa(unescape(encodeURIComponent(svg)));
            pin_preview_src = `data:image/svg+xml;base64, ${b64}`;
          }
          acc.push({
            longitude: _module.location.longitude,
            latitude: _module.location.latitude,
            label: pin_label,
            index: index + 1,
            path: _module.$path,
            belongs_to_view: _view.$path,
            link_pins: _view.link_pins || false,
            color: pin_color,
            pin_preview,
            pin_preview_src,
            file: this.firstMedia(_module),
            module: _module,
          });
          index++;
        });
        return acc;
      }, []);
    },
    lines() {
      if (this.pins.length === 0) return false;
      return this.pins.reduce((acc, pin) => {
        if (pin.link_pins) {
          const view = pin.belongs_to_view;
          if (!Object.prototype.hasOwnProperty.call(acc, view))
            acc[view] = {
              color: pin.color,
              coordinates: [],
            };
          acc[view].coordinates.push([pin.longitude, pin.latitude]);
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
    async addModules({ meta_filenames }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.publication,
        section: this.opened_view,
        meta_filenames,
      });

      const meta_filename = meta_filenames.at(-1);
      const pin_path = this.publication.$path + "/" + meta_filename;
      setTimeout(() => {
        // this.opened_pin_path = pin_path;
        // this.$eventHub.$emit(`module.show.${meta_filename}`);
        this.$eventHub.$emit("publication.map.openPin", pin_path);
        this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
      }, 150);
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
