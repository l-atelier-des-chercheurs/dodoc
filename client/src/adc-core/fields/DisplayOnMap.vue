<template>
  <div
    class="m_displayOnMap"
    :class="{
      'is--small': is_small,
    }"
  >
    <div class="map" ref="map" />

    <div ref="popUp" class="ol-popup">
      <div :key="clicked_location.latitude + '-' + clicked_location.longitude">
        <button
          type="button"
          class="u-button u-buttonu-button_icon ol-popup-closer"
          ref="closePopup"
          @click="closePopup"
        >
          <b-icon icon="x-circle" />
        </button>
        <div v-if="popup_message" v-html="popup_message" />

        <div v-if="clicked_location.file" :key="clicked_location.file.$path">
          <MediaContent
            :file="clicked_location.file"
            :is_draggable="false"
            :resolution="1600"
            :context="'full'"
          />
        </div>

        <div class="u-instructions">
          <small>
            <span class="complementaryText"> {{ $t("latitude") }} = </span>
            {{ clicked_location.latitude }}°
            <br />
            <span class="complementaryText"> {{ $t("longitude") }} = </span>
            {{ clicked_location.longitude }}°
          </small>
        </div>
        <slot name="popup_footer" v-if="!clicked_location.file" />
      </div>
    </div>
    <div id="mouse-position" />
  </div>
</template>
<script>
import olSourceOSM from "ol/source/OSM.js";
import olMap from "ol/Map";
import olView from "ol/View";
import olFeature from "ol/Feature";
import olPoint from "ol/geom/Point";
import olLineString from "ol/geom/LineString";
import olTileLayer from "ol/layer/Tile";
import olVectorLayer from "ol/layer/Vector";
import olSourceVector from "ol/source/Vector";
import * as olProj from "ol/proj";
import olOverlay from "ol/Overlay.js";

// incompatibility error ? https://github.com/jonataswalker/ol-geocoder/issues/270
// TODO FIX later

import Geocoder from "ol-geocoder";
import "ol-geocoder/dist/ol-geocoder.min.css";

import olStyle from "ol/style/Style";
import olCircleStyle from "ol/style/Circle";
import olFill from "ol/style/Fill";
import olStroke from "ol/style/Stroke";
import olText from "ol/style/Text";

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
      default: 9,
    },
    is_small: {
      type: Boolean,
      default: true,
    },
    can_add_media_to_point: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      pin_infos: false,
      pin_coord: false,
      overlay: undefined,

      popup_message: undefined,
      clicked_location: {
        latitude: undefined,
        longitude: undefined,
        file: undefined,
      },

      pin_features: undefined,
      mouse_feature: undefined,

      current_zoom: undefined,
      current_view: undefined,

      min_zoom: 3,
      max_zoom: 22,

      mouse_coords: false,

      map: undefined,
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
        this.startMap();
      },
      deep: true,
    },
    lines: {
      handler() {
        this.startMap();
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    startMap() {
      let zoom =
        this.constrainVal(this.start_zoom, this.min_zoom, this.max_zoom) || 9;
      let center = [5.39057449011251, 43.310173305629576];

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
        zoom = this.map.getView().getZoom();
        center = this.map.getView().getCenter();

        this.map.setTarget(null);
        this.map = null;
      }

      olProj.useGeographic();

      this.view = new olView({
        center,
        zoom,
        minZoom: this.min_zoom,
        maxZoom: this.max_zoom,
      });
      this.map = new olMap({
        target: this.$refs.map,
        layers: [
          new olTileLayer({
            source: new olSourceOSM({
              wrapX: false,
              noWrap: true,
            }),
          }),
        ],
        view: this.view,
      });

      this.map.addLayer(
        new olVectorLayer({
          source: new olSourceVector({
            features: this.createLineFeaturesFromLines(),
            wrapX: false,
          }),
          style: (feature) => this.makeLineStyle(feature),
        })
      );

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
        })
      );

      /////////////////////////////////////////////////////////////// MOUSE
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

      //////////////////////////////////////////////////// SEARCH FIELD

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
      geocoder.on("addresschosen", (evt) => {
        // const feature = evt.feature,
        //   address = evt.address;
        // content.innerHTML = "<p>" + address.formatted + "</p>";
        if (evt.place?.lon && evt.place?.lat) {
          // const coordinate = [2.214555195288306, 47.1857072668881];
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

      //////////////////////////////////////////////////// OVERLAYS

      this.overlay = new olOverlay({
        element: this.$refs.popUp,
        autoPan: false,
      });
      this.map.addOverlay(this.overlay);

      //////////////////////////////////////////////////// SEARCH FIELD

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

      this.current_zoom = zoom;
      this.current_view = center;
      this.map.on("moveend", () => {
        this.current_zoom = this.roundToDec(this.map.getView().getZoom());
        this.current_view = this.map.getView().getCenter();
      });

      this.map.on("singleclick", (event) => {
        this.closePopup();
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

      // function addInteraction() {
      //   draw = new Draw({
      //     source: source,
      //     type: "Point",
      //   });
      //   this.map.addInteraction(draw);
      // }
      // addInteraction();
    },
    createPointFeaturesFromPins() {
      let features = [];
      if (this.pins && this.pins.length > 0) {
        this.pins.map((pin) => {
          if (!pin || !pin.longitude || !pin.latitude) return;

          let feature_cont = {
            geometry: new olPoint([pin.longitude, pin.latitude]),
          };
          feature_cont.path = pin.path;
          if (pin.color) feature_cont.fill_color = pin.color;
          if (pin.file) feature_cont.file = pin.file;
          features.push(new olFeature(feature_cont));
        });
      }
      return features;
    },
    createLineFeaturesFromLines() {
      let features = [];
      if (this.lines && Object.keys(this.lines).length > 0) {
        // const lines = this.pins.reduce((acc, pin) => {
        //   if (pin.belongs_to_layer) {
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
          weight: "600",
          size: "14px",
          height: 1.2,
          family: "IBM Plex Mono",
        };

        style.text = new olText({
          fill: new olFill({ color: "#000" }),
          stroke: new olStroke({ color: "#fff" }),
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
          textAlign: "start",
          offsetX: 15,
        });
      }
      if (feature?.get("fill_color")) {
        fill_color = feature.get("fill_color");
      }

      style.image = new olCircleStyle({
        radius: 8,
        fill: new olFill({ color: fill_color }),
        stroke: new olStroke({ color: "#232e4a", width: 2 }),
      });

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
    navigateTo({ center, zoom = this.current_zoom }) {
      this.view.animate({
        center,
        zoom,
        // duration: 2000,
      });
    },
    openPin(path) {
      const _pin_index = this.pins.findIndex((p) => p.path === path);
      if (_pin_index === -1) return;
      this.openFeature(_pin_index);
    },
    openFeature(index) {
      const feature = this.pin_features[index];
      const coordinates = feature.getGeometry().getCoordinates();
      const f = feature.get("file");
      this.clicked_location.file = f || undefined;

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
      this.mouse_feature.getGeometry().setCoordinates([undefined, undefined]);

      this.overlay.setPosition(undefined);
      if (this.$refs.closePopup) this.$refs.closePopup.blur();
      this.clicked_location.longitude = undefined;
      this.clicked_location.latitude = undefined;
      this.clicked_location.file = undefined;
      this.popup_message = undefined;
      return false;
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

  flex: 1 1 320px;

  &.is--small {
    width: 600px;
    max-width: 100%;
    aspect-ratio: 1;
    border-radius: 4px;
    overflow: hidden;
    .map {
    }
  }
}
.map {
  width: 100%;
  height: 100%;
}
._popup {
  position: absolute;
  bottom: 0;
  left: 0;
  background: white;
  border-radius: 2px;

  margin: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  width: calc(100% - var(--spacing) * 2);
}
._popup--close {
  position: absolute;
  top: 0;
  right: 0;
  padding: calc(var(--spacing) / 2);
}

.ol-popup {
  position: absolute;
  bottom: 12px;
  left: -50px;
  min-width: 280px;

  border-radius: var(--panel-radius);
  box-shadow: var(--panel-shadows);
  padding: calc(var(--spacing) / 2);
  background: var(--panel-color);
  border: var(--panel-borders);

  overflow: hidden;
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
}
</style>
<style lang="scss">
.ol-geocoder .gcd-gl-btn {
  height: 1.375em;
  width: 1.375em;
}
.ol-geocoder .gcd-gl-input {
}
</style>
