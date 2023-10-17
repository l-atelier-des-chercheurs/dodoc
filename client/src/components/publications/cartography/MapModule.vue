<template>
  <div class="_mapModule">
    <!-- <label>
      <b>
        {{ index + 1 }}
      </b>
    </label> -->
    <div class="_topRow" @click="togglePin">
      <MediaContent
        class="_preview"
        v-if="firstMedia(mapmodule)"
        :file="firstMedia(mapmodule)"
        :resolution="220"
        :context="'preview'"
      />
      <div class="_nameOfPin">
        <div v-text="mapmodule.pin_name || $t('untitled')"></div>
        <div>
          <button
            type="button"
            class="u-buttonLink"
            v-if="is_opened"
            @click="show_details = !show_details"
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

    <div v-if="show_details">
      Quisque pretium, mi id hendrerit semper, justo nunc posuere justo, a
      pulvinar augue magna nec diam. In tellus odio, tempus ornare mi non,
      hendrerit facilisis neque. Duis vel posuere mauris. Phasellus quis
      consectetur tellus, sed bibendum turpis. Sed hendrerit venenatis augue, eu
      condimentum sapien consectetur nec. Sed faucibus est id dolor faucibus
      sodales. In porttitor justo nec magna posuere dignissim. Proin ut neque
      non dolor feugiat elementum ac a diam. Proin et euismod justo, ut
      scelerisque lectus. Duis risus sem, venenatis at vulputate sit amet,
      faucibus hendrerit diam. Vestibulum dignissim massa quis dui laoreet
      efficitur. Praesent sapien ex, suscipit et blandit pretium, aliquet at
      quam. Sed scelerisque ipsum et nulla facilisis auctor.
    </div>

    <!-- <div v-if="!has_coordinates">
      <small>
        <sl-icon slot="icon" name="exclamation-triangle" />&nbsp;
        <span v-html="$t('no_coordinates')" />
      </small>
    </div> -->

    <!-- <DetailsPane :header="$t('position_on_map')" :icon="'map'">
      <div class="_text">
        <template v-if="has_coordinates">
          {{ mapmodule.location.latitude }} /
          {{ mapmodule.location.longitude }}
        </template>
        <template v-else>
          {{ $t("no_coordinates") }}
        </template>
      </div>

      <button
        v-if="can_edit"
        type="button"
        class="u-button u-button_red u-button_icon"
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

      <RemoveMenu
        :remove_text="$t('remove_pin')"
        :show_button_text="true"
        @remove="removeModule"
      />
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
  watch: {},
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

  cursor: pointer;

  &:hover,
  :focus-visible {
    background: transparent;
  }
}

._text {
  margin: calc(var(--spacing) / 4) 0;
}

._topRow {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);

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
</style>
