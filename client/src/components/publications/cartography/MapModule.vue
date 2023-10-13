<template>
  <div class="_mapModule">
    <!-- <label>
      <b>
        {{ index + 1 }}
      </b>
    </label> -->
    <div class="_topRow" @click="openPin">
      <MediaContent
        class="_preview"
        v-if="firstMedia(mapmodule)"
        :file="firstMedia(mapmodule)"
        :resolution="220"
        :context="'preview'"
      />
    </div>

    <DetailsPane :header="$t('position_on_map')" :icon="'map'">
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
    </DetailsPane>

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
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
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
    openPin() {
      if (
        !this.mapmodule.location?.latitude ||
        !this.mapmodule.location?.longitude
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("no_coordinates"));
      }
      this.$emit("open");
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
  border-bottom: 2px solid var(--c-gris);

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
}
</style>
