<template>
  <div class="_positionPicker">
    <DLabel
      v-if="label"
      class="_label"
      :str="label"
      :instructions="can_edit ? instructions : ''"
    />

    <div class="">
      <div v-if="edit_mode">
        <span class="u-instructions">
          {{ $t("click_on_map_to_repick_location") }}
        </span>
        <button type="button" class="u-buttonLink" @click="removePosition">
          {{ $t("cancel_position") }}
        </button>
      </div>

      <template v-if="edit_mode">
        <SaveCancelButtons
          class="_scb"
          :allow_save="allow_save"
          @save="updateLongLatZoom"
          @cancel="cancel"
        />
      </template>

      <DisplayOnMap
        v-if="pins.length > 0 || edit_mode"
        :key="map_key"
        :pins="pins"
        :start_zoom="zoom"
        :can_click="edit_mode"
        @newPositionClicked="newPositionClicked"
        @zoomUpdated="zoomUpdated"
      />
      <div v-else class="u-instructions">
        {{ $t("no_position") }}
      </div>
      <div v-if="!edit_mode && can_edit" class="_editBtn">
        <EditBtn
          :label_position="'left'"
          :btn_type="pins.length === 0 ? 'add' : 'edit'"
          :is_unfolded="pins.length === 0"
          @click="enableEditMode"
        />
      </div>
      <details v-if="pins.length > 0 || edit_mode">
        <summary class="u-buttonLink">
          {{ $t("more_informations") }}
        </summary>
        <div class="u-sameRow">
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
      </details>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    field_name: String,
    label: {
      type: String,
      default: "",
    },
    instructions: {
      type: String,
      default: "",
    },
    content: Object,
    path: String,
    can_edit: Boolean,
  },
  components: {
    DisplayOnMap: () => import("@/adc-core/fields/DisplayOnMap.vue"),
  },
  data() {
    return {
      edit_mode: false,
      longitude: "",
      latitude: "",
      zoom: 0,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    content: {
      handler() {
        this.initLongLatZoom();
      },
      deep: true,
      immediate: true,
    },
  },
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
  },
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    removePosition() {
      this.longitude = undefined;
      this.latitude = undefined;
      this.zoom = undefined;
      this.updateLongLatZoom();
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
      let location_infos = {};

      if (this.longitude || this.latitude || this.zoom)
        location_infos = {
          longitude: this.longitude,
          latitude: this.latitude,
          zoom: this.zoom,
        };

      this.$emit("newPosition", location_infos);

      if (this.path) {
        const new_meta = {
          [this.field_name]: location_infos,
        };
        await this.$api.updateMeta({
          path: this.path,
          new_meta,
        });
      }

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
._positionPicker {
  position: relative;
  min-height: 3rem;
}
._editBtn {
  position: absolute;
  top: 0;
  right: 0;
  // margin: calc(var(--spacing) / 4);
}
._footer {
  margin-top: calc(var(--spacing) / 4);
}
._scb {
  justify-content: center;
  margin: calc(var(--spacing) / 4) auto;
}
</style>
