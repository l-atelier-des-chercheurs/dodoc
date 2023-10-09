<template>
  <div class="_mapModule" @click="openPin">
    <label>
      <b>
        {{ index + 1 }}
      </b>
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
      v-if="can_edit"
      type="button"
      class="u-button u-button_red u-button_icon"
      @click.stop="$emit('repickLocation')"
    >
      <b-icon icon="pin-map-fill" />
    </button>
    <button
      v-if="can_edit"
      type="button"
      class="u-button u-button_transparent u-button_icon"
      @click="removeModule"
    >
      <b-icon icon="trash" />
    </button>
  </div>
</template>
<script>
export default {
  props: {
    index: Number,
    mapmodule: Object,
    can_edit: Boolean,
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
      this.$eventHub.$emit("publication.map.openPin", this.mapmodule.$path);
    },
    removePin() {
      this.$eventHub.$emit("publication.map.openPin", this.mapmodule.$path);
    },
    async removeModule() {
      await this.$api
        .deleteItem({
          path: this.mapmodule.$path,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
      this.$emit("remove");
    },
  },
};
</script>
<style lang="scss" scoped>
._mapModule {
  background: var(--c-gris);
  border-radius: 2px;
  padding: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 8) 0;

  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  cursor: pointer;

  &:hover,
  :focus-visible {
    background: transparent;
  }
}
</style>
