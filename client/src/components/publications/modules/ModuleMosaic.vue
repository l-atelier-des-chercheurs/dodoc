<template>
  <div class="_moduleMosaic">
    <div class="_mediaGrid">
      <div
        class="_mediaGrid--item"
        v-for="(slot, index) in source_medias.length + 1"
        :key="index"
      >
        <template v-if="source_medias[index]">
          <MediaContent
            :file="source_medias[index]"
            :resolution="1600"
            :context="'full'"
          />
          <div class="_removeMedia">
            <button
              type="button"
              class="u-buttonLink"
              @click="removeMediaAtIndex(index)"
            >
              {{ $t("remove") }}
            </button>
          </div>
        </template>
        <div v-else class="_mediaPickerTile">
          <MediaPicker
            class=""
            v-if="$api.is_logged_in"
            :publication_path="publication_path"
            @selectMedia="selectMedia"
          />
        </div>
      </div>
      <!-- <div v-for="media in source_medias" :key="media.$path">
      </div> -->
    </div>
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    publimodule: Object,
  },
  components: {
    MediaPicker,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    publication_path() {
      return this.publimodule.$path.substring(
        0,
        this.publimodule.$path.lastIndexOf("/")
      );
    },
    source_medias() {
      if (!this.publimodule.source_medias) return [];
      return this.publimodule.source_medias.map(({ path }) =>
        this.getSourceMedia({ source_media_path: path })
      );
    },
  },
  methods: {
    selectMedia({ path_to_source_media }) {
      const source_medias = this.publimodule.source_medias.slice();
      source_medias.push({ path: path_to_source_media });
      this.$emit("updateMeta", { source_medias });
    },
    removeMediaAtIndex(index) {
      const source_medias = this.publimodule.source_medias.slice();
      source_medias.splice(index, 1);
      this.$emit("updateMeta", { source_medias });
    },
  },
};
</script>
<style lang="scss" scoped>
._moduleMosaic {
}
._mediaGrid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: calc(var(--spacing) / 4);
  width: 100%;

  > ._mediaGrid--item {
    position: relative;

    ::v-deep ._mediaContent {
      // height: 100%;
      // width: 100%;

      img {
        aspect-ratio: 1/1;
        overflow: hidden;
        border-radius: 4px;
        object-fit: cover;
      }
    }
  }
}

._mediaPickerTile {
  background: var(--c-gris);
  width: 100%;
  height: 100%;
  display: flex;
  place-content: center;
}
._removeMedia {
  position: absolute;
  padding: calc(var(--spacing) / 2);
  bottom: 0;
  right: 0;
  left: auto;

  button {
    background: rgba(255, 255, 255, 0.7);
  }
}
</style>
