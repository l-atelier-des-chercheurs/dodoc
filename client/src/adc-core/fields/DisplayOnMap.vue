<template>
  <div
    class="m_displayOnMap"
    :class="{
      'is--small': is_small,
      'is--image': map_baselayer === 'image',
    }"
    :style="map_styles"
  >
    <div class="_map" ref="map" />

    <div
      ref="popUp"
      class="_popup"
      :class="{
        'is--pin': clicked_location.module,
        'is--shown': has_module_content_to_show,
      }"
    >
      <div class="_popupShadow" />
      <button
        type="button"
        class="u-button u-button_transparent u-button_icon _popupClose"
        ref="closePopup"
        @click="closePopup"
      >
        <b-icon icon="x-circle-fill" />
      </button>

      <div
        class="_popup--content"
        :key="clicked_location.latitude + '-' + clicked_location.longitude"
      >
        <div
          v-if="clicked_location.module"
          :key="clicked_location.module.$path"
          class="_pinContent"
        >
          <PublicationModule
            :publimodule="clicked_location.module"
            :can_edit="false"
          />
        </div>

        <div
          v-if="popup_message"
          class="_popupMessage"
          v-html="popup_message"
        />
        <div
          class="_popupMessage"
          v-if="
            !clicked_location.module && $slots.hasOwnProperty('popup_message')
          "
        >
          <slot name="popup_message" />
        </div>
      </div>
    </div>
    <div id="mouse-position" />

    <div class="_leftTopMenu">
      <div class="_buttonRow" v-if="!$root.app_infos.is_electron">
        <!-- hidden if electron, need to find alternative strategy -->
        <button type="button" class="u-button" @click="getCurrentPosition">
          <span class="u-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle fill="transparent" cx="12" cy="12" r="8" />
              <circle fill="currentColor" cx="12" cy="12" r="4" />
              <line x1="0" y1="12" x2="24" y2="12" />
              <line x1="12" y1="0" x2="12" y2="24" />
            </svg>
          </span>
        </button>
      </div>

      <div class="_buttonRow">
        <button type="button" class="u-button" @click="zoomIn">
          <b-icon class="inlineSVG" icon="plus" />
        </button>
        <button type="button" class="u-button" @click="zoomOut">
          <b-icon class="inlineSVG" icon="dash" />
        </button>
      </div>

      <div
        class="_buttonRow"
        v-if="!['image', 'color'].includes(map_baselayer)"
      >
        <button type="button" class="u-button" @click="toggleSearch">
          <b-icon class="inlineSVG" icon="search" />
        </button>
      </div>

      <div class="_buttonRow" v-if="can_edit">
        <button
          v-for="draw_mode in draw_modes"
          type="button"
          class="u-button"
          :class="{
            'is--active': draw_mode.key === current_draw_mode,
          }"
          :key="draw_mode.key"
          @click="
            toggleTool({
              draw_mode,
            })
          "
        >
          <b-icon
            v-if="draw_mode.icon"
            class="inlineSVG"
            :icon="draw_mode.icon"
          />
          <span class="u-icon" v-else v-html="draw_mode.svg" />
          <template v-if="draw_mode.key === current_draw_mode">
            {{ draw_mode.label }}
          </template>
        </button>
      </div>
      <div class="_buttonRow" v-if="can_edit">
        <button
          type="button"
          class="u-button"
          :class="{
            'is--active': 'Select' === current_draw_mode,
          }"
          @click="
            toggleTool({
              draw_mode: { key: 'Select' },
            })
          "
        >
          <b-icon class="inlineSVG" icon="hand-index" />
          <template v-if="'Select' === current_draw_mode">
            {{ $t("select") }}
          </template>
        </button>
      </div>
      <div class="_buttonRow">
        <button
          type="button"
          class="u-button"
          :class="{
            'is--active': start_map_print,
          }"
          @click="start_map_print = true"
        >
          <b-icon class="inlineSVG" icon="printer" />
          <!-- <template v-if="start_map_print">
            {{ $t("print") }}
          </template> -->
        </button>
        <PrintMap
          v-if="start_map_print"
          :map="map"
          @close="start_map_print = false"
        />
      </div>
    </div>

    <transition name="slideup">
      <div
        class="_bottomMenu"
        v-if="draw_can_be_finished || 'Select' === current_draw_mode"
      >
        <div class="_bottomMenu--content">
          <template v-if="draw_can_be_finished">
            <button
              type="button"
              class="u-button u-button_bleumarine"
              @click="finishDrawing"
            >
              {{ $t("finish_drawing") }}
            </button>
            <small class="_instr u-instructions">
              {{ $t("or_double_click") }}
            </small>
          </template>
          <template v-else-if="'Select' === current_draw_mode">
            <small class="_instr u-instructions" v-if="!selected_feature">
              {{ $t("select_by_clicking") }}
            </small>
            <template v-else>
              <!-- <div class="">
                <small class="_instr u-instructions">
                  {{ $t("move_drawing") }}
                </small>
              </div> -->

              <ColorInput
                :can_toggle="false"
                :live_editing="true"
                :label="$t('outline_color')"
                :allow_transparent="true"
                :value="selected_feature.get('stroke_color')"
                :default_value="opened_view_color"
                @save="
                  updateDrawing({
                    prop: 'stroke_color',
                    val: $event,
                  })
                "
              />

              <ColorInput
                v-if="['Polygon', 'Circle'].includes(selected_feature_type)"
                :can_toggle="false"
                :live_editing="true"
                :allow_transparent="true"
                :label="$t('background_color')"
                :value="selected_feature.get('fill_color')"
                @save="
                  updateDrawing({
                    prop: 'fill_color',
                    val: $event,
                  })
                "
              />

              <RangeValueInput
                class="u-spacingBottom _strokeWidth"
                :can_toggle="false"
                :label="$t('outline_width')"
                :value="selected_feature.get('stroke_width')"
                :min="1"
                :max="40"
                :step="1"
                :ticks="[0, 3, 10, 20, 30, 40]"
                :default_value="3"
                @save="
                  updateDrawing({
                    prop: 'stroke_width',
                    val: $event,
                  })
                "
              />
              <button
                type="button"
                class="u-button u-button_bleumarine"
                @click="removeSelected"
              >
                {{ $t("remove") }}
              </button>
            </template>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import olSourceOSM from "ol/source/OSM";
import olSourceStadiaMaps from "ol/source/StadiaMaps";
import olSourceWMTS from "ol/source/WMTS";
import olMap from "ol/Map";
import olView from "ol/View";
import { asArray, asString } from "ol/color";
import olFeature from "ol/Feature";
import olTileLayer from "ol/layer/Tile";
import olImageLayer from "ol/layer/Image";
import olProjection from "ol/proj/Projection";
import olStatic from "ol/source/ImageStatic";
import olTileGridWMTS from "ol/tilegrid/WMTS";
import olVectorLayer from "ol/layer/Vector";
import olSourceVector from "ol/source/Vector";
import * as olProj from "ol/proj";
import olOverlay from "ol/Overlay";
import { getCenter, extend } from "ol/extent";

// import { getArea, getLength } from "ol/sphere";

import {
  Point as olPoint,
  LineString as olLineString,
  Circle as olCircle,
  Polygon as olPolygon,
} from "ol/geom";
// import GeoJSON from "ol/format/GeoJSON";

import Geocoder from "ol-geocoder";
import "ol-geocoder/dist/ol-geocoder.min.css";

import {
  Circle as olCircleStyle,
  Fill as olFill,
  // RegularShape as olRegularShape,
  Stroke as olStroke,
  Icon as olIcon,
  Style as olStyle,
  Text as olText,
} from "ol/style";

import {
  ScaleLine as olScaleLine,
  FullScreen as olFullScreen,
} from "ol/control";

import {
  Draw as olDraw,
  Modify as olModify,
  Select as olSelect,
  Translate as olTranslate,
  Snap as olSnap,
} from "ol/interaction";

import { defaults as olDefaultControls } from "ol/control";

import olFilterCSS from "ol-ext/filter/CSS";

import PublicationModule from "@/components/publications/modules/PublicationModule.vue";

export default {
  name: "DisplayOnMap",
  props: {
    pins: Array,
    lines: Object,
    geometries: Array,
    start_zoom: Number,
    map_baselayer: {
      type: String,
      default: "OSM",
    },
    map_baselayer_bw: {
      type: Boolean,
      default: false,
    },
    map_baselayer_opacity: {
      type: Number,
      default: 1,
    },
    zoom_animation: {
      type: Number,
      default: 0,
    },
    map_baselayer_color: String,
    map_base_media: Object,
    is_small: {
      type: Boolean,
      default: true,
    },
    show_scale: {
      type: Boolean,
      default: true,
    },
    opened_view_color: String,
    opened_pin_path: String,
    can_click: {
      type: Boolean,
      default: true,
    },
    can_edit: Boolean,
  },
  components: {
    PublicationModule,
    PrintMap: () => import("@/adc-core/fields/PrintMap.vue"),
  },
  data() {
    return {
      map: undefined,

      overlay: undefined,

      popup_message: undefined,
      clicked_location: {
        latitude: undefined,
        longitude: undefined,
        module: undefined,
      },

      is_looking_for_gps_coords: false,

      pin_features: undefined,
      line_features: undefined,
      mouse_feature: undefined,

      current_zoom: undefined,
      current_view: undefined,

      mouse_coords: false,

      map_modify: undefined,
      map_draw: undefined,
      map_snap: undefined,

      pins_vector_source: undefined,
      lines_vector_source: undefined,
      draw_vector_source: undefined,
      current_draw_mode: undefined,
      draw_can_be_finished: undefined,
      show_segments_length: false,
      draw_modes: [
        // {
        //   key: "LineString",
        //   label: this.$t("line"),
        //   icon: "circle",
        //   freehand: false,
        //   tip: ,
        //   activeTip: ,
        // },
        {
          key: "FreehandLineString",
          label: this.$t("freehand"),
          icon: "pen",
          olType: "LineString",
          freehand: true,
          idleTip: this.$t("click_drag_to_draw_line"),
          activeTip: "",
        },
        {
          key: "LineString",
          label: this.$t("lines"),
          svg: `
          <svg
            viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"
            style="stroke-width: 1px; stroke: currentColor; width: 1.5em; height: 1.5em;"
          >
            <line
              x1="0"
              y1="100"
              x2="100"
              y2="0"
              vector-effect="non-scaling-stroke"
            />
          </svg>

          `,
          olType: "LineString",
          freehand: false,
          idleTip: this.$t("click_to_place_first_point"),
          activeTip: this.$t("click_to_continue_drawing"),
        },
        {
          key: "Polygon",
          label: this.$t("polygon"),
          icon: "pentagon",
          olType: "Polygon",
          freehand: false,
          idleTip: this.$t("click_to_start_drawing"),
          activeTip: this.$t("click_to_continue_drawing"),
        },
        {
          key: "Circle",
          label: this.$t("circle"),
          icon: "circle",
          olType: "Circle",
          freehand: false,
          idleTip: this.$t("click_to_place_center"),
          activeTip: this.$t("click_to_define_circle_radius"),
        },
      ],
      map_select_mode: undefined,
      selected_feature_id: undefined,
      map_translate: undefined,

      start_map_print: false,
    };
  },
  created() {
    this.$eventHub.$on("publication.map.navigateTo", this.navigateTo);
    this.$eventHub.$on("publication.map.openPin", this.openPin);
    this.$eventHub.$on("publication.map.disableTools", this.disableTools);
    this.$eventHub.$on("publication.map.print", this.printMap);
    document.addEventListener("keyup", this.keyPressed);
  },
  mounted() {
    // setTimeout(() => {
    this.startMap();
    // }, 500);
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.map.navigateTo", this.navigateTo);
    this.$eventHub.$off("publication.map.openPin", this.openPin);
    this.$eventHub.$off("publication.map.disableTools", this.disableTools);
    this.$eventHub.$off("publication.map.print", this.printMap);
    document.removeEventListener("keyup", this.keyPressed);
  },
  watch: {
    pins: {
      handler() {
        this.loadPins();
      },
      deep: true,
    },
    lines: {
      handler() {
        this.loadLines();
      },
      deep: true,
    },
    geometries() {
      if (
        JSON.stringify(this.geometries) !==
        JSON.stringify(this.convertFeaturesToStr())
      )
        this.loadGeom();
    },
    map_baselayer(val, oldVal) {
      if (val !== oldVal && (val === "image" || oldVal === "image"))
        this.startMap();
      else this.startMap({ keep_loc_and_zoom: true });
    },
    map_baselayer_bw() {
      this.setBackgroundLayerOptions();
    },
    map_baselayer_opacity() {
      this.setBackgroundLayerOptions();
    },
    map_base_media() {
      this.startMap();
    },
    opened_pin_path() {
      if (this.opened_pin_path) this.openFeature(this.opened_pin_path);
      else this.closePopup();
    },
    current_zoom() {
      this.$emit("zoomUpdated", this.current_zoom);
    },
  },
  computed: {
    map_styles() {
      let styles = {};
      if (this.opened_view_color)
        styles["--current-view-color"] = this.opened_view_color;
      if (this.map_baselayer_color)
        styles["--map-background-color"] = this.map_baselayer_color;
      // if (this.map_baselayer === "color" && this.map_baselayer_color)
      //   styles["--map-background-color"] = this.map_baselayer_color;
      return styles;
    },
    default_pin_svg() {
      const svg = `<svg enable-background="new 0 0 100 100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
        <path
          d="m78.527 5h-57.054c-4.104 0-7.431 3.324-7.431 7.428v57.059c0 4.106 3.326 7.433 7.431 7.433h11.965l16.501 18.08 16.5-18.085h12.088c4.104 0 7.431-3.322 7.431-7.429v-57.058c-.001-4.104-3.327-7.428-7.431-7.428z"
          fill="#fc4b60"
          stroke="#000"
          stroke-width="4px"
        />
      </svg>`;
      const b64 = btoa(unescape(encodeURIComponent(svg)));
      return `data:image/svg+xml;base64, ${b64}`;
    },
    selected_feature() {
      if (!this.selected_feature_id) return undefined;
      return this.draw_vector_source?.getFeatureById(this.selected_feature_id);
    },
    selected_feature_type() {
      if (!this.selected_feature) return undefined;
      return this.selected_feature.getGeometry().getType();
    },
    has_module_content_to_show() {
      if (!this.clicked_location.module)
        return Object.prototype.hasOwnProperty.call(
          this.$slots,
          "popup_message"
        );

      // do not show empty text blocks
      const fm = this.firstMedia(this.clicked_location.module);
      if (
        !fm ||
        (fm.$type === "text" && (fm.$content === "" || fm.$content === "\n"))
      )
        return false;

      return true;
    },
  },
  methods: {
    startMap({ keep_loc_and_zoom = false } = {}) {
      let zoom = 6;
      let center;

      // destroy map if exist
      if (this.map) {
        if (keep_loc_and_zoom) {
          zoom = this.map.getView().getZoom();
          center = this.map.getView().getCenter();
        }
        this.map.setTarget(null);
        this.map = null;
      }

      olProj.useGeographic();

      const { view, background_layer } = this.createViewAndBackgroundLayer({
        center,
        zoom,
      });
      this.background_layer = background_layer;
      this.view = view;

      this.setBackgroundLayerOptions();

      this.map = new olMap({
        controls: olDefaultControls({
          zoom: false,
        }),
        target: this.$refs.map,
        view: this.view,
        layers: [this.background_layer],
      });

      ////////////////////////////////////////////////////////////////////////// CREATE LINES

      this.lines_vector_source = new olSourceVector({
        wrapX: false,
      });
      this.loadLines();
      this.map.addLayer(
        new olVectorLayer({
          source: this.lines_vector_source,
          style: (feature, resolution) =>
            this.makeLineStyle({ feature, resolution }),
        })
      );

      ////////////////////////////////////////////////////////////////////////// DRAW LAYER

      this.draw_vector_source = new olSourceVector({ wrapX: false });
      this.loadGeom();
      this.map.addLayer(
        new olVectorLayer({
          source: this.draw_vector_source,
          style: (feature, resolution) =>
            this.makeGeomStyle({ feature, resolution }),
        })
      );

      ////////////////////////////////////////////////////////////////////////// CREATE PINS

      this.pins_vector_source = new olSourceVector({
        wrapX: false,
      });
      this.loadPins();
      this.map.addLayer(
        new olVectorLayer({
          source: this.pins_vector_source,
          style: (feature, resolution) =>
            this.makePointStyle({
              feature,
              resolution,
            }),
          // hides pins on map, not ideal
          // declutter: true,
        })
      );

      ////////////////////////////////////////////////////////////////////////// MOUSE

      this.mouse_feature = new olFeature({
        geometry: new olPoint([undefined, undefined]),
      });
      this.map.addLayer(
        new olVectorLayer({
          source: new olSourceVector({
            features: [this.mouse_feature],
            wrapX: false,
          }),
          style: (feature, resolution) =>
            this.makePointStyle({
              feature,
              resolution,
            }),
        })
      );

      const fs_option = new olFullScreen({
        source: this.$el,
      });
      this.map.addControl(fs_option);

      ////////////////////////////////////////////////////////////////////////// SCALELINE

      if (this.show_scale) {
        const scale_line = new olScaleLine({
          units: "metric",
        });
        this.map.addControl(scale_line);
      }

      ////////////////////////////////////////////////////////////////////////// SEARCH FIELD

      let lang = "en-US";
      if (this.$i18n.locale === "fr") lang = "fr-FR";

      const geocoder = new Geocoder("nominatim", {
        provider: "osm",
        //key: '__some_key__',
        lang,
        placeholder: this.$t("search_for_a_place"),
        // targetType: "text-input",
        limit: 5,
        keepOpen: true,
        preventDefault: true,
      });
      this.map.addControl(geocoder);

      let search_timeout;
      const startTimeout = () => {
        console.log("startTimeout");
        search_timeout = setTimeout(() => {
          clearTimeout(search_timeout);
          this.$alertify.error(this.$t("no_results"));
        }, 2000);
      };

      const search_button = document.querySelector(
        ".ol-geocoder #gcd-input-search"
      );
      if (search_button) search_button.addEventListener("click", startTimeout);

      const search_input = document.querySelector(
        ".ol-geocoder #gcd-input-query"
      );
      if (search_input)
        search_input.addEventListener("keyup", function (e) {
          if (e.key === "Enter" || e.keyCode === 13) {
            startTimeout();
          }
        });

      geocoder.on("addresschosen", async (evt) => {
        if (search_timeout) clearTimeout(search_timeout);

        this.closePopup();

        await this.$nextTick();

        const place = evt.place;

        if (place?.lon && place?.lat) {
          const longitude = +place.lon;
          const latitude = +place.lat;
          await this.setClickBtn({
            longitude,
            latitude,
          });

          // not working, but should

          let { bbox } = place;
          if (bbox) {
            const feature1 = new olFeature({
              geometry: new olPoint([parseFloat(bbox[3]), parseFloat(bbox[0])]),
            });
            const feature2 = new olFeature({
              geometry: new olPoint([parseFloat(bbox[2]), parseFloat(bbox[1])]),
            });
            const features = new olSourceVector({
              wrapX: false,
            });
            features.addFeature(feature1);
            features.addFeature(feature2);
            const extent = features.getExtent();

            this.map
              .getView()

              .fit(extent, {
                padding: [50, 50, 50, 50],
              });
          } else {
            this.navigateTo({
              center: [longitude, latitude],
            });
          }

          this.popup_message = evt.address.formatted;
        }
      });

      ////////////////////////////////////////////////////////////////////////// OVERLAYS

      this.overlay = new olOverlay({
        element: this.$refs.popUp,
        autoPan: false,
      });
      this.map.addOverlay(this.overlay);

      ////////////////////////////////////////////////////////////////////////// MAP OR FEATURE CLICK

      this.map.on("moveend", () => {
        this.current_zoom = this.roundToDec(this.map.getView().getZoom());
        this.current_view = this.map.getView().getCenter();
      });

      this.map.on("singleclick", async (event) => {
        if (this.current_draw_mode) return;

        this.closePopup();
        await this.$nextTick();

        const features = this.map.getFeaturesAtPixel(event.pixel);
        const f = features.find((f) => f.getId());
        const pin_path = f ? f.getId() : false;

        let [longitude, latitude] = event.coordinate;
        longitude = this.roundToDec(longitude, 6);
        latitude = this.roundToDec(latitude, 6);

        let type_of_pin;
        if (f) type_of_pin = f.get("type_of_pin");

        if (pin_path && type_of_pin === "media") {
          this.$eventHub.$emit(`publication.story.scrollTo.${pin_path}`);
          this.openPin(pin_path);
        } else if (this.can_click) {
          this.setClickBtn({
            longitude,
            latitude,
          });
        }
      });

      ////////////////////////////////////////////////////////////////////////// SET VIEW

      if (!keep_loc_and_zoom) {
        let extent;

        if (this.map_baselayer !== "image") {
          let extents = [];
          if (this.pins_vector_source.getFeatures().length > 0)
            extents.push(this.pins_vector_source.getExtent());

          if (this.draw_vector_source.getFeatures().length > 0)
            extents.push(this.draw_vector_source.getExtent());

          if (extents.length > 0) {
            if (extents.length === 1) extent = extents[0];
            else if (extents.length === 2)
              extent = extend(extents[0], extents[1]);
          }
        } else {
          extent = this.map.getView().getProjection().getExtent();
        }

        if (extent) {
          let padding =
            this.map_baselayer === "image" ? [0, 0, 0, 0] : [50, 50, 50, 50];
          this.map.getView().fit(extent, {
            padding,
          });
        }

        if (this.start_zoom) {
          this.map.getView().setZoom(this.start_zoom);
        } else if (
          // prevent zoom from being too high (even though it may be correct for the extent)
          this.map_baselayer !== "image" &&
          this.map.getView().getZoom() > 15
        )
          this.map.getView().setZoom(15);
      }
    },
    zoomIn() {
      var view = this.map.getView();
      var zoom = view.getZoom();
      view.setZoom(zoom + 1);
    },
    zoomOut() {
      var view = this.map.getView();
      var zoom = view.getZoom();
      view.setZoom(zoom - 1);
    },
    async setClickBtn({ longitude, latitude }) {
      this.$emit("newPositionClicked", {
        longitude,
        latitude,
        zoom: this.current_zoom,
      });
      this.$eventHub.$emit("publication.map.click", {
        longitude,
        latitude,
      });
      this.mouse_feature.getGeometry().setCoordinates([longitude, latitude]);

      this.overlay.setPosition([longitude, latitude]);
      this.clicked_location.longitude = longitude;
      this.clicked_location.latitude = latitude;

      setTimeout(() => {
        this.navigateTo({
          center: [longitude, latitude],
        });
      }, 100);
    },
    getCurrentPosition() {
      this.is_looking_for_gps_coords = true;
      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };
      const success = async (pos) => {
        var crd = pos.coords;
        this.is_looking_for_gps_coords = false;
        await this.setClickBtn({
          longitude: crd.longitude,
          latitude: crd.latitude,
        });
        this.navigateTo({
          center: [crd.longitude, crd.latitude],
        });
      };
      const error = (err) => {
        this.$alertify
          .delay(4000)
          .error(
            `Échec de la localisation de votre appareil.<br>(${err.code}): ${err.message}`
          );
        this.is_looking_for_gps_coords = false;
      };
      // not working in Electron, use something like http://ip-api.com/json https://www.reddit.com/r/electronjs/comments/hbxick/comment/fvq96v6/?utm_source=reddit&utm_medium=web2x&context=3 ?
      navigator.geolocation.getCurrentPosition(success, error, options);
    },
    toggleSearch() {
      this.$el.querySelector("#gcd-button-control").click();
    },
    printMap() {
      this.start_map_print = true;
    },
    createViewAndBackgroundLayer({ center, zoom }) {
      let view, background_layer;

      if (this.map_baselayer === "image") {
        if (!this.map_base_media) {
          this.$alertify.delay(4000).error("missing base image");
          throw new Error(`missing base image`);
        }

        const img_width = this.map_base_media.$infos?.width;
        const img_height = this.map_base_media.$infos?.height;
        const img_src = this.makeMediaFileURL({
          $path: this.map_base_media.$path,
          $media_filename: this.map_base_media.$media_filename,
        });
        const attributions = this.map_base_media.caption;

        const extent = [0, 0, img_width, img_height];
        const projection = new olProjection({
          code: "custom-image",
          units: "pixels",
          extent,
        });
        center = center || getCenter(extent);
        zoom = 1;

        view = new olView({
          projection: projection,
          center,
          zoom,
          maxZoom: 6,
        });
        background_layer = new olImageLayer({
          source: new olStatic({
            attributions,
            url: img_src,
            projection,
            imageExtent: extent,
          }),
          className: "ol-layer ol-basemap",
        });
      } else if (this.map_baselayer === "color") {
        const img_width = 2000;
        const img_height = 2000;

        const extent = [0, 0, img_width, img_height];
        const projection = new olProjection({
          code: "solid-color",
          units: "pixels",
          extent,
        });
        center = getCenter(extent);
        zoom = 1;

        var canvas = document.createElement("canvas");
        canvas.width = img_width;
        canvas.height = img_height;
        // var ctx = canvas.getContext("2d");
        // ctx.fillStyle = "blue";
        // ctx.fillRect(0, 0, img_width, img_height);
        var imageDataURL = canvas.toDataURL();

        view = new olView({
          projection,
          center,
          zoom,
          maxZoom: 6,
        });
        background_layer = new olImageLayer({
          source: new olStatic({
            // attributions,
            url: imageDataURL,
            projection,
            imageExtent: extent,
          }),
          className: "ol-layer ol-basemap",
        });
      } else {
        // TODO check if center is contained in extent (see containsXY)
        center = center || [5.39057449011251, 43.310173305629576];

        const maxZoom = this.map_baselayer.includes("IGN") ? 19 : 21;
        view = new olView({
          center,
          zoom,
          minZoom: 3,
          maxZoom,
          showFullExtent: true,
          enableRotation: false,
        });
        const source = this.createSource(this.map_baselayer);
        background_layer = new olTileLayer({
          source,
          className: "ol-layer ol-basemap",
        });
        background_layer.getSource().on("tileloaderror", (err) => {
          console.error(err.tile.l);
          this.$alertify.delay(4000).error(this.$t("failed_loading_tiles"));
        });
      }

      this.current_zoom = zoom;
      this.current_view = center;
      return { view, background_layer };
    },

    createSource(type) {
      if (type === "OSM") {
        return new olSourceOSM({
          wrapX: false,
          noWrap: true,
        });
      } else if (type === "stadia_alidade_smooth") {
        return new olSourceStadiaMaps({
          layer: "alidade_smooth",
          retina: true, // Set to false for stamen_watercolor
        });
      } else if (type === "stadia_alidade_smooth_dark") {
        return new olSourceStadiaMaps({
          layer: "alidade_smooth_dark",
          retina: true, // Set to false for stamen_watercolor
        });
      } else if (type === "stadia_toner") {
        return new olSourceStadiaMaps({
          layer: "stamen_toner",
          retina: true, // Set to false for stamen_watercolor
        });
      } else if (type === "stadia_watercolor") {
        return new olSourceStadiaMaps({
          layer: "stamen_watercolor",
          retina: false,
        });
      } else if (["IGN_SAT", "IGN_MAP"].includes(type)) {
        const resolutions = [
          156543.03392804103, 78271.5169640205, 39135.75848201024,
          19567.879241005125, 9783.939620502562, 4891.969810251281,
          2445.9849051256406, 1222.9924525628203, 611.4962262814101,
          305.74811314070485, 152.87405657035254, 76.43702828517625,
          38.218514142588134, 19.109257071294063, 9.554628535647034,
          4.777314267823517, 2.3886571339117584, 1.1943285669558792,
          0.5971642834779396, 0.29858214173896974, 0.14929107086948493,
          0.07464553543474241,
        ];

        let layer, format;
        if (type === "IGN_MAP") {
          layer = "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2";
          format = "image/png";
        } else if (type === "IGN_SAT") {
          layer = "ORTHOIMAGERY.ORTHOPHOTOS";
          format = "image/jpeg";
        }

        return new olSourceWMTS({
          url: "https://data.geopf.fr/wmts",
          layer,
          matrixSet: "PM",
          format,
          style: "normal",
          tileGrid: new olTileGridWMTS({
            origin: [-20037508, 20037508], // topLeftCorner
            resolutions, // résolutions
            matrixIds: [
              "0",
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "10",
              "11",
              "12",
              "13",
              "14",
              "15",
              "16",
              "17",
              "18",
              "19",
            ], // ids des TileMatrix
          }),
          wrapX: false,
          noWrap: true,
        });
      }
    },
    makePointStyle({ feature, resolution, fill_color = "hsl(0, 0%, 15%)" }) {
      // see https://openlayers.org/en/latest/examples/vector-labels.html
      resolution;
      let style = {};
      if (feature?.get("fill_color")) {
        fill_color = feature.get("fill_color");
      }
      if (feature?.get("label")) {
        style.text = new olText({
          fill: new olFill({ color: fill_color }),
          font: this.makeDefaultFontString(),
          text: "" + feature.get("label"),
          textAlign: "center",
          textBaseline: "bottom",
          offsetY: -9,
        });
      }

      const pin_preview = feature.get("pin_preview");
      const pin_preview_src = feature.get("pin_preview_src");

      if (pin_preview === "icon") {
        style.text = undefined;
        style.image = new olIcon({
          anchor: [0.5, 1],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction",
          size: [30, 30],
          // do not use color: it is injected directly in the svg
          // color: fill_color,
          src: pin_preview_src,
        });
      } else if (pin_preview === "media_preview") {
        const first_media_thumb = feature.get("first_media_thumb");
        style.image = new olIcon({
          anchor: [0.5, 1],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction",
          src: first_media_thumb,
        });
      } else if (pin_preview === "default") {
        style.text = undefined;
        style.image = new olIcon({
          anchor: [0.5, 1],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction",
          size: [30, 30],
          src: this.default_pin_svg,
        });
      } else {
        style.image = this.makePointerStyle(fill_color);
      }

      return new olStyle(style);
    },
    makeDefaultFontString() {
      return "bold 14px/1.2 Fira Mono,sans-serif";
    },
    makeLineStyle({ feature, resolution }) {
      resolution;
      const style = {
        stroke: new olStroke({
          color: feature.get("stroke_color"),
          width: 3,
          lineDash: [10, 10],
        }),
      };
      return new olStyle(style);
    },
    modifyStyle() {
      return new olStyle({
        image: new olCircleStyle({
          radius: 5,
          stroke: new olStroke({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          fill: new olFill({
            color: "rgba(0, 0, 0, 0.4)",
          }),
        }),
        text: new olText({
          text: this.$t("drag_to_modify"),
          font: this.makeDefaultFontString(),
          fill: new olFill({
            color: "rgba(255, 255, 255, 1)",
          }),
          backgroundFill: new olFill({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          padding: [2, 2, 2, 2],
          textAlign: "left",
          offsetX: 15,
        }),
      });
    },
    translateStyle() {
      return new olStyle({
        image: new olCircleStyle({
          radius: 5,
          stroke: new olStroke({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          fill: new olFill({
            color: "rgba(0, 0, 0, 0.4)",
          }),
        }),
        text: new olText({
          text: this.$t("drag_to_modify"),
          font: this.makeDefaultFontString(),
          fill: new olFill({
            color: "rgba(255, 255, 255, 1)",
          }),
          backgroundFill: new olFill({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          padding: [2, 2, 2, 2],
          textAlign: "left",
          offsetX: 15,
        }),
      });
    },
    makeGeomStyle({ feature, resolution, tip, is_selected }) {
      const styles = [];

      // const line_dash = !is_selected ? undefined : [10, 5];
      let stroke_width = feature.get("stroke_width") || 3;
      resolution;
      // TEST
      // stroke_width =
      //   (feature.getProperties().value % 50 == 0 ? 3.175 : 1.863) *
      //   Math.min(1, 2.5 / resolution);
      // stroke_width = Math.max(3, stroke_width / resolution);

      const stroke_color =
        feature.get("stroke_color") || this.opened_view_color || "#000";
      let fill_color = feature.get("fill_color") || "rgba(255, 255, 255, 1)";
      if (fill_color !== "transparent")
        fill_color = asString(asArray(fill_color).slice(0, 3).concat(0.2));

      if (is_selected) {
        const style = new olStyle({
          stroke: new olStroke({
            color: "white",
            width: stroke_width + 4,
            // lineDash: line_dash,
          }),
          image: this.makePointerStyle(),
        });
        styles.push(style);
      }

      const style = new olStyle({
        fill: new olFill({
          color: fill_color,
        }),
        stroke: new olStroke({
          color: stroke_color,
          width: stroke_width,
          // lineDash: line_dash,
        }),
        image: this.makePointerStyle(),
      });
      styles.push(style);

      const geometry = feature.getGeometry();
      const type = geometry.getType();

      if (
        tip &&
        (type === "Point" || is_selected) &&
        (!this.map_modify ||
          !this.map_modify.getOverlay().getSource().getFeatures().length)
      ) {
        const tipStyle = new olStyle({
          text: new olText({
            font: this.makeDefaultFontString(),
            fill: new olFill({
              color: "rgba(0, 0, 0, 1)",
            }),
            backgroundFill: new olFill({
              color: "rgba(255, 255, 255, .85)",
            }),
            padding: [2, 2, 2, 2],
            textAlign: "left",
            offsetX: 15,
          }),
        });

        tipStyle.getText().setText(tip);
        styles.push(tipStyle);
      }

      return styles;
    },
    makePointerStyle(fill_color = this.opened_view_color || "#000") {
      return new olCircleStyle({
        radius: 5,
        stroke: new olStroke({
          width: 2,
          color: fill_color,
        }),
        fill: new olFill({
          color: "rgba(255, 255, 255, .5)",
        }),
      });
    },
    resetClickedLocation() {
      if (this.mouse_feature)
        this.mouse_feature.getGeometry().setCoordinates([undefined, undefined]);
      this.clicked_location.latitude = undefined;
      this.clicked_location.longitude = undefined;
      this.clicked_location.module = undefined;
      this.popup_message = undefined;
    },
    navigateTo({ center, zoom = this.current_zoom }) {
      // used to stop current animation if there are any
      // see https://github.com/openlayers/openlayers/issues/3714#issuecomment-263266468
      this.view.setRotation(0);
      const duration = 1400;

      // if (this.zoom_animation && this.zoom_animation > 0)
      //   this.view.animate(
      //     {
      //       zoom: zoom - this.zoom_animation,
      //       duration: duration / 2,
      //     },
      //   );
      //   this.view.animate(
      //     {

      //       zoom: zoom,
      //       duration: duration / 2,
      //     },
      //   );
      //   else
      this.view.animate({
        center,
        duration,
        zoom,
      });
    },
    openPin(pin_path) {
      this.$emit("update:opened_pin_path", pin_path);
    },
    openFeature(path) {
      const feature = this.pins_vector_source.getFeatureById(path);
      const pin = this.pins.find((p) => p.path === path);
      if (!feature) return "no_feature_found";

      this.resetClickedLocation();

      const coordinates = feature.getGeometry().getCoordinates();
      this.clicked_location.module = pin?.module;
      this.overlay.setPosition(coordinates);
      this.clicked_location.longitude = coordinates[0];
      this.clicked_location.latitude = coordinates[1];

      const pin_zoom_level = this.clicked_location.module?.zoom_level;
      this.navigateTo({
        center: [
          this.clicked_location.longitude,
          this.clicked_location.latitude,
        ],
        zoom: pin_zoom_level,
      });
    },
    closePopup() {
      this.resetClickedLocation();
      if (this.opened_pin_path) this.$emit("update:opened_pin_path", undefined);

      this.overlay.setPosition(undefined);
      if (this.$refs.closePopup) this.$refs.closePopup.blur();

      return false;
    },
    toggleTool({ draw_mode } = {}) {
      this.closePopup();
      this.endSelectMode();
      this.endDraw();
      if (!draw_mode || this.current_draw_mode === draw_mode.key) {
        this.current_draw_mode = undefined;
      } else {
        this.current_draw_mode = draw_mode.key;
        if (draw_mode.key === "Select") this.startSelectMode();
        else this.startDrawMode({ draw_mode });
      }
    },
    startDrawMode({ draw_mode }) {
      let drawType = draw_mode.olType;
      let freehand = draw_mode.freehand;
      let idleTip = draw_mode.idleTip;
      let activeTip = draw_mode.activeTip;

      let tip = idleTip;
      this.map_draw = new olDraw({
        source: this.draw_vector_source,
        type: drawType,
        freehand,
        style: (feature, resolution) =>
          this.makeGeomStyle({ feature, resolution, tip }),
        // style: (feature) => {
        //   return this.styleFunction(
        //     feature,
        //     this.show_segments_length,
        //     drawType,
        //     tip
        //   );
        // },
      });
      this.map.addInteraction(this.map_draw);
      this.map_draw.on("drawstart", () => {
        tip = activeTip;
        if (["LineString", "Polygon"].includes(this.current_draw_mode))
          this.draw_can_be_finished = true;
      });
      this.map_draw.on("drawabort", () => {
        tip = idleTip;
        this.draw_can_be_finished = false;
      });
      this.map_draw.on("drawend", (event) => {
        const new_feature = event.feature;
        const type = new_feature.getGeometry().getType();
        var id = this.makeRandomIdForShape(type);
        new_feature.setId(id);
        new_feature.set("type_of_pin", "geometry");

        this.$nextTick(() => {
          this.saveGeom();
        });
        tip = idleTip;
        this.draw_can_be_finished = false;
      });

      this.map_snap = new olSnap({ source: this.draw_vector_source });
      this.map.addInteraction(this.map_snap);
    },

    // styleFunction(feature, segments, drawType, tip) {
    //   const style = new olStyle({
    //     fill: new olFill({
    //       color: "rgba(255, 255, 255, 0.2)",
    //     }),
    //     stroke: new olStroke({
    //       color: "rgba(0, 0, 0, 0.5)",
    //       lineDash: [10, 10],
    //       width: 2,
    //     }),
    //     image: new olCircleStyle({
    //       radius: 5,
    //       stroke: new olStroke({
    //         color: "rgba(0, 0, 0, 0.7)",
    //       }),
    //       fill: new olFill({
    //         color: "rgba(255, 255, 255, 0.2)",
    //       }),
    //     }),
    //   });

    //   const labelStyle = new olStyle({
    //     text: new olText({
    //       font: "14px Calibri,sans-serif",
    //       fill: new olFill({
    //         color: "rgba(255, 255, 255, 1)",
    //       }),
    //       backgroundFill: new olFill({
    //         color: "rgba(0, 0, 0, 0.7)",
    //       }),
    //       padding: [3, 3, 3, 3],
    //       textBaseline: "bottom",
    //       offsetY: -15,
    //     }),
    //     image: new olRegularShape({
    //       radius: 8,
    //       points: 3,
    //       angle: Math.PI,
    //       displacement: [0, 10],
    //       fill: new olFill({
    //         color: "rgba(0, 0, 0, 0.7)",
    //       }),
    //     }),
    //   });

    //   const tipStyle = new olStyle({
    //     text: new olText({
    //       font: "12px Calibri,sans-serif",
    //       fill: new olFill({
    //         color: "rgba(255, 255, 255, 1)",
    //       }),
    //       backgroundFill: new olFill({
    //         color: "rgba(0, 0, 0, 0.4)",
    //       }),
    //       padding: [2, 2, 2, 2],
    //       textAlign: "left",
    //       offsetX: 15,
    //     }),
    //   });

    //   const segmentStyle = new olStyle({
    //     text: new olText({
    //       font: "12px Calibri,sans-serif",
    //       fill: new olFill({
    //         color: "rgba(255, 255, 255, 1)",
    //       }),
    //       backgroundFill: new olFill({
    //         color: "rgba(0, 0, 0, 0.4)",
    //       }),
    //       padding: [2, 2, 2, 2],
    //       textBaseline: "bottom",
    //       offsetY: -12,
    //     }),
    //     image: new olRegularShape({
    //       radius: 6,
    //       points: 3,
    //       angle: Math.PI,
    //       displacement: [0, 8],
    //       fill: new olFill({
    //         color: "rgba(0, 0, 0, 0.4)",
    //       }),
    //     }),
    //   });

    //   const segmentStyles = [segmentStyle];

    //   const formatLength = function (line) {
    //     const length = getLength(line);
    //     let output;
    //     if (length > 100) {
    //       output = Math.round((length / 1000) * 100) / 100 + " km";
    //     } else {
    //       output = Math.round(length * 100) / 100 + " m";
    //     }
    //     return output;
    //   };

    //   const formatArea = function (polygon) {
    //     const area = getArea(polygon);
    //     let output;
    //     if (area > 10000) {
    //       output = Math.round((area / 1000000) * 100) / 100 + " km\xB2";
    //     } else {
    //       output = Math.round(area * 100) / 100 + " m\xB2";
    //     }
    //     return output;
    //   };

    //   const styles = [];
    //   const geometry = feature.getGeometry();
    //   const type = geometry.getType();
    //   let point, label, line;
    //   if (!drawType || drawType === type || type === "Point") {
    //     styles.push(style);
    //     if (type === "Polygon") {
    //       point = geometry.getInteriorPoint();
    //       label = formatArea(geometry);
    //       line = new olLineString(geometry.getCoordinates()[0]);
    //     } else if (type === "LineString") {
    //       point = new olPoint(geometry.getLastCoordinate());
    //       label = formatLength(geometry);
    //       line = geometry;
    //     }
    //   }
    //   if (segments && line) {
    //     let count = 0;
    //     line.forEachSegment(function (a, b) {
    //       const segment = new olLineString([a, b]);
    //       const label = formatLength(segment);
    //       if (segmentStyles.length - 1 < count) {
    //         segmentStyles.push(segmentStyle.clone());
    //       }
    //       const segmentPoint = new olPoint(segment.getCoordinateAt(0.5));
    //       segmentStyles[count].setGeometry(segmentPoint);
    //       segmentStyles[count].getText().setText(label);
    //       styles.push(segmentStyles[count]);
    //       count++;
    //     });
    //   }
    //   if (label) {
    //     labelStyle.setGeometry(point);
    //     labelStyle.getText().setText(label);
    //     styles.push(labelStyle);
    //   }
    //   if (
    //     tip &&
    //     type === "Point"
    //     //  &&
    //     // !modify.getOverlay().getSource().getFeatures().length
    //   ) {
    //     // tipPoint = geometry;
    //     tipStyle.getText().setText(tip);
    //     styles.push(tipStyle);
    //   }
    //   return styles;
    // },
    makeRandomIdForShape(type) {
      return `${type}-` + this.getRandomString();
    },

    finishDrawing() {
      if (this.map_draw) this.map_draw.finishDrawing();
    },
    abortDrawing() {
      if (this.map_draw) this.map_draw.abortDrawing();
    },
    disableTools() {
      this.toggleTool();
    },
    setBackgroundLayerOptions() {
      if (this.map_baselayer_bw === true) {
        if (
          !this.background_layer.getFilters().length ||
          this.background_layer.getFilters().length === 0
        ) {
          this.background_layer.addFilter(
            new olFilterCSS({ filter: "grayscale(1)" })
          );
        }
      } else {
        if (this.background_layer.getFilters().length >= 1)
          this.background_layer.removeFilter();
      }

      if (this.map_baselayer_opacity < 1)
        this.background_layer.setOpacity(this.map_baselayer_opacity);
      else this.background_layer.setOpacity(1);
    },
    saveGeom() {
      const geom_str = this.convertFeaturesToStr();
      this.$emit("saveGeom", geom_str);
    },
    convertFeaturesToStr() {
      const features = this.draw_vector_source.getFeatures();
      return features.reduce((acc, f) => {
        const type = f.getGeometry().getType();

        let obj = {};
        if (type === "Polygon" || type === "LineString") {
          obj.type = type;
          obj.coords = f.getGeometry().getCoordinates();
        } else if (type === "Circle") {
          obj.type = type;
          obj.center = f.getGeometry().getCenter();
          obj.radius = f.getGeometry().getRadius();
        } else {
          return acc;
        }

        const stroke_width = f.get("stroke_width");
        if (stroke_width) obj.stroke_width = stroke_width;
        const stroke_color = f.get("stroke_color");
        if (stroke_color) obj.stroke_color = stroke_color;
        const fill_color = f.get("fill_color");
        if (fill_color) obj.fill_color = fill_color;

        const id = f.getId();
        if (id) obj.id = id;

        acc.push(obj);

        return acc;
      }, []);
    },
    loadPins() {
      this.pins_vector_source.clear();

      let features = [];
      if (this.pins && this.pins.length > 0) {
        this.pins
          .slice(0)
          .reverse()
          .map((pin) => {
            if (!pin || !pin.longitude || !pin.latitude) return;

            let feature_cont = {
              geometry: new olPoint([pin.longitude, pin.latitude]),
            };
            if (pin.color) feature_cont.fill_color = pin.color;
            // if (pin.module) feature_cont.module = pin.module;
            if (pin.label) feature_cont.label = pin.label;
            feature_cont.pin_preview = pin.pin_preview || "default";
            if (pin.pin_preview_src)
              feature_cont.pin_preview_src = pin.pin_preview_src;
            if (pin.first_media_thumb)
              feature_cont.first_media_thumb = pin.first_media_thumb;

            const feature = new olFeature(feature_cont);
            feature.setId(pin.path);
            feature.set("type_of_pin", "media");

            features.push(feature);
          });
        this.pins_vector_source.addFeatures(features);
        this.pins_vector_source.changed();
      }
    },
    loadLines() {
      this.lines_vector_source.clear();

      let features = [];
      if (this.lines && Object.keys(this.lines).length > 0) {
        Object.values(this.lines).map(({ color, coordinates }) => {
          const feature_cont = {
            geometry: new olLineString(coordinates),
            name: "Path",
          };
          feature_cont.stroke_color = color;
          const feature = new olFeature(feature_cont);
          features.push(feature);
        });

        this.lines_vector_source.addFeatures(features);
        this.lines_vector_source.changed();
      }
    },
    loadGeom() {
      this.draw_vector_source.clear();

      try {
        let features = [];

        this.geometries?.map((p) => {
          let feature_cont;

          if (p.type === "Polygon" && p.coords)
            feature_cont = {
              geometry: new olPolygon(p.coords),
            };
          else if (p.type === "LineString" && p.coords)
            feature_cont = {
              geometry: new olLineString(p.coords),
            };
          else if (p.type === "Circle" && p.center && p.radius)
            feature_cont = {
              geometry: new olCircle(p.center, p.radius),
            };

          if (p.stroke_width) feature_cont.stroke_width = p.stroke_width;
          if (p.stroke_color) feature_cont.stroke_color = p.stroke_color;
          if (p.fill_color) feature_cont.fill_color = p.fill_color;

          const feature = new olFeature(feature_cont);
          if (p.id) feature.setId(p.id);
          else feature.setId(this.makeRandomIdForShape(p.type));
          feature.set("type_of_pin", "geometry");

          features.push(feature);
        });

        if (features.length > 0) this.draw_vector_source.addFeatures(features);
        this.draw_vector_source.changed();

        if (this.selected_feature_id && !this.selected_feature)
          this.selected_feature_id = undefined;
      } catch (err) {
        this.$alertify.delay(4000).error(err);
        return false;
      }
    },
    endDraw() {
      this.abortDrawing();
      this.map.removeInteraction(this.map_modify);
      this.map.removeInteraction(this.map_draw);
      this.map.removeInteraction(this.map_snap);
    },
    startSelectMode() {
      this.selected_feature_id = undefined;
      this.map_select_mode = new olSelect({
        style: (feature, resolution) =>
          this.makeGeomStyle({ feature, resolution, is_selected: true }),
      });
      this.map.addInteraction(this.map_select_mode);
      this.map_select_mode.on("select", (e) => {
        if (e.target.getFeatures().getLength() > 0) {
          const feature_selected = e.target.getFeatures().getArray()[0];
          const id = feature_selected.getId();
          if (id) return (this.selected_feature_id = id);
        }
        this.selected_feature_id = undefined;
      });

      this.startTranslate();
      // clashes with translate on linestring
      // this.startModify();
    },
    startTranslate() {
      this.map_translate = new olTranslate({
        features: this.map_select_mode.getFeatures(),
      });
      this.map.addInteraction(this.map_translate);
      this.map_translate.on("translateend", () => {
        this.$nextTick(() => {
          this.saveGeom();
        });
      });
    },
    endTranslate() {
      this.map.removeInteraction(this.map_translate);
    },
    startModify() {
      this.map_modify = new olModify({
        source: this.draw_vector_source,
        style: this.modifyStyle,
      });
      this.map.addInteraction(this.map_modify);
      this.map_modify.on("modifyend", () => {
        this.$nextTick(() => {
          this.saveGeom();
        });
      });
    },
    endModify() {
      this.map.removeInteraction(this.map_modify);
    },
    removeSelected() {
      if (!this.selected_feature) return false;
      const f = this.draw_vector_source.getFeatureById(
        this.selected_feature_id
      );
      this.draw_vector_source.removeFeature(f);
      this.$nextTick(() => {
        this.saveGeom();
      });
    },
    updateDrawing({ prop, val }) {
      if (!this.selected_feature) return false;
      const f = this.draw_vector_source.getFeatureById(
        this.selected_feature_id
      );
      f.set(prop, val);
      this.$nextTick(() => {
        this.saveGeom();
      });
    },
    endSelectMode() {
      this.map.removeInteraction(this.map_select_mode);
      this.selected_feature_id = undefined;
    },
    keyPressed(event) {
      if (
        this.$root.modal_is_opened ||
        event.target.tagName.toLowerCase() === "select" ||
        event.target.tagName.toLowerCase() === "input" ||
        event.target.tagName.toLowerCase() === "textarea" ||
        event.target.className.includes("ql-editor") ||
        event.target.hasAttribute("contenteditable") ||
        this.can_edit === false
      )
        return;

      if (event.key === "Backspace" || event.key === "Delete")
        this.removeSelected();
      else if (event.key === "Escape" && this.map_draw) this.abortDrawing();
      else if (event.key === "Enter" && this.map_draw) this.finishDrawing();
      else if (event.key === " ")
        this.toggleTool({
          draw_mode: { key: "Select" },
        });
      else if (["1", "2", "3", "4"].includes(event.key)) {
        const mode_num = Number.parseInt(event.key) - 1;
        this.toggleTool({
          draw_mode: this.draw_modes[mode_num],
        });
      }
    },
  },
};
</script>
<style src="../../../node_modules/ol/ol.css"></style>
<style lang="scss" scoped>
.m_displayOnMap {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--c-gris_clair);
  font-size: 150%;

  flex: 1 1 320px;

  &.is--small {
    width: 600px;
    max-width: 100%;
    aspect-ratio: 1;
    border-radius: 4px;
    overflow: hidden;
  }
}
._map {
  width: 100%;
  height: 100%;
  background-color: var(--map-background-color);

  ::v-deep {
    .ol-geocoder {
      position: absolute;
      top: calc(6rem);
      left: calc(var(--spacing) / 1 + 2rem + 2px);

      font-size: 0.8em;
      border-radius: 2px;

      .gcd-gl-btn {
        height: 2rem;
        width: 2rem;
      }
      #gcd-button-control {
        visibility: hidden;
        width: 1px;
        height: 1px;
      }
      .gcd-gl-control {
        height: auto;
        width: 0;
        overflow: hidden;
        border-radius: 0;
        margin: 0;
        background: transparent;

        &.gcd-gl-expanded {
          width: calc(14rem + 2px);
        }
      }
      .gcd-gl-input {
        width: 100%;
        border-radius: 3px;
        left: 0;
        top: 0;
        padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
        padding-right: 2em;
        height: calc(2rem + 2px);
        position: relative;
        border: 1px solid var(--c-gris_fonce);

        &:focus-visible {
          box-shadow: none;
          border-color: var(--active-color);
        }
      }
      .gcd-gl-search:after {
        content: "→";

        line-height: 1;
        font-weight: 800;
        background: var(--active-color);
        color: white;
        display: inline-block;
        border-radius: 50%;
        margin-top: 3px;
        padding: 4px;
        font-size: 90%;
      }
    }
    .gcd-road {
      font-weight: normal;
      font-style: italic;
      font-size: var(--sl-font-size-small);
      color: inherit;
    }

    .ol-full-screen {
      top: auto;
      bottom: calc(var(--spacing) * 3);
      right: auto;
      left: calc(var(--spacing) * 1);

      .m_displayOnMap.is--image & {
        bottom: calc(var(--spacing) * 1);
      }
    }
    .ol-scale-line {
      bottom: calc(var(--spacing) / 1);
      left: calc(var(--spacing) / 1);

      background: white;

      padding: 0;
      border-radius: 1px;
      margin: 0;
    }
  }
}
._popup {
  position: absolute;
  bottom: 38px;
  bottom: 9px;
  left: -48px;
  min-width: 280px;
  opacity: 0;

  font-size: var(--sl-font-size-normal);

  &::before,
  &::after {
    top: 100%;

    border: solid transparent;
    border-width: 11px;
    left: 47px;
    margin-left: -10px;

    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }
  &::before {
    border-top-color: black;
    opacity: 0.1;
  }

  &::after {
    border-top-color: white;
    top: 100%;
    border-width: 9px;
    left: 49px;
  }
  // &:before {
  //   border-top-color: #cccccc;
  //   border-width: 11px;
  //   left: 48px;
  //   margin-left: -11px;
  // }

  &.is--shown {
    opacity: 1;
  }
  &.is--pin {
    bottom: 38px;
  }

  ._pinContent,
  ._popupClose {
    pointer-events: auto;
  }
}
._popup--content {
  position: relative;
  z-index: 1;
  border-radius: 3px;
  background: white;
  overflow: hidden;
}
._popupShadow {
  position: absolute;
  inset: -2px;
  background: black;
  border-radius: 4px;
  content: "";
  z-index: -1;
  opacity: 0.1;
}

._popupClose {
  position: absolute;
  z-index: 1000;
  top: calc(var(--spacing) * -2);
  right: calc(var(--spacing) * -2);
  padding: calc(var(--spacing) / 1);
}

._pinContent {
  position: relative;

  min-height: 1em;
  max-height: 40vh;
  overflow: auto;

  ::v-deep ._publicationModule ._collaborativeEditor {
    padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1) 0;
  }

  ::v-deep ._captionField {
    padding: calc(var(--spacing) / 2);
    padding-top: 0;
  }
}

._popupMessage {
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2);
}

._leftTopMenu {
  position: absolute;
  top: calc(var(--spacing) / 1);
  left: calc(var(--spacing) / 1);
  pointer-events: none;

  > ._buttonRow {
    position: relative;

    &:not(:last-child) {
      margin-bottom: calc(var(--spacing) / 1);
    }

    &::before {
      position: absolute;
      inset: -1px;
      background: black;
      content: "";
      width: calc(2rem + 2px);
      border-radius: 3px;
      opacity: 0.1;
      z-index: 0;
    }
  }

  button {
    position: relative;
    background: white;

    padding: 0;
    color: var(--c-noir);
    height: 2rem;
    min-width: 2rem;

    background-color: white;
    border: 2px solid transparent;
    border-radius: 0;
    margin-bottom: 1px;
    pointer-events: auto;

    padding: calc(var(--spacing) / 4);
    display: flex;

    &:hover,
    &:focus-visible {
    }

    &.is--active {
      background-color: var(--ol-background-color);
      border-color: var(--current-view-color, --active-color);
    }

    &:first-child {
      border-top-left-radius: 2px;
      border-top-right-radius: 2px;
    }
    &:last-child {
      border-bottom-left-radius: 2px;
      border-bottom-right-radius: 2px;
    }

    > span {
      width: 1.35em;
      height: 1.35em;
    }
  }
}

._bottomMenu {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  pointer-events: none;
  padding: calc(var(--spacing) / 2);

  display: flex;

  ._bottomMenu--content {
    position: relative;
    pointer-events: auto;
    margin: 0 auto;
    width: 100%;
    max-width: 250px;

    padding: calc(var(--spacing) / 2);
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;

    display: flex;
    flex-flow: column nowrap;

    &::before {
      position: absolute;
      inset: -1px;
      content: "";
      width: calc(100%);
      border-radius: 3px;
      opacity: 0.1;
      z-index: 0;
      border: 1px solid black;
      pointer-events: none;
    }
  }
}
</style>
<style lang="scss"></style>
