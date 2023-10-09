<template>
  <div>
    <div class="m_fields--content">
      <!-- <sl-input v-sl-model="location" size="medium" name="text" type="text" /> -->
      <div class="u-sameRow _latLong">
        <div class="">
          <DLabel :str="$t('latitude')" />
          <div class="u-inputGroup">
            <input
              :placeholder="$t('latitude')"
              v-model="latitude"
              size="small"
              type="text"
              :disabled="!edit_mode"
              help-text="Latitude, par exemple : 64.138 ou 64° 8' 16.8&quot; N"
            />
            <span class="u-suffix">°</span>
          </div>
        </div>
        <div class="">
          <DLabel :str="$t('longitude')" />
          <div class="u-inputGroup">
            <input
              :placeholder="$t('longitude')"
              v-model="longitude"
              size="small"
              type="text"
              :disabled="!edit_mode"
              help-text="Longitude, par exemple : -21.877 ou 21° 52' 37.199&quot; O"
            />
            <span class="u-suffix">°</span>
          </div>
        </div>
      </div>
      <div class="">
        <DLabel :str="$t('zoom')" />
        <div class="">
          <input
            :placeholder="$t('zoom')"
            v-model="zoom"
            size="small"
            type="text"
            :disabled="!edit_mode"
            help-text="Niveau de zoom"
          />
        </div>
      </div>

      <button
        type="button"
        class="u-buttonLink"
        @click="currentPosition"
        v-if="edit_mode"
        :loading="is_looking_for_gps_coords"
      >
        <!-- :disabled="$root.state.is_electron" -->
        {{ $t("current_position") }}
      </button>

      <br />

      <!-- <button
              type="button"
              class="u-button u-button_small"
              @click="pick_on_map = !pick_on_map"
              :active="pick_on_map"
              v-if="edit_mode"
            >
              {{ $t("pick_on_map") }}
            </button> -->

      <sl-alert
        type="warning"
        :open="error_message"
        @sl-after-hide="error_message = false"
        closable
      >
        <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
        <span v-html="error_message" />
      </sl-alert>

      <!-- v-if="pick_on_map" -->
      <DisplayOnMap
        :start_coords="start_coords"
        :pins="center_pin"
        :start_zoom="start_zoom"
        @newPositionClicked="newPositionClicked"
      />
    </div>
  </div>
</template>
<script>
// const convertDMSToDD = (dms) => {
//   // eslint-disable-next-line
//   let parts = dms.split(/[^\d+(\,\d+)\d+(\.\d+)?\w]+/);
//   let degrees = parseFloat(parts[0]);
//   let minutes = parseFloat(parts[1]);
//   let seconds = parseFloat(parts[2].replace(",", "."));
//   let direction = parts[3];

//   // console.log("degrees: " + degrees);
//   // console.log("minutes: " + minutes);
//   // console.log("seconds: " + seconds);
//   // console.log("direction: " + direction);

//   let dd = degrees + minutes / 60 + seconds / (60 * 60);

//   if (direction == "S" || direction == "W" || direction === "O") {
//     dd = dd * -1;
//   } // Don't do anything for N or E
//   return dd;
// };

export default {
  props: {
    start_coords: [Boolean, Object],
    start_zoom: [Boolean, Number],
    edit_mode: Boolean,
  },
  components: {
    DisplayOnMap: () => import("@/adc-core/fields/DisplayOnMap.vue"),
  },
  data() {
    return {
      raw_mode: false,

      longitude: "",
      latitude: "",
      zoom: 0,

      degrees: "",
      minutes: "",
      seconds: "",

      value: "",

      // pick_on_map: true,

      is_looking_for_gps_coords: false,
      error_message: false,
    };
  },
  created() {
    if (this.start_coords?.longitude && this.start_coords?.latitude) {
      this.longitude = this.start_coords.longitude;
      this.latitude = this.start_coords.latitude;
    }
    if (this.start_zoom) {
      this.zoom = this.start_zoom;
    }
  },
  mounted() {
    // this.$el.addEventListener("sl-hide", (event) => {
    //   if (event.target.tagName === "SL-ALERT") event.stopPropagation();
    // });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    center_pin() {
      return [
        {
          longitude: this.longitude,
          latitude: this.latitude,
        },
      ];
    },
    // longlat() {
    //   if (!this.longitude || !this.latitude) return undefined;
    //   let longitude = this.longitude;
    //   let latitude = this.latitude;
    //   if (typeof longitude === "string" && longitude.includes("°"))
    //     longitude = convertDMSToDD(longitude);
    //   if (typeof latitude === "string" && latitude.includes("°"))
    //     latitude = convertDMSToDD(latitude);
    //   return {
    //     longitude,
    //     latitude,
    //   };
    // },
  },
  methods: {
    currentPosition() {
      this.is_looking_for_gps_coords = true;

      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };

      const success = (pos) => {
        var crd = pos.coords;

        this.is_looking_for_gps_coords = false;

        this.updateLongLatZoom({
          longitude: crd.longitude,
          latitude: crd.latitude,
        });
        // console.log("Votre position actuelle est :");
        // console.log(`Latitude : ${crd.latitude}`);
        // console.log(`Longitude : ${crd.longitude}`);
        // console.log(`La précision est de ${crd.accuracy} mètres.`);
      };

      const error = (err) => {
        this.error_message = `Échec de la localisation de votre appareil.<br>(${err.code}): ${err.message}`;
        this.is_looking_for_gps_coords = false;
      };

      // not working in Electron
      // use something like http://ip-api.com/json https://www.reddit.com/r/electronjs/comments/hbxick/comment/fvq96v6/?utm_source=reddit&utm_medium=web2x&context=3
      // after prompt with user ?
      navigator.geolocation.getCurrentPosition(success, error, options);
    },
    newPositionClicked({ longitude, latitude, zoom }) {
      this.updateLongLatZoom({ longitude, latitude, zoom });
      // this.pick_on_map = false;
    },
    updateLongLatZoom({ longitude, latitude, zoom }) {
      this.longitude = longitude;
      this.latitude = latitude;
      if (zoom) this.zoom = zoom;

      this.$emit("update", {
        location: {
          longitude: this.longitude,
          latitude: this.latitude,
        },
        zoom: this.zoom,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._nowButton {
  margin-top: var(--sl-spacing-xx-small);
}

._btnRow {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 2) 0;
}

._latLong {
  justify-content: stretch;

  > * {
    flex: 1 1 0;
  }
}
</style>
