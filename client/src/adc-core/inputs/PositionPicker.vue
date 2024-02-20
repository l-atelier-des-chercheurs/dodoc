<template>
  <div>
    <div class="m_fields--content">
      <DisplayOnMap
        v-if="pins.length > 0 || edit_mode"
        :key="map_key"
        :pins="pins"
        :start_zoom="zoom"
        @newPositionClicked="newPositionClicked"
        @zoomUpdated="zoomUpdated"
      />
      <div v-else class="u-instructions">
        {{ $t("no_position") }}
      </div>

      <div class="">
        <EditBtn
          v-if="can_edit && !edit_mode"
          :is_unfolded="true"
          @click="enableEditMode"
        />
      </div>

      <button
        type="button"
        class="u-buttonLink"
        v-if="edit_mode"
        @click="currentPosition"
        :loading="is_looking_for_gps_coords"
      >
        <!-- :disabled="$root.state.is_electron" -->
        {{ $t("current_position") }}
      </button>

      <sl-alert
        type="warning"
        :open="error_message"
        @sl-after-hide="error_message = false"
        closable
      >
        <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
        <span v-html="error_message" />
      </sl-alert>

      <div class="u-sameRow _latLong" v-if="pins.length > 0 || edit_mode">
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
        <div class="">
          <DLabel :str="$t('zoom')" />
          <div class="u-inputGroup">
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
      </div>

      <div class="u-instructions" v-if="edit_mode">
        {{ $t("click_on_map_to_repick_location_for_media") }}
      </div>

      <template v-if="can_edit">
        <div class="_footer" v-if="edit_mode">
          <SaveCancelButtons
            class="_scb"
            :allow_save="allow_save"
            @save="updateLongLatZoom"
            @cancel="cancel"
          />
        </div>
      </template>

      <!-- <div class="">
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
      </div> -->
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
    field_name: String,
    content: Object,
    path: String,
    can_edit: Boolean,
  },
  components: {
    DisplayOnMap: () => import("@/adc-core/fields/DisplayOnMap.vue"),
  },
  data() {
    return {
      // raw_mode: false,
      edit_mode: false,

      longitude: "",
      latitude: "",
      zoom: 0,

      // degrees: "",
      // minutes: "",
      // seconds: "",

      is_looking_for_gps_coords: false,
      error_message: false,
    };
  },
  created() {
    this.initLongLatZoom();
  },
  mounted() {
    // this.$el.addEventListener("sl-hide", (event) => {
    //   if (event.target.tagName === "SL-ALERT") event.stopPropagation();
    // });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    allow_save() {
      return (
        this.longitude !== this.content?.longitude ||
        this.latitude !== this.content?.latitude ||
        this.zoom !== this.content?.zoom
      );
    },
    pins() {
      if (this.content) {
        const { longitude, latitude } = this.content;
        if (longitude && latitude) return [{ longitude, latitude }];
      }
      return [];
    },
    map_key() {
      if (this.content) return JSON.stringify(this.content);
      return "k";
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
    enableEditMode() {
      this.edit_mode = true;
    },

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

      // not working in Electron
      // use something like http://ip-api.com/json https://www.reddit.com/r/electronjs/comments/hbxick/comment/fvq96v6/?utm_source=reddit&utm_medium=web2x&context=3
      // after prompt with user ?
      navigator.geolocation.getCurrentPosition(success, error, options);
    },
    newPositionClicked({ longitude, latitude, zoom }) {
      this.longitude = longitude;
      this.latitude = latitude;
      this.zoom = zoom;
    },
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    async updateLongLatZoom() {
      const new_meta = {
        [this.field_name]: {
          longitude: this.longitude,
          latitude: this.latitude,
          zoom: this.zoom,
        },
      };

      await this.$api.updateMeta({
        path: this.path,
        new_meta,
      });

      this.edit_mode = false;
    },
    initLongLatZoom() {
      if (this.content?.longitude && this.content?.latitude) {
        this.longitude = this.content.longitude;
        this.latitude = this.content.latitude;
      }
      this.zoom = this.content?.zoom || 2;
    },
    cancel() {
      this.initLongLatZoom();
      this.edit_mode = false;
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
