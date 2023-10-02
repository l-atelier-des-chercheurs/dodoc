<template>
  <div
    class="m_displayOnMap"
    :class="{
      'is--small': is_small,
    }"
  >
    <div id="map" class="map" />

    <div id="mouse-position"></div>
    <div class="_popup" v-if="mouse_coords || pin_infos || pin_coord">
      <sl-button
        class="_popup--close"
        size="small"
        @click="
          pin_coord = false;
          pin_infos = false;
          mouse_coords = false;
        "
      >
        <sl-icon name="x-circle" />
      </sl-button>

      <div v-if="mouse_coords">
        <div class="">
          <b>{{ $t("mouse_position") }}</b>
        </div>
        <span class="complementaryText"> {{ $t("latitude") }} = </span>
        {{ mouse_coords[1] }}°
        <span class="complementaryText"> {{ $t("longitude") }} = </span>
        {{ mouse_coords[0] }}°

        <div v-if="$listeners.newPosition" class="">
          <sl-button
            size="small"
            type="success"
            @click="
              $emit('newPosition', {
                longitude: mouse_coords[0],
                latitude: mouse_coords[1],
              });
              mouse_coords = false;
            "
            pill
          >
            {{ $t("submit") }}
          </sl-button>
        </div>
      </div>
      <div v-if="pin_coord">
        <div>
          <b>{{ $t("pin_position") }}</b>
        </div>

        <span class="complementaryText">{{ $t("latitude") }} = </span>
        {{ pin_coord.coordinate.latitude }}°
        <span class="complementaryText">{{ $t("longitude") }} = </span>
        {{ pin_coord.coordinate.longitude }}°
      </div>
      <div v-if="pin_infos">
        <div>
          <b>{{ $t("pin_infos") }}</b>
        </div>
        <span class="complementaryText">{{ $t("index") }} = </span>
        {{ pin_infos.index }}
        <br />
        <span class="complementaryText" v-if="pin_infos.label"
          >{{ $t("label") }} =
        </span>
        {{ pin_infos.label }}
      </div>
    </div>
  </div>
</template>
<script>
import OSM from "ol/source/OSM.js";
import olMap from "ol/Map";
import olView from "ol/View";
import olFeature from "ol/Feature";
import olPoint from "ol/geom/Point";
import olTileLayer from "ol/layer/Tile";
import olVectorLayer from "ol/layer/Vector";
import olSourceVector from "ol/source/Vector";
import * as olProj from "ol/proj";
// incompatibility error ? https://github.com/jonataswalker/ol-geocoder/issues/270
// TODO FIX later
// import Geocoder from "ol-geocoder";

import olStyle from "ol/style/Style";
import olCircleStyle from "ol/style/Circle";
import olFill from "ol/style/Fill";
import olStroke from "ol/style/Stroke";
import olText from "ol/style/Text";

export default {
  name: "DisplayOnMap",
  props: {
    pins: [Boolean, Array],
    start_coords: {
      type: [Boolean, Array],
    },
    start_zoom: {
      type: [Boolean, Number],
      default: 9,
    },
    is_small: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {
      pin_infos: false,
      pin_coord: false,
      ol_features: undefined,

      mouse_coords: false,

      map: undefined,
    };
  },
  i18n: {
    messages: {
      fr: {
        mouse_position: "Position de la balise",
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
        // this.map;
        // const features = this.createFeaturesFromPins();
        // this.ol_features = new olSourceVector({
        //   features,
        //   wrapX: false,
        // });
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    startMap() {
      let zoom = this.start_zoom;
      let center = [5.39057449011251, 43.310173305629576];

      if (this.start_coords) center = this.start_coords;
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

      // const { Circle, Fill, Stroke, Style, Text } = ol.style;
      // const Map = ol.Map;
      // const Overlay = ol.Overlay;
      // const View = ol.View;
      // const { Draw } = ol.interaction;
      olProj.useGeographic();

      const features = this.createFeaturesFromPins();
      this.ol_features = new olSourceVector({
        features,
        wrapX: false,
      });

      let mouseFeature = new olFeature({
        geometry: new olPoint([undefined, undefined]),
      });

      this.view = new olView({
        center,
        zoom,
      });
      this.map = new olMap({
        // controls: defaultControls().extend([mousePositionControl]),
        target: "map",
        layers: [
          new olTileLayer({
            source: new OSM(),
          }),
          new olVectorLayer({
            source: this.ol_features,
            style: (feature, resolution) =>
              this.makePointStyle({
                feature,
                resolution,
              }),
          }),
          new olVectorLayer({
            source: new olSourceVector({
              features: [mouseFeature],
              wrapX: false,
            }),
            style: (feature, resolution) =>
              this.makePointStyle({
                feature,
                resolution,
                fill_color: "hsla(207, 78%, 53%, .7)",
              }),
          }),
        ],
        view: this.view,
      });

      // const geocoder = new Geocoder("nominatim", {
      //   provider: "osm",
      //   //key: '__some_key__',
      //   lang: "fr-FR",
      //   placeholder: this.$t("search_for_a_place"),
      //   targetType: "text-input",
      //   limit: 5,
      //   keepOpen: true,
      // });
      // this.map.addControl(geocoder);

      this.map.on("click", (event) => {
        const feature = this.map.getFeaturesAtPixel(event.pixel)[0];

        this.mouse_coords = false;
        this.pin_coord = false;
        this.pin_infos = false;

        if (!feature) {
          this.mouse_coords = event.coordinate;
          this.$eventHub.$emit("publication.map.click", this.mouse_coords);
          mouseFeature
            .getGeometry()
            .setCoordinates([event.coordinate[0], event.coordinate[1]]);
        } else {
          mouseFeature.getGeometry().setCoordinates([undefined, undefined]);

          const coordinate = feature.getGeometry().getCoordinates();
          this.$eventHub.$emit("publication.map.click", coordinate);

          this.pin_coord = {};
          this.$set(this.pin_coord, "coordinate", {
            longitude: coordinate[0],
            latitude: coordinate[1],
          });

          this.pin_infos = {};
          if (feature.get("label"))
            this.$set(this.pin_infos, "label", feature.get("label"));
          if (feature.get("index"))
            this.$set(this.pin_infos, "index", feature.get("index"));
          if (feature.get("content"))
            this.$set(this.pin_infos, "content", feature.get("content"));
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
    createFeaturesFromPins() {
      let features = [];
      if (this.pins && this.pins.length > 0) {
        this.pins.map((pin) => {
          if (!pin || !pin.longitude || !pin.latitude) return;

          let feature_cont = {
            geometry: new olPoint([pin.longitude, pin.latitude]),
          };
          feature_cont.index = pin.index;
          feature_cont.id = pin.$path;
          if (pin.label) feature_cont.label = pin.label;
          if (pin.content) feature_cont.content = pin.content;
          if (pin.color) feature_cont.fill_color = pin.color;
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
      if (feature.get("label")) {
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
      if (feature.get("fill_color")) {
        fill_color = feature.get("fill_color");
      }

      style.image = new olCircleStyle({
        radius: 8,
        fill: new olFill({ color: fill_color }),
        stroke: new olStroke({ color: "#232e4a", width: 2 }),
      });

      return new olStyle(style);
    },
    navigateTo({ center, zoom = this.start_zoom }) {
      this.view.animate({
        center,
        zoom,
        // duration: 2000,
      });
    },
    openPin(path) {
      const _pin = this.pins.find((p) => p.path === path);
      if (!_pin) return;

      const { latitude, longitude } = _pin;
      this.navigateTo({
        center: [longitude, latitude],
      });
      // TODO highlight pin in map (one at a time)
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
</style>
