<template>
  <div class="_mapView" :data-display="display">
    <component :is="display === 'adjacent' ? 'splitpanes' : 'div'">
      <component :is="display === 'adjacent' ? 'pane' : 'div'" min-size="5">
        <DisplayOnMap
          :key="opened_view_meta_filename"
          class="_mapContainer"
          :map_baselayer="opened_view ? opened_view.map_baselayer : undefined"
          :map_baselayer_bw="
            opened_view ? opened_view.map_baselayer_bw : undefined
          "
          :map_baselayer_opacity="
            opened_view ? opened_view.map_baselayer_opacity : undefined
          "
          :map_baselayer_color="
            opened_view ? opened_view.map_baselayer_color : undefined
          "
          :map_base_media="base_media"
          :pins="pins"
          :lines="lines"
          :geometries="geometries"
          :is_small="false"
          :opened_view_color="getViewColor(opened_view)"
          :opened_pin_path.sync="opened_pin_path"
          :can_edit="can_edit && !!opened_view_meta_filename"
          @newPositionClicked="newPositionClicked"
          @saveGeom="
            updateOpenedView({
              field: 'map_geom_features',
              value: $event,
            })
          "
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
                :types_available="[
                  'capture',
                  'import',
                  'write',
                  'embed',
                  'table',
                ]"
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
      </component>
      <component :is="display === 'adjacent' ? 'pane' : 'div'" min-size="5">
        <ViewPane
          :publication="publication"
          :opened_view_meta_filename="opened_view_meta_filename"
          :default_view_color="default_view_color"
          :opened_pin_path="opened_pin_path"
          :pins="pins"
          :can_edit="can_edit"
          @toggleView="toggleView"
          @togglePin="opened_pin_path = $event"
        />
      </component>
    </component>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";
import DisplayOnMap from "@/adc-core/fields/DisplayOnMap.vue";
import ViewPane from "@/components/publications/cartography/ViewPane.vue";
import ViewOptions from "@/components/publications/cartography/ViewOptions.vue";
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";

export default {
  props: {
    publication: Object,
    opened_view_meta_filename: String,
    display: {
      type: String,
      default: "adjacent",
    },
    can_edit: Boolean,
  },
  components: {
    Splitpanes,
    Pane,

    DisplayOnMap,
    ViewPane,
    ViewOptions,
    ModuleCreator,
  },
  provide() {
    return {
      $getMetaFilenamesAlreadyPresent: () =>
        this.meta_filenames_already_present,
    };
  },
  data() {
    return {
      latest_click: {
        latitude: undefined,
        longitude: undefined,
      },
      opened_pin_path: undefined,
      default_view_color: "#fc4b60",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    opened_view_meta_filename() {
      this.opened_pin_path = undefined;
    },
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
    opened_view() {
      if (!this.opened_view_meta_filename) return false;

      return this.views.find(
        (v) => this.getFilename(v.$path) === this.opened_view_meta_filename
      );
    },
    base_media() {
      // public folder export view
      if (this.opened_view?._map_base_media)
        return this.opened_view._map_base_media;

      const meta_filename_in_project =
        this.opened_view?.map_base_media_filename;
      if (meta_filename_in_project)
        return this.getSourceMedia({
          source_media: { meta_filename_in_project },
          folder_path: this.publication.$path,
        });
      return undefined;
    },
    views_to_display() {
      return this.views.filter(
        (v) =>
          !this.opened_view_meta_filename ||
          this.getFilename(v.$path) === this.opened_view_meta_filename
      );
    },
    pins() {
      return this.views_to_display.reduce((acc, _view) => {
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

          const pin_color = this.getViewColor(_view);
          const pin_zoom_level = _module.zoom_level || "undefined";

          let pin_preview = "icon";
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
          let pin_preview_src = `data:image/svg+xml;base64, ${b64}`;
          let first_media_thumb = undefined;

          if (_view.all_pins_icon === "media_preview") {
            const thumb = this.getFirstThumbURLForMedia({
              file: this.firstMedia(_module),
              resolution: 50,
            });
            if (thumb) {
              pin_preview = "media_preview";
              first_media_thumb = thumb;
            }
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
            pin_zoom_level,
            pin_preview,
            pin_preview_src,
            first_media_thumb,
            file: this.firstMedia(_module),
            module: _module,
          });
          index++;
        });
        return acc;
      }, []);
    },
    lines() {
      if (this.pins.length === 0) return {};
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
    geometries() {
      return this.views_to_display.reduce((acc, _view) => {
        if (!_view.map_geom_features || !Array.isArray(_view.map_geom_features))
          return acc;

        _view.map_geom_features.map((g) => {
          acc.push(g);
        });
        return acc;
      }, []);
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

    meta_filenames_already_present() {
      const { current, other } = this.getMediasAlreadyPresentInPublication({
        publication: this.publication,
        sections: this.views,
        opened_section_meta_filename: this.opened_view_meta_filename,
      });

      return [
        {
          label: this.$t("in_this_section"),
          medias: current,
          color: "var(--c-orange)",
        },
        {
          label: this.$t("in_another_section"),
          medias: other,
          color: "var(--c-bleuvert)",
        },
      ];
    },
  },
  methods: {
    newPositionClicked({ longitude, latitude }) {
      this.latest_click.longitude = longitude;
      this.latest_click.latitude = latitude;
    },
    toggleView(view_meta_filename) {
      this.$emit("toggleView", view_meta_filename);
    },
    getViewColor(_view) {
      return _view?.section_color || this.default_view_color;
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
        this.$eventHub.$emit("publication.map.openPin", pin_path);
        this.$eventHub.$emit(`module.enable_edit.${meta_filename}`);
      }, 150);
    },
    async updateOpenedView({ field, value }) {
      await this.$api.updateMeta({
        path: this.opened_view.$path,
        new_meta: {
          [field]: value,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._mapView {
  width: 100%;
  height: 100%;

  background: var(--c-gris);
  border-radius: 4px;
  overflow: hidden;

  ._mapContainer {
    width: 100%;
  }

  &[data-display="linear"] {
    ._mapContainer {
      height: 8cm;
    }

    ::v-deep {
      ._viewPane {
        padding-bottom: 0 !important;
      }
      ._sectionsSummary {
        display: none;
      }
      ._navBtns {
        display: none;
      }
    }
  }
}
</style>
