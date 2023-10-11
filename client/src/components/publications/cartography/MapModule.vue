<template>
  <div class="_mapModule" @click="openPin">
    <!-- <label>
      <b>
        {{ index + 1 }}
      </b>
    </label> -->
    <PublicationModule
      class="_mediaPublication"
      :publimodule="mapmodule"
      :module_position="module_position"
      :context="'preview'"
      :number_of_max_medias="1"
      :can_edit="can_edit"
      @moveUp="$emit('moveUp')"
      @moveDown="$emit('moveDown')"
      @remove="$emit('remove')"
    />
    <DetailsPane :header="$t('infos')" :icon="'map'">
      <div class="u-meta _text">
        <template
          v-if="
            mapmodule.location &&
            mapmodule.location.latitude &&
            mapmodule.location.longitude
          "
        >
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
        {{ $t("pick_new_location") }}
      </button>
    </DetailsPane>
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
import PublicationModule from "@/components/publications/modules/PublicationModule.vue";

export default {
  props: {
    index: Number,
    mapmodule: Object,
    module_position: String,
    can_edit: Boolean,
  },
  components: {
    PublicationModule,
  },
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {
        no_coordinates: "Aucunes coordonnées disponibles",
        pick_new_location: "Modifier la position",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
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
      this.$eventHub.$emit("publication.map.openPin", this.mapmodule.$path);
    },
    removePin() {
      this.$eventHub.$emit("publication.map.openPin", this.mapmodule.$path);
    },
  },
};
</script>
<style lang="scss" scoped>
._mapModule {
  // background: var(--c-gris);
  // border-radius: 2px;
  padding: 0;
  margin-left: var(--spacing);
  margin-bottom: var(--spacing);
  margin-right: 0;
  border-bottom: 2px solid var(--c-gris);

  // display: flex;
  // align-items: center;
  // gap: calc(var(--spacing) / 2);

  cursor: pointer;

  &:hover,
  :focus-visible {
    background: transparent;
  }
}

._text {
  margin: calc(var(--spacing) / 4) 0;
}

._mediaPublication {
  width: 100%;
  ::v-deep {
    ._options {
      display: none;
    }

    ._mediaContent--image {
      // position: absolute;
      width: 100%;
      aspect-ratio: 4/1;
      // height: 100%;
      object-fit: var(--object-fit, cover);
      object-position: center;
    }
  }
}
</style>
