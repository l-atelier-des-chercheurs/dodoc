<template>
  <div>
    <div class="m_fields--content">
      <template v-if="!raw_mode">
        <!-- <sl-input v-sl-model="location" size="medium" name="text" type="text" /> -->
        <template v-if="format === 'gps'">
          <div class="">
            <DLabel :str="$t('latitude')" />
            <div class="u-inputGroup">
              <input
                :placeholder="$t('latitude')"
                v-model="latitude"
                size="medium"
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
                size="medium"
                type="text"
                :disabled="!edit_mode"
                help-text="Longitude, par exemple : -21.877 ou 21° 52' 37.199&quot; O"
              />
              <span class="u-suffix">°</span>
            </div>
          </div>

          <button
            type="button"
            class="u-buttonLink"
            @click="currentPosition"
            v-if="format === 'gps' && edit_mode"
            :loading="is_looking_for_gps_coords"
          >
            <!-- :disabled="$root.state.is_electron" -->
            {{ $t("current_position") }}
          </button>
          <!-- <button
              type="button"
              class="u-button u-button_small"
              @click="pick_on_map = !pick_on_map"
              :active="pick_on_map"
              v-if="format === 'gps' && edit_mode"
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
            :pins="longlat ? [longlat] : []"
            @newPosition="newPosition"
          />
        </template>
        <template v-else>
          <input v-model="value" size="medium" name="address" type="text" />
        </template>
      </template>
      <pre v-else>{{ location }}</pre>
    </div>
  </div>
</template>
<script>
const convertDMSToDD = (dms) => {
  // eslint-disable-next-line
  let parts = dms.split(/[^\d+(\,\d+)\d+(\.\d+)?\w]+/);
  let degrees = parseFloat(parts[0]);
  let minutes = parseFloat(parts[1]);
  let seconds = parseFloat(parts[2].replace(",", "."));
  let direction = parts[3];

  // console.log("degrees: " + degrees);
  // console.log("minutes: " + minutes);
  // console.log("seconds: " + seconds);
  // console.log("direction: " + direction);

  let dd = degrees + minutes / 60 + seconds / (60 * 60);

  if (direction == "S" || direction == "W" || direction === "O") {
    dd = dd * -1;
  } // Don't do anything for N or E
  return dd;
};

export default {
  props: {
    format: String,
    start_value: [Number, String],
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
    if (this.start_value) {
      const start_value = this.start_value.toString();
      if (this.format === "gps") {
        if (start_value.split(" ").length > 0) {
          const long = start_value.split(" ")[0];
          if (long && long !== "undefined") this.longitude = long;
          const lat = start_value.split(" ")[1];
          if (lat && lat !== "undefined") this.latitude = lat;
        }
      } else this.value = start_value;
    }
  },
  mounted() {
    // this.$el.addEventListener("sl-hide", (event) => {
    //   if (event.target.tagName === "SL-ALERT") event.stopPropagation();
    // });
  },
  beforeDestroy() {},
  watch: {
    location() {
      this.$emit("update", this.location);
    },
    value() {
      this.$emit("update", this.value);
    },
  },
  computed: {
    location() {
      if (!this.longlat) return "";
      let long = this.longlat.longitude;
      let lat = this.longlat.latitude;
      return `${long} ${lat}`;
    },
    longlat() {
      if (!this.longitude || !this.latitude) return undefined;

      let longitude = this.longitude;
      let latitude = this.latitude;

      if (typeof longitude === "string" && longitude.includes("°"))
        longitude = convertDMSToDD(longitude);
      if (typeof latitude === "string" && latitude.includes("°"))
        latitude = convertDMSToDD(latitude);

      return {
        longitude,
        latitude,
      };
    },
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

        this.longitude = crd.longitude;
        this.latitude = crd.latitude;

        // console.log("Votre position actuelle est :");
        // console.log(`Latitude : ${crd.latitude}`);
        // console.log(`Longitude : ${crd.longitude}`);
        // console.log(`La précision est de ${crd.accuracy} mètres.`);
      };

      const error = (err) => {
        this.error_message = `Échec de la localisation de votre appareil.<br>(${err.code}): ${err.message}`;
        this.is_looking_for_gps_coords = false;
      };

      navigator.geolocation.getCurrentPosition(success, error, options);
    },
    newPosition({ longitude, latitude }) {
      this.longitude = longitude;
      this.latitude = latitude;
      // this.pick_on_map = false;
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
</style>
