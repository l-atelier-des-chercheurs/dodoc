<template>
  <transition name="fade_fast" mode="out-in">
    <div
      class="_moduleMosaic"
      :style="`--number_of_medias: ${medias_with_linked.length}`"
      :key="is_multiple_medias ? 'multiple' : 'single'"
      :class="{
        'is--multipleMedias': is_multiple_medias,
      }"
    >
      <div class="_mediaGrid">
        <template v-for="(media_with_linked, index) in medias_with_linked">
          <div
            class="_mediaGrid--item"
            :key="
              (media_with_linked._linked_media &&
                media_with_linked._linked_media.$path) ||
              'no_media_' + index
            "
            :style="itemStyle({ media_with_linked })"
          >
            <span
              v-if="!media_with_linked._linked_media"
              class="_noSourceMedia u-instructions"
              v-text="$t('source_media_missing')"
            />
            <MediaContent
              v-else
              :file="media_with_linked._linked_media"
              :resolution="context === 'preview' ? 220 : 1600"
              :context="context"
              :show_fs_button="show_fs_button"
            />

            <div class="_btnRow" v-if="can_edit">
              <button
                type="button"
                class="u-buttonLink"
                v-if="
                  (is_multiple_medias ||
                    (page_template === 'page_by_page' &&
                      !single_media_displayed_at_full_ratio)) &&
                  !(
                    !media_with_linked.objectFit ||
                    media_with_linked.objectFit === 'cover'
                  )
                "
                @click="frameFit({ index, opt: { objectFit: 'cover' } })"
              >
                {{ $t("object_fit_cover") }}
              </button>
              <button
                type="button"
                class="u-buttonLink"
                v-if="
                  (is_multiple_medias ||
                    (page_template === 'page_by_page' &&
                      !single_media_displayed_at_full_ratio)) &&
                  media_with_linked.objectFit !== 'contain'
                "
                @click="frameFit({ index, opt: { objectFit: 'contain' } })"
              >
                <!-- v-if="media_with_linked.objectFit !== 'contain'" -->
                {{ $t("object_fit_contain") }}
              </button>
              <button
                type="button"
                class="u-buttonLink"
                v-if="is_multiple_medias"
                @click="removeMediaAtIndex(index)"
              >
                {{ $t("remove") }}
              </button>
            </div>
          </div>
        </template>
        <div
          class="_mediaPickerTile"
          v-if="
            can_edit &&
            (!number_of_max_medias ||
              medias_with_linked.length < number_of_max_medias)
          "
        >
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
            <div
              class="_dropzone"
              v-if="
                show_dropzone &&
                medias_with_linked.length < number_of_max_medias
              "
            >
              <DropZone @mediaDropped="selectMedia" />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
// import { Splitpanes, Pane } from "splitpanes";
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    publimodule: Object,
    can_edit: Boolean,
    context: {
      type: String,
      default: "full",
    },
    page_template: String,
    number_of_max_medias: [Boolean, Number],
    show_fs_button: Boolean,
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
      return this.getParent(this.publimodule.$path);
    },
    single_media_displayed_at_full_ratio() {
      if (this.medias_with_linked.length > 1) return false;

      const ratio = this.medias_with_linked[0]._linked_media.$infos?.ratio;
      return (
        Math.round(ratio * 10) ===
        Math.round((this.publimodule.height / this.publimodule.width) * 10)
      );
    },
    medias_with_linked() {
      if (!this.publimodule.source_medias) return [];
      return this.publimodule.source_medias.map((source_media) => {
        const _linked_media = this.getSourceMedia({
          source_media,
          folder_path: this.publication_path,
        });
        return Object.assign({}, source_media, { _linked_media });
      });
    },
    is_multiple_medias() {
      return this.medias_with_linked.length > 1;
    },
  },
  methods: {
    selectMedia({ path_to_source_media_meta }) {
      const source_medias = this.publimodule.source_medias.slice();
      source_medias.push({ path: path_to_source_media_meta });
      this.$emit("updateMeta", { source_medias });
      this.show_media_picker = false;
    },
    removeMediaAtIndex(index) {
      const source_medias = this.publimodule.source_medias.slice();
      source_medias.splice(index, 1);

      if (source_medias.length === 0) this.$emit("remove");
      else this.$emit("updateMeta", { source_medias });
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
  width: 100%;

  ._moduleMosaic.is--multipleMedias & {
    display: flex;
    flex-flow: row nowrap;
    gap: calc(var(--spacing) / 4);
    transition: flex 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  }

  > ._mediaGrid--item {
    position: relative;

    ._moduleMosaic.is--multipleMedias & {
      aspect-ratio: 1/1;
      overflow: hidden;
      background: var(--c-gris_clair);
      flex: 1 1 calc(100% / var(--number_of_medias));
    }

    transition: flex 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    ::v-deep ._mediaContent {
      ._moduleMosaic.is--multipleMedias & {
        width: 100%;
        height: 100%;
      }

      ._mediaContent--image,
      .plyr--video,
      ._mediaContent--iframe {
        ._moduleMosaic.is--multipleMedias & {
          position: absolute;
          height: 100%;
          width: 100%;
          object-fit: cover;
          object-fit: var(--object-fit);
        }
      }
    }
  }
}

._mediaPickerTile {
  position: absolute;
  top: 0;
  left: auto;
  right: 0;
  // background: var(--c-gris);
  // height: 100%;
  display: flex;
  place-content: center;
  height: 100%;
  align-items: center;

  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}
._btnRow {
  position: absolute;
  padding: calc(var(--spacing) / 2);
  top: 0;
  right: 0;
  left: auto;
  z-index: 100;

  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);

  button {
    // background: white;
    border-radius: 4px;
    color: white;
    text-shadow: 0px 0px 4px rgb(0 0 0 / 80%);
    // background: rgba(0, 0, 0, 0.2);
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

sl-icon-button::part(base) {
  font-size: 1.5em;
  color: var(--c-bleuvert);
}

._noSourceMedia {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
