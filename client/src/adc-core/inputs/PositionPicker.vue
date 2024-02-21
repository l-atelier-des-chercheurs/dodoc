<template>
  <div>
    <div class="m_fields--content">
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

      <div class="u-instructions" v-if="edit_mode">
        {{ $t("click_on_map_to_repick_location_for_media") }}
      </div>

      <template v-if="can_edit">
        <div class="_footer">
          <EditBtn
            v-if="!edit_mode"
            :is_unfolded="true"
            @click="enableEditMode"
          />
          <template v-else>
            <SaveCancelButtons
              class="_scb"
              :allow_save="allow_save"
              @save="updateLongLatZoom"
              @cancel="cancel"
            />
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
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
._footer {
  margin-top: calc(var(--spacing) / 4);
}
</style>
