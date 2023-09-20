<template>
  <div class="_mapModule" @click="openPin">
    <label>
      {{ index + 1 }}
    </label>
    <MediaContent
      class="_preview"
      v-if="first_media"
      :file="first_media"
      :resolution="50"
      :context="'preview'"
    />
    <div class="">
      <small>
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
      </small>
    </div>

    <button
      type="button"
      class="u-button u-button_red u-button_icon"
      @click="$emit('repickLocation')"
    >
      <b-icon icon="pin-map-fill" />
    </button>
  </div>
</template>
<script>
export default {
  props: {
    index: Number,
    mapmodule: Object,
  },
  components: {},
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
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
      this.$eventHub.$emit("publication.map.openPin", this.index);
    },
    removePin() {
      this.$eventHub.$emit("publication.map.openPin", this.index);
    },
  },
};
</script>
<style lang="scss" scoped>
._mapModule {
  display: flex;
  gap: calc(var(--spacing) / 2);
  background: var(--c-gris);

  gap: calc(var(--spacing) / 2);
  background: var(--c-gris);
  border-radius: 2px;
  padding: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 8) 0;
  display: flex;
  align-items: center;

  cursor: pointer;

  &:hover,
  :focus-visible {
    background: transparent;
  }
}
</style>
