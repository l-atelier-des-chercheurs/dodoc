<template>
  <div
    class="m_displayOnMap"
    :class="{
      'is--small': is_small,
    }"
  >
    <div class="_map" ref="map" />

    <div
      ref="popUp"
      class="_popup"
      v-show="clicked_location.module || $slots.hasOwnProperty('popup_message')"
    >
      <div class="_popupShadow" />
      <div
        class="_popup--content"
        :key="clicked_location.latitude + '-' + clicked_location.longitude"
      >
        <button
          type="button"
          class="u-button u-button_icon _popupClose"
          ref="closePopup"
          @click="closePopup"
        >
          <b-icon icon="x-circle-fill" />
        </button>

        <div
          v-if="clicked_location.module"
          :key="clicked_location.module.$path"
          class="_pinContent"
        >
          <PublicationModule
            :publimodule="clicked_location.module"
            :can_edit="false"
          />
          <!-- <MediaContent
            :file="clicked_location.file"
            :is_draggable="false"
            :resolution="1600"
            :context="'full'"
            :show_fs_button="true"
          /> -->
        </div>

        <!-- <div class="u-instructions">
          <small>
            <span class="complementaryText"> {{ $t("latitude") }} = </span>
            {{ clicked_location.latitude }}°
            <br />
            <span class="complementaryText"> {{ $t("longitude") }} = </span>
            {{ clicked_location.longitude }}°
          </small>
        </div> -->
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
      <template v-for="draw_type in draw_types">
        <button
          type="button"
          class="u-button"
          :class="{
            'is--active': draw_type.key === current_draw_mode,
          }"
          :key="draw_type.key"
          @click="toggleDraw(draw_type.key)"
        >
          {{ draw_type.icon }}
        </button>
      </template>
      <!-- <button type="button" class="" @click="toggleDraw('LinesString')">◯</button> -->
    </div>
  </div>
</template>
<script>
import olSourceOSM from "ol/source/OSM";
import olSourceWMTS from "ol/source/WMTS";
import olMap from "ol/Map";
import olView from "ol/View";
import olFeature from "ol/Feature";
import olPoint from "ol/geom/Point";
import olLineString from "ol/geom/LineString";
import olTileLayer from "ol/layer/Tile";
import olImageLayer from "ol/layer/Image";
import olProjection from "ol/proj/Projection";
import olStatic from "ol/source/ImageStatic";
import olTileGridWMTS from "ol/tilegrid/WMTS";
import olVectorLayer from "ol/layer/Vector";
import olSourceVector from "ol/source/Vector";
import * as olProj from "ol/proj";
import olOverlay from "ol/Overlay";
import { getCenter } from "ol/extent";

import Geocoder from "ol-geocoder";
import "ol-geocoder/dist/ol-geocoder.min.css";

import olStyle from "ol/style/Style";
import olIcon from "ol/style/Icon";
import olCircleStyle from "ol/style/Circle";
import olFill from "ol/style/Fill";
import olStroke from "ol/style/Stroke";
import olText from "ol/style/Text";
import {
  ScaleLine as olScaleLine,
  FullScreen as olFullScreen,
} from "ol/control";

import {
  Draw as olDraw,
  Modify as olModify,
  Snap as olSnap,
} from "ol/interaction";

import PublicationModule from "@/components/publications/modules/PublicationModule.vue";

export default {
  name: "DisplayOnMap",
  props: {
    pins: [Boolean, Array],
    lines: [Boolean, Object],
    start_coords: {
      type: [Boolean, Object],
    },
    start_zoom: {
      type: [Boolean, Number],
      default: 2,
    },
    map_mode: {
      type: String,
      default: "map",
    },
    map_baselayer: {
      type: String,
      default: "OSM",
      validator(value) {
        // The value must match one of these strings
        return ["OSM", "IGN_MAP", "IGN_SAT"].includes(value);
      },
    },
    map_base_media: Object,
    is_small: {
      type: Boolean,
      default: true,
    },
    show_scale: {
      type: Boolean,
      default: true,
    },
    opened_pin_path: String,
    can_add_media_to_point: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    PublicationModule,
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

      pin_features: undefined,
      line_features: undefined,
      mouse_feature: undefined,

      current_zoom: undefined,
      current_view: undefined,

      min_zoom: 3,
      max_zoom: 22,

      mouse_coords: false,

      map_modify: undefined,
      map_draw: undefined,
      map_snap: undefined,

      current_draw_mode: undefined,
      draw_types: [
        {
          key: "Circle",
          label: this.$t("circle"),
          icon: "◯",
        },
        {
          key: "Polygon",
          label: this.$t("polygon"),
          icon: "▱",
        },
      ],
    };
  },
  i18n: {
    messages: {
      fr: {
        mouse_position: "Position de la balise",
        search_for_a_place: "Rechercher un lieu",
      },
    },
  },
  created() {
    this.$eventHub.$on("publication.map.navigateTo", this.navigateTo);
    this.$eventHub.$on("publication.map.openPin", this.openPin);
  },
  mounted() {
    setTimeout(() => {
      this.startMap();
    }, 500);
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.map.navigateTo", this.navigateTo);
    this.$eventHub.$off("publication.map.openPin", this.openPin);
  },
  watch: {
    pins: {
      handler() {
        const new_pin_features = this.createPointFeaturesFromPins();
        if (
          JSON.stringify(new_pin_features) !== JSON.stringify(this.pin_features)
        )
          this.startMap({ keep_loc_and_zoom: true });
      },
      deep: true,
    },
    // lines: {
    //   handler() {
    //     const new_line_features = this.createLineFeaturesFromLines();
    //     if (
    //       JSON.stringify(new_line_features) !==
    //       JSON.stringify(this.line_features)
    //     )
    //       this.startMap({ keep_loc_and_zoom: true });
    //   },
    //   deep: true,
    // },
    map_baselayer() {
      this.startMap({ keep_loc_and_zoom: true });
    },
    map_base_media() {
      this.startMap();
    },
    opened_pin_path() {
      if (this.opened_pin_path) this.openFeature(this.opened_pin_path);
      else this.closePopup();
    },
  },
  computed: {},
  methods: {
    startMap({ keep_loc_and_zoom = false } = {}) {
      let zoom = this.constrainVal(
        this.start_zoom,
        this.min_zoom,
        this.max_zoom
      );
      let center;

      if (this.start_coords?.longitude && this.start_coords?.latitude)
        center = [this.start_coords.longitude, this.start_coords.latitude];
      else if (
        this.pins &&
        this.pins.length > 0 &&
        this.pins[0] &&
        this.pins[0].longitude &&
        this.pins[0].latitude
      ) {
        center = [this.pins[0].longitude, this.pins[0].latitude];
      }

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
      this.view = view;

      this.map = new olMap({
        target: this.$refs.map,
        view: this.view,
        layers: [background_layer],
      });

      ////////////////////////////////////////////////////////////////////////// CREATE LINES

      this.line_features = this.createLineFeaturesFromLines();
      this.map.addLayer(
        new olVectorLayer({
          source: new olSourceVector({
            features: this.line_features,
            wrapX: false,
          }),
          style: (feature) => this.makeLineStyle(feature),
        })
      );

      ////////////////////////////////////////////////////////////////////////// CREATE PINS

      this.pin_features = this.createPointFeaturesFromPins();
      this.map.addLayer(
        new olVectorLayer({
          source: new olSourceVector({
            features: this.pin_features,
            wrapX: false,
          }),
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
              fill_color: "hsla(207, 78%, 53%, .7)",
            }),
        })
      );

      const fs_option = new olFullScreen();
      this.map.addControl(fs_option);

      ////////////////////////////////////////////////////////////////////////// SCALELINE

      if (this.show_scale) {
        const scale_line = new olScaleLine({
          units: "metric",
        });
        this.map.addControl(scale_line);
      }

      ////////////////////////////////////////////////////////////////////////// SEARCH FIELD

      let lang = "fr-FR";
      if (this.$i18n.locale === "en") lang = "en-US";

      const geocoder = new Geocoder("nominatim", {
        provider: "osm",
        //key: '__some_key__',
        lang,
        placeholder: this.$t("search_for_a_place"),
        // targetType: "text-input",
        limit: 5,
        keepOpen: false,
        preventDefault: true,
      });
      this.map.addControl(geocoder);
      geocoder.on("addresschosen", async (evt) => {
        this.closePopup();

        await this.$nextTick();

        if (evt.place?.lon && evt.place?.lat) {
          this.clicked_location.latitude = +evt.place.lat;
          this.clicked_location.longitude = +evt.place.lon;
          const coordinate = [
            this.clicked_location.longitude,
            this.clicked_location.latitude,
          ];

          this.popup_message = evt.address.formatted;

          this.overlay.setPosition(coordinate);

          this.navigateTo({
            center: [+evt.place.lon, +evt.place.lat],
          });
          // this.map.getView().fit(evt.place.bbox);
        }
      });

      ////////////////////////////////////////////////////////////////////////// OVERLAYS

      this.overlay = new olOverlay({
        element: this.$refs.popUp,
        autoPan: false,
      });
      this.map.addOverlay(this.overlay);

      ////////////////////////////////////////////////////////////////////////// MAP OR FEATURE CLICK

      let feature_selected = null;
      this.map.on("pointermove", (event) => {
        if (feature_selected !== null) {
          feature_selected.setStyle(undefined);
          feature_selected = null;
        }

        this.map.forEachFeatureAtPixel(event.pixel, (f) => {
          feature_selected = f;
          // const selectStyle = this.makePointStyle({});
          // selectStyle.getFill().setColor(f.get("COLOR") || "#eeeeee");
          // f.setStyle(selectStyle);
          // return true;
        });
      });

      this.map.on("moveend", () => {
        this.current_zoom = this.roundToDec(this.map.getView().getZoom());
        this.current_view = this.map.getView().getCenter();
      });

      this.map.on("singleclick", async (event) => {
        this.closePopup();
        await this.$nextTick();

        const feature = this.map.getFeaturesAtPixel(event.pixel)[0];
        let [longitude, latitude] = event.coordinate;
        longitude = this.roundToDec(longitude, 6);
        latitude = this.roundToDec(latitude, 6);

        if (!feature) {
          this.$emit("newPositionClicked", {
            longitude,
            latitude,
            zoom: this.current_zoom,
          });
          this.$eventHub.$emit("publication.map.click", {
            longitude,
            latitude,
          });
          this.mouse_feature
            .getGeometry()
            .setCoordinates([longitude, latitude]);

          this.overlay.setPosition([longitude, latitude]);
          this.clicked_location.longitude = longitude;
          this.clicked_location.latitude = latitude;
        } else {
          const path = feature.get("path");
          this.openPin(path);
        }
      });
    },
    createViewAndBackgroundLayer({ center, zoom }) {
      let view, background_layer;

      if (this.map_mode === "image") {
        if (!this.map_base_media)
          this.$alertify.delay(4000).error("missing base image");

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

        view = new olView({
          projection: projection,
          center,
          zoom,
          maxZoom: 8,
        });
        background_layer = new olImageLayer({
          source: new olStatic({
            attributions,
            url: img_src,
            projection,
            imageExtent: extent,
          }),
        });
      } else {
        center = center || [5.39057449011251, 43.310173305629576];

        view = new olView({
          center,
          zoom,
          minZoom: this.min_zoom,
          maxZoom: this.max_zoom,
        });
        const source = this.createSource(this.map_baselayer);
        background_layer = new olTileLayer({
          source,
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
          url: "https://wxs.ign.fr/decouverte/geoportail/wmts",
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
    createPointFeaturesFromPins() {
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
            feature_cont.path = pin.path;
            if (pin.color) feature_cont.fill_color = pin.color;
            // if (pin.module) feature_cont.module = pin.module;
            if (pin.label) feature_cont.label = pin.label;
            if (pin.pin_preview) feature_cont.pin_preview = pin.pin_preview;
            if (pin.pin_preview_src)
              feature_cont.pin_preview_src = pin.pin_preview_src;
            if (pin.first_media_thumb)
              feature_cont.first_media_thumb = pin.first_media_thumb;
            features.push(new olFeature(feature_cont));
          });
      }
      // return features;
      return features;
    },
    createLineFeaturesFromLines() {
      let features = [];
      if (this.lines && Object.keys(this.lines).length > 0) {
        // const lines = this.pins.reduce((acc, pin) => {
        //   if (pin.belongs_to_view) {
        //   }
        //   if (pin?.longitude && pin?.latitude)
        //     acc.push([pin.longitude, pin.latitude]);
        //   return acc;
        // }, {});
        Object.values(this.lines).map(({ color, coordinates }) => {
          const feature_cont = {
            geometry: new olLineString(coordinates),
            name: "Path",
          };
          feature_cont.stroke_color = color;
          features.push(new olFeature(feature_cont));
        });
      }
      return features;
    },
    makePointStyle({
      feature,
      resolution,
      fill_color = "hsla(36, 96%, 50%, .7)",
    }) {
      // see https://openlayers.org/en/latest/examples/vector-labels.html
      resolution;
      let style = {};
      if (feature?.get("label")) {
        const _fs = {
          italic: "normal",
          weight: "500",
          size: "14px",
          height: 1.2,
          family: "Fira Sans",
        };

        style.text = new olText({
          fill: new olFill({ color: "#000" }),
          // stroke: new olStroke({ color: "#fff" }),
          // font: "bold 48px serif",
          font:
            _fs.italic +
            " " +
            _fs.weight +
            " " +
            _fs.size +
            "/" +
            _fs.height +
            " " +
            _fs.family,
          text: "" + feature.get("label"),
          textAlign: "center",
          textBaseline: "bottom",
          offsetY: -9,
        });
      }
      if (feature?.get("fill_color")) {
        fill_color = feature.get("fill_color");
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
      } else {
        style.image = new olCircleStyle({
          radius: 8,
          fill: new olFill({ color: fill_color }),
          stroke: new olStroke({ color: "#232e4a", width: 1 }),
        });
      }

      return new olStyle(style);
    },
    makeLineStyle(feature) {
      const style = {
        stroke: new olStroke({
          color: feature.get("stroke_color"),
          width: 3,
        }),
      };
      return new olStyle(style);
    },
    resetClickedLocation() {
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
      this.view.animate({
        center,
        zoom,
      });
    },
    openPin(path) {
      this.$emit("update:opened_pin_path", path);
    },
    openFeature(path) {
      const feature = this.pin_features.find((f) => f.get("path") === path);
      const pin = this.pins.find((p) => p.path === path);
      if (!feature) return "no_feature_found";

      this.resetClickedLocation();

      const coordinates = feature.getGeometry().getCoordinates();
      this.clicked_location.module = pin?.module;
      this.overlay.setPosition(coordinates);
      this.clicked_location.longitude = coordinates[0];
      this.clicked_location.latitude = coordinates[1];
      this.navigateTo({
        center: [
          this.clicked_location.longitude,
          this.clicked_location.latitude,
        ],
      });
    },
    closePopup() {
      this.resetClickedLocation();
      if (this.opened_pin_path) this.$emit("update:opened_pin_path", undefined);

      this.overlay.setPosition(undefined);
      if (this.$refs.closePopup) this.$refs.closePopup.blur();

      return false;
    },
    toggleDraw(type) {
      this.endDraw();
      if (this.current_draw_mode === type || !type) {
        this.current_draw_mode = undefined;
      } else {
        this.current_draw_mode = type;
        this.startDraw({ type });
      }
    },
    startDraw({ type }) {
      const source = new olSourceVector({ wrapX: false });
      this.map.addLayer(
        new olVectorLayer({
          source,
        })
      );

      this.map_modify = new olModify({ source });
      this.map.addInteraction(this.map_modify);

      this.map_draw = new olDraw({
        source,
        type,
      });
      this.map.addInteraction(this.map_draw);

      this.map_snap = new olSnap({ source });
      this.map.addInteraction(this.map_snap);
    },
    saveDrawings() {
      // var features = yourLayer.getSource().getFeatures();
      // var newForm = new ol.format.GeoJSON();
      // var featColl = newForm.writeFeaturesObject(features);
    },
    endDraw() {
      this.map.removeInteraction(this.map_modify);
      this.map.removeInteraction(this.map_draw);
      this.map.removeInteraction(this.map_snap);
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
  background-color: var(--c-gris);
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

  ::v-deep {
    .ol-geocoder {
      .gcd-gl-btn {
        height: 1.375em;
        width: 1.375em;
      }
      .gcd-gl-input {
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
    }
    .ol-scale-line {
      bottom: calc(var(--spacing) / 1);
      left: calc(var(--spacing) / 1);

      backdrop-filter: blur(2px);
      // background: rgba(255, 255, 255, 0.5);
      background: transparent;

      padding: 0;
      border-radius: 0;
      margin: 0;
    }
  }
}
._popup {
  position: absolute;
  bottom: 11px;
  left: -48px;
  min-width: 280px;

  font-size: var(--sl-font-size-normal);

  &::before,
  &::after {
    top: 100%;

    border: solid transparent;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;

    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }
  &::before {
    border-top-color: black;
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
  top: calc(var(--spacing) / -2);
  right: calc(var(--spacing) / -2);
  padding: calc(var(--spacing) / 1);
}

._pinContent {
  position: relative;
  // border-radius: var(--panel-radius);
  overflow: hidden;
  min-height: 2em;

  ::v-deep ._publicationModule[data-type="text"] {
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2) 0;
  }
}

._popupMessage {
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
}

._leftTopMenu {
  position: absolute;
  top: 6.5em;
  left: 0.5em;

  button {
    background: white;
    display: block;
    margin: 1px;
    padding: 0;
    color: var(--ol-subtle-foreground-color);
    font-weight: bold;
    text-decoration: none;
    font-size: inherit;
    text-align: center;
    height: 1.375em;
    width: 1.375em;
    line-height: 0.4em;
    background-color: var(--ol-background-color);
    border: none;
    border-radius: 2px;
  }
}
</style>
<style lang="scss"></style>
