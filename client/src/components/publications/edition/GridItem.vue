<template>
  <div class="_gridItem">
    <div class="_gridItem--header">
      <h3 class="_gridItem--label">
        {{ area.id }}
        <template v-if="area.number_of_areas_in_chain > 1">
          <span
            class="_gridItem--chainCount"
            v-for="i in area.number_of_areas_in_chain - 1"
            :key="i"
          >
            -> {{ area.id }}{{ i }}
          </span>
        </template>
      </h3>

      <button
        type="button"
        class="u-button u-button_verysmall"
        :disabled="!can_remove_area_content"
        @click="removeAreaContent"
      >
        <b-icon icon="trash" style="font-size: var(--icon-size)" />
        {{ $t("remove") }}
      </button>
    </div>
    <div class="_gridItem--content">
      <div
        v-if="!area_current_file && !area_has_source_media"
        class="_gridItem--actions"
      >
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="createText"
        >
          <b-icon icon="fonts" style="font-size: var(--icon-size)" />
          {{ $t("add_text") }}
        </button>
        <button
          type="button"
          class="u-button u-button_orange"
          @click="show_media_picker = true"
        >
          <b-icon icon="image" style="font-size: var(--icon-size)" />
          {{ $t("add_image") }}
        </button>
      </div>

      <div v-else-if="area_is_text">
        <MainText
          :text_file="area_current_file"
          :medias_holder="area_current_file"
          :publication_path="publication.$path"
          :show_label="false"
        />
      </div>

      <div
        v-else
        class="_gridItem--media"
        :class="{ '_gridItem--media_missing': area_media_is_missing }"
        :style="{
          '--object-fit': area_objectFit,
          '--object-position': area_objectPosition,
        }"
      >
        <p v-if="area_media_is_missing" class="u-warning">
          {{ $t("source_media_missing") }}
        </p>
        <MediaContent v-else :file="area_current_file" :resolution="1600" />
        <div class="_gridItem--mediaActions">
          <button
            v-if="!area_media_is_missing"
            type="button"
            class="u-button u-button_bleuvert u-button_small"
            :title="
              area_objectFit === 'contain'
                ? $t('object_fit_contain')
                : $t('object_fit_cover')
            "
            @click.stop="toggleObjectFit"
          >
            <b-icon
              :icon="
                area_objectFit === 'contain'
                  ? 'aspect-ratio'
                  : 'aspect-ratio-fill'
              "
            />
            {{ $t("object_fit") }}
          </button>
          <button
            type="button"
            class="u-button u-button_orange u-button_small"
            @click="show_media_picker = true"
          >
            <b-icon icon="image" style="font-size: var(--icon-size)" />
            {{ $t("change") }}
          </button>
        </div>
      </div>
    </div>

    <MediaPicker
      v-if="show_media_picker"
      :publication_path="publication.$path"
      :select_mode="'single'"
      :pick_from_types="['image']"
      @pickMedias="pickMediaForArea"
      @close="show_media_picker = false"
    />
  </div>
</template>

<script>
import MainText from "@/components/publications/edition/MainText.vue";
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    area: {
      type: Object,
      required: true,
    },
    chapter: {
      type: Object,
      required: true,
    },
    publication: Object,
  },
  components: {
    MainText,
    MediaPicker,
  },
  data() {
    return {
      show_media_picker: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("gridArea.delete", this.handleAreaDeletion);
  },
  beforeDestroy() {
    this.$eventHub.$off("gridArea.delete", this.handleAreaDeletion);
  },
  watch: {},
  computed: {
    area_source_media() {
      return this.area?.source_medias?.[0];
    },
    area_has_source_media() {
      return Boolean(this.area_source_media);
    },
    area_file_from_source_medias() {
      if (!this.area_source_media) return;
      return this.getSourceMedia({
        source_media: this.area_source_media,
        folder_path: this.publication.$path,
      });
    },
    area_current_file() {
      return this.area_file_from_source_medias;
    },
    area_media_is_missing() {
      return this.area_has_source_media && !this.area_current_file;
    },
    area_is_text() {
      return (
        this.area_current_file?.$type === "text" ||
        this.area_current_file?.content_type === "markdown"
      );
    },
    area_objectFit() {
      return this.area?.objectFit || "cover";
    },
    area_objectPosition() {
      return this.area?.objectPosition || "center";
    },
    can_remove_area_content() {
      return this.area_has_source_media;
    },
  },
  methods: {
    updateChapterFromGridAreas(new_grid_areas) {
      const source_medias = this.getGridEmbeddedSourceMedias({
        grid_areas: new_grid_areas,
      });

      return this.$api.updateMeta({
        path: this.chapter.$path,
        new_meta: {
          grid_areas: new_grid_areas,
          source_medias,
        },
      });
    },
    async createText() {
      const areaId = this.area.id;
      const chapter_name = this.chapter.$path.split("/").pop();
      const filename = `${chapter_name}-${areaId}_text.md`;

      const { meta_filename } = await this.$api.uploadText({
        path: this.publication.$path,
        filename,
        content: "",
        additional_meta: {
          content_type: "markdown",
        },
      });

      // Update grid area with the new file
      const new_grid_areas = this.chapter.grid_areas.map((area) => {
        if (area.id === areaId) {
          return {
            ...area,
            // canonical: everything is referenced via `source_medias`
            source_medias: [{ meta_filename }],
          };
        }
        return area;
      });

      await this.updateChapterFromGridAreas(new_grid_areas);

      const path = this.publication.$path + "/" + meta_filename;
      // call media.enableEditor to enable editing of the new text
      setTimeout(() => {
        this.$eventHub.$emit("media.enableEditor." + path);
      }, 150);
    },

    async pickMediaForArea(medias) {
      const media = medias?.[0];
      if (!media) return;

      const areaId = this.area.id;
      const import_mode = this.$root.publication_include_mode;
      const new_entry = await this.prepareMediaForPublication({
        path_to_source_media_meta: media.$path,
        publication_path: this.publication.$path,
        import_mode,
      });

      const new_grid_areas = this.chapter.grid_areas.map((area) => {
        if (area.id === areaId) {
          return {
            ...area,
            source_medias: [new_entry],
            // default fit options for medias in grid areas
            objectFit: "cover",
            objectPosition: "center",
          };
        }
        return area;
      });

      this.updateChapterFromGridAreas(new_grid_areas);
    },

    async removeAreaContent() {
      const areaId = this.area.id;
      const file_to_delete = this.area_current_file;

      const new_grid_areas = this.chapter.grid_areas.map((area) => {
        if (area.id === areaId) {
          return {
            ...area,
            source_medias: [],
          };
        }
        return area;
      });

      await this.updateChapterFromGridAreas(new_grid_areas);

      // Only delete the actual text file when it's local to the publication
      if (
        file_to_delete?.$path &&
        file_to_delete.$type === "text" &&
        file_to_delete.$path.startsWith(this.publication.$path + "/")
      ) {
        await this.$api.deleteItem({
          path: file_to_delete.$path,
        });
      }
    },

    toggleObjectFit() {
      const areaId = this.area.id;
      const nextFit = this.area_objectFit === "contain" ? "cover" : "contain";

      const new_grid_areas = this.chapter.grid_areas.map((area) => {
        if (area.id === areaId) {
          return {
            ...area,
            objectFit: nextFit,
            objectPosition: "center",
          };
        }
        return area;
      });

      this.$api.updateMeta({
        path: this.chapter.$path,
        new_meta: {
          grid_areas: new_grid_areas,
        },
      });
    },

    async handleAreaDeletion(areaId) {
      // Only handle deletion if this is our area
      if (areaId !== this.area.id) return;

      // Clean up associated files (only local text; don't delete project medias)
      const file_to_delete = this.area_current_file;
      if (
        file_to_delete?.$path &&
        file_to_delete.$type === "text" &&
        file_to_delete.$path.startsWith(this.publication.$path + "/")
      )
        await this.$api.deleteItem({ path: file_to_delete.$path });
    },
  },
};
</script>

<style lang="scss" scoped>
._gridItem {
  border: 1px solid var(--c-gris);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: var(--input-border-radius);

  --icon-size: 1.2rem;
}

._gridItem--header {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 2);
}

._gridItem--content {
}

._gridItem--label {
  padding: calc(var(--spacing) / 4);
  padding-bottom: 0;
}
._gridItem--select {
  width: 25ch;
}

._gridItem--actions {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}

._gridItem--media {
  position: relative;
  background-color: var(--c-gris_clair);
  border-radius: var(--border-radius);
  overflow: hidden;

  ::v-deep {
    ._mediaContent,
    img {
      width: 100%;
      height: auto;
      height: 120px;

      object-fit: scale-down;
    }

    ._mediaContent--image,
    .plyr--video,
    .plyr__poster,
    ._mediaContent--iframe,
    ._iframeStylePreview {
      position: absolute;
      height: 100%;
      width: 100%;
      object-fit: var(--object-fit, cover);
      object-position: var(--object-position, center);
      background-size: var(--object-fit, cover);
      background-position: var(--object-position, center);
    }
  }
}

._gridItem--mediaActions {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 2);
}

._gridItem--media_missing {
  min-height: 120px;
  padding: calc(var(--spacing) / 2);
}
</style>
