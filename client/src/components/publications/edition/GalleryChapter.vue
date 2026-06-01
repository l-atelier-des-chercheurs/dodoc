<template>
  <div class="_galleryChapter">
    <transition-group tag="div" class="_gallery" name="StoryModules" appear>
      <div
        class="_gallery--item"
        v-for="media in gallery_medias"
        :key="media.$path"
      >
        <MediaContent :file="media" :context="'full'" />
        <div class="_remove_media">
          <RemoveMenu :show_button_text="false" @remove="removeMedia(media)" />
        </div>
      </div>

      <div class="_add_medias" key="add_medias">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="show_media_picker = true"
        >
          {{ $t("add_medias") }}
        </button>
      </div>
    </transition-group>

    <MediaPicker
      v-if="show_media_picker"
      :publication_path="publication.$path"
      :select_mode="'multiple'"
      :pick_from_types="['image']"
      @pickMedias="pickMediasForGallery"
      @close="show_media_picker = false"
    />
  </div>
</template>

<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    chapter: Object,
    publication: Object,
  },
  components: {
    MediaPicker,
  },
  data() {
    return {
      show_media_picker: false,
    };
  },
  computed: {
    gallery_medias() {
      const medias = [];
      if (
        this.chapter.section_type !== "gallery" ||
        !this.chapter.source_medias
      )
        return [];
      for (const source_media of this.chapter.source_medias) {
        const folder_path = this.getParent(this.chapter.$path);
        const media = this.getSourceMedia({
          source_media,
          folder_path,
        });
        if (media) medias.push(media);
      }
      return medias;
    },
  },
  methods: {
    async pickMediasForGallery(medias) {
      const new_entries = [];
      for (const media of medias) {
        const import_mode = this.$root.publication_include_mode;
        const new_entry = await this.prepareMediaForPublication({
          path_to_source_media_meta: media.$path,
          publication_path: this.publication.$path,
          import_mode,
        });
        new_entries.push(new_entry);
      }

      const existing_source_medias = this.chapter.source_medias || [];
      const source_medias = [...existing_source_medias, ...new_entries];

      this.$api.updateMeta({
        path: this.chapter.$path,
        new_meta: {
          source_medias,
        },
      });
    },
    removeMedia(media) {
      const source_medias = this.chapter.source_medias.filter(
        (sm) => sm.meta_filename_in_project !== this.getFilename(media.$path)
      );
      this.$api.updateMeta({
        path: this.chapter.$path,
        new_meta: { source_medias },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
._galleryChapter {
  padding-bottom: calc(var(--spacing) * 1);
}

._gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: calc(var(--spacing) * 1);

  ._add_medias {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  ._gallery--item {
    position: relative;
    aspect-ratio: 1/1;

    border: 2px solid var(--c-gris_clair);
    overflow: hidden;

    ::v-deep {
      ._mediaContent {
        width: 100%;
        height: 100%;
      }

      ._mediaContent--image,
      .plyr--video,
      .plyr__poster,
      ._mediaContent--iframe,
      ._iframeStylePreview {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        object-fit: scale-down;
        background-size: scale-down;
        background-color: var(--c-gris_clair);
      }
    }
  }
}

._remove_media {
  position: absolute;
  top: 0;
  right: 0;
  margin: calc(var(--spacing) / 2);
}
</style>
