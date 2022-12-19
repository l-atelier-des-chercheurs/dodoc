<template>
  <div
    class="_moduleMosaic"
    :style="`--number_of_medias: ${medias_with_linked.length}`"
  >
    <!-- <splitpanes watch-slots :dbl-click-splitter="false" @resized="resized">
      <pane
        v-for="(slot, index) in source_medias.length"
        class="_pane"
        :key="index"
        min-size="5"
      >
        <template v-if="source_medias[index]">
          <MediaContent
            :file="source_medias[index]"
            :resolution="1600"
            :context="'full'"
          />
          <div class="_removeMedia" v-if="can_edit">
            <button
              type="button"
              class="u-buttonLink"
              @click="removeMediaAtIndex(index)"
            >
              {{ $t("remove") }}
            </button>
          </div>
        </template>
      </pane>
      <div class="_mediaPickerTile">
        <MediaPicker
          class=""
          v-if="can_edit"
          :publication_path="publication_path"
          @selectMedia="selectMedia"
        />
      </div>
    </splitpanes> -->

    <div class="_mediaGrid">
      <div
        class="_mediaGrid--item"
        v-for="(media_with_linked, index) in medias_with_linked"
        :key="media_with_linked._linked_media.$path"
        :style="itemStyle({ media_with_linked })"
      >
        <MediaContent
          :file="media_with_linked._linked_media"
          :resolution="1600"
          :context="'full'"
        />
        <div class="_btnRow" v-if="can_edit">
          <button
            type="button"
            class="u-buttonLink"
            :disabled="
              !media_with_linked.objectFit ||
              media_with_linked.objectFit === 'cover'
            "
            @click="frameFit({ index, opt: { objectFit: 'cover' } })"
          >
            {{ $t("object_fit_cover") }}
          </button>
          <button
            type="button"
            class="u-buttonLink"
            :disabled="media_with_linked.objectFit === 'contain'"
            @click="frameFit({ index, opt: { objectFit: 'contain' } })"
          >
            <!-- v-if="media_with_linked.objectFit !== 'contain'" -->
            {{ $t("object_fit_contain") }}
          </button>
          <button
            type="button"
            class="u-buttonLink"
            @click="removeMediaAtIndex(index)"
          >
            {{ $t("remove") }}
          </button>
        </div>
      </div>
      <div class="_mediaPickerTile" v-if="can_edit">
        <sl-icon-button
          name="plus-circle-fill"
          class="u-colorBleuvert"
          :label="$t('add_media')"
          v-if="!show_media_picker"
          @click="show_media_picker = true"
        />
        <MediaPicker
          v-else
          :publication_path="publication_path"
          @selectMedia="selectMedia"
          @close="show_media_picker = false"
        />

        <transition name="dropzone" :duration="150">
          <div class="_dropzone" v-if="show_dropzone">
            <DropZone @mediaDropped="selectMedia" />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>
// import { Splitpanes, Pane } from "splitpanes";
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    publimodule: Object,
    can_edit: Boolean,
  },
  components: {
    // Splitpanes,
    // Pane,
    MediaPicker,
  },
  data() {
    return {
      show_media_picker: false,
      show_dropzone: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on(`mediadrag.start`, this.showDropzone);
    this.$eventHub.$on(`mediadrag.end`, this.hideDropzone);
  },
  beforeDestroy() {
    this.$eventHub.$off(`mediadrag.start`, this.showDropzone);
    this.$eventHub.$off(`mediadrag.end`, this.hideDropzone);
  },
  watch: {},
  computed: {
    publication_path() {
      return this.publimodule.$path.substring(
        0,
        this.publimodule.$path.lastIndexOf("/")
      );
    },
    medias_with_linked() {
      if (!this.publimodule.source_medias) return [];
      return this.publimodule.source_medias.map((m) => {
        const _linked_media = this.getSourceMedia({
          source_media_path: m.path,
        });
        const media_with_linked = Object.assign({}, m, { _linked_media });
        return media_with_linked;
      });
    },
  },
  methods: {
    selectMedia({ path_to_source_media }) {
      const source_medias = this.publimodule.source_medias.slice();
      source_medias.push({ path: path_to_source_media });
      this.$emit("updateMeta", { source_medias });
      this.show_media_picker = false;
    },
    removeMediaAtIndex(index) {
      const source_medias = this.publimodule.source_medias.slice();
      source_medias.splice(index, 1);
      this.$emit("updateMeta", { source_medias });
    },
    frameFit({ index, opt }) {
      const source_medias = this.publimodule.source_medias.slice();
      Object.assign(source_medias[index], opt);
      this.$emit("updateMeta", { source_medias });
    },
    itemStyle({ media_with_linked }) {
      let props = {};
      props["--object-fit"] = media_with_linked.objectFit || "cover";
      return props;
    },
    showDropzone() {
      this.show_dropzone = true;
    },
    hideDropzone() {
      this.show_dropzone = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._moduleMosaic {
  --number_of_medias: 1;
  position: relative;
}
._mediaGrid {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 4);
  width: 100%;
  transition: flex 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  > ._mediaGrid--item {
    position: relative;
    aspect-ratio: 1/1;
    overflow: hidden;
    background: var(--c-gris_clair);

    flex: 1 1 calc(100% / var(--number_of_medias));

    transition: flex 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    ::v-deep ._mediaContent {
      img,
      video {
        position: absolute;
        height: 100%;
        width: 100%;
        object-fit: cover;
        object-fit: var(--object-fit);
      }
    }
  }
}

._mediaPickerTile {
  position: absolute;
  left: auto;
  right: 0;
  // background: var(--c-gris);
  // height: 100%;
  display: flex;
  place-content: center;
  height: 100%;
  align-items: center;
}
._btnRow {
  position: absolute;
  padding: calc(var(--spacing) / 2);
  top: 0;
  right: 0;
  left: auto;

  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);

  button {
    background: white;
    border-radius: 4px;
    // background: rgba(255, 255, 255, 0.7);
  }
}

._dropzone {
  position: absolute;
  width: 100%;
  height: 100%;

  ::v-deep ._dropNotice {
    transform: rotate(-90deg);
  }
}
</style>
