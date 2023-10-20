<template>
  <div class="_mapModule">
    <!-- <label>
      <b>
        {{ index + 1 }}
      </b>
    </label> -->
    <div class="_mapModule--topRow" @click="togglePin">
      <div class="">
        <MediaContent
          class="_preview"
          v-if="firstMedia(mapmodule)"
          :file="firstMedia(mapmodule)"
          :resolution="220"
          :context="'preview'"
        />
      </div>
      <div class="_nameOfPin">
        <div>
          <template v-if="mapmodule.pin_name">
            {{ mapmodule.pin_name }}
          </template>
          <template v-else>
            <i>{{ $t("untitled") }}</i>
          </template>
        </div>

        <div>
          <button
            type="button"
            class="u-buttonLink"
            v-if="is_opened"
            @click.stop="show_details = !show_details"
          >
            {{ $t("more_informations") }}
          </button>
        </div>
      </div>

      <div class="_navToPin">
        <button type="button" class="u-button u-button_icon">
          <b-icon v-if="has_coordinates" icon="pin-map-fill" />
          <b-icon v-else icon="pin-map" />
        </button>
      </div>
    </div>

    <div v-if="show_details" class="_mapModule--content">
      <div class="u-spacingBottom">
        <TitleField
          :label="$t('name')"
          :field_name="'pin_name'"
          :content="mapmodule.pin_name || $t('untitled')"
          :path="mapmodule.$path"
          :required="false"
          :maxlength="20"
          :tag="'h4'"
          :can_edit="can_edit"
        />
      </div>

      <div class="u-spacingBottom">
        <TitleField
          :field_name="'pin_caption'"
          :label="$t('caption')"
          :content="mapmodule.pin_caption"
          :path="mapmodule.$path"
          :maxlength="1280"
          :input_type="'markdown'"
          :can_edit="can_edit"
        />
      </div>

      <div class="u-spacingBottom _latlon">
        <template v-if="has_coordinates">
          <DLabel :str="$t('latitude')" />
          {{ mapmodule.location.latitude }}°
          <DLabel :str="$t('longitude')" />
          {{ mapmodule.location.longitude }}°
        </template>
        <div v-else>
          {{ $t("no_coordinates") }}
        </div>
      </div>

      <button
        v-if="can_edit"
        type="button"
        class="u-button u-button_red"
        @click.stop="$emit('repickLocation')"
      >
        <b-icon icon="pin-map-fill" />
        <template v-if="!has_coordinates">
          {{ $t("place_on_map") }}
        </template>
        <template v-else>
          {{ $t("change_location") }}
        </template>
      </button>

      <!-- <RadioCheckboxField
        :field_name="'pin_icon'"
        :input_type="'radio'"
        :content="mapmodule.pin_icon || ''"
        :path="mapmodule.$path"
        :can_edit="can_edit"
        :options="icon_options"
      /> -->

      <RemoveMenu
        v-if="can_edit"
        :remove_text="$t('remove_pin')"
        :show_button_text="true"
        @remove="removeModule"
      />
    </div>

    <!-- <div v-if="!has_coordinates">
      <small>
        <sl-icon slot="icon" name="exclamation-triangle" />&nbsp;
        <span v-html="$t('no_coordinates')" />
      </small>
    </div> -->

    <!-- <DetailsPane :header="$t('position_on_map')" :icon="'map'">
    </DetailsPane> -->

    <!-- </DetailsPane> -->
    <!-- <MediaContent
      class="_preview"
      v-if="first_media"
      :file="first_media"
      :resolution="50"
      :context="'preview'"
    /> -->
  </div>
</template>
<script>
export default {
  props: {
    publication: Object,
    layer: Object,
    mapmodule: Object,
    is_opened: Boolean,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      show_details: false,
      icon_options: [
        {
          key: "",
          label: this.$t("circle"),
        },
        {
          key: "none",
          label: this.$t("none"),
        },
        {
          key: "self",
          label: this.$t("media_preview"),
        },
      ],
    };
  },
  i18n: {
    messages: {
      fr: {
        no_coordinates: "Aucunes coordonnées disponibles",
        position_on_map: "Position sur la carte",
        place_on_map: "Positionner sur la carte",
        change_location: "Changer la position",
        remove_pin: "Supprimer cette épingle",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    is_opened() {
      if (!this.is_opened) this.show_details = false;
    },
  },
  computed: {
    has_coordinates() {
      return (
        this.mapmodule.location &&
        this.mapmodule.location.latitude &&
        this.mapmodule.location.longitude
      );
    },
    first_media() {
      try {
        const source_media = this.mapmodule.source_medias[0];
        const publication_path = this.getParent(this.mapmodule.$path);
        return this.getSourceMedia({
          source_media,
          folder_path: publication_path,
        });
      } catch (err) {
        return false;
      }
    },
  },
  methods: {
    togglePin() {
      if (
        !this.mapmodule.location?.latitude ||
        !this.mapmodule.location?.longitude
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("no_coordinates"));
      }
      this.$emit("toggle");
    },
    async removeModule() {
      await this.removeModule2({
        publication: this.publication,
        section: this.layer,
        path: this.mapmodule.$path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._mapModule {
  // background: var(--c-gris);
  // border-radius: 2px;
  padding: 0;
  // margin-left: var(--spacing);
  // margin-bottom: var(--spacing);
  margin-right: 0;

  &:hover,
  :focus-visible {
    background: transparent;
  }
}

._text {
  // margin: calc(var(--spacing) / 4) 0;
}

._mapModule--topRow {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  cursor: pointer;

  ._preview {
    flex: 0 0 auto;
    width: 50px;
    height: 50px;
    overflow: hidden;

    ::v-deep ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      max-width: none;
    }
  }
  ._nameOfPin {
    flex: 1 1 200px;
  }
}

._latlon {
  font-size: var(--sl-font-size-small);
}

._mapModule--content {
  color: black;
  background: white;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
}
</style>
