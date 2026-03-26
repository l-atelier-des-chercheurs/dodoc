<template>
  <div class="_cellEdit">
    <div v-if="show_empty_actions" class="_cellEdit--actions">
      <button
        type="button"
        class="u-button u-button_small"
        :title="$t('add_text')"
        @click="createText"
      >
        <b-icon icon="fonts" style="font-size: var(--icon-size)" />
      </button>
      <button
        type="button"
        class="u-button u-button_small"
        :title="$t('add_image')"
        @click="show_media_picker = true"
      >
        <b-icon icon="image" style="font-size: var(--icon-size)" />
      </button>
    </div>

    <TitleField
      v-else-if="show_text_editor"
      ref="text_editor"
      :label="$t('content')"
      :show_label="false"
      :input_type="'editor'"
      :custom_formats="['bold', 'italic', 'link', 'emoji', 'align']"
      :content="normalized_cell.content"
      :can_edit="can_edit"
      @save="save({ key: 'content', value: $event })"
    />
    <div v-else-if="show_media_preview" class="_cellEdit--mediaPreview">
      <div class="_cellEdit--media" :style="media_container_style">
        <MediaContent :file="cell_current_file" :resolution="1600" />
      </div>
    </div>
    <div v-if="can_edit && !show_empty_actions" class="_cellEdit--mediaActions">
      <button
        type="button"
        class="u-button u-button_icon u-button_small"
        :title="$t('remove')"
        @click.stop="resetCell"
      >
        <b-icon icon="trash" />
      </button>
    </div>

    <MediaPicker
      v-if="show_media_picker"
      :publication_path="table_folder_path"
      :select_mode="'single'"
      :pick_from_types="['image']"
      @pickMedias="pickMediaForCell"
      @close="show_media_picker = false"
    />
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    cell: [String, Object],
    table_path: String,
    table_file: Object,
    can_edit: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: {
    MediaPicker,
  },
  data() {
    return {
      show_media_picker: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},

  computed: {
    table_folder_path() {
      if (!this.table_path) return "";
      return this.getParent(this.table_path);
    },
    normalized_cell() {
      return this.buildNormalizedCell(this.cell);
    },
    content_type_lower() {
      return (this.normalized_cell.content_type || "").toLowerCase();
    },
    selected_source_media() {
      return this.normalized_cell.source_medias?.[0];
    },
    table_source_medias() {
      if (!this.table_file || !Array.isArray(this.table_file.source_medias))
        return [];
      return this.table_file.source_medias;
    },
    selected_source_media_with_fallback() {
      if (!this.selected_source_media) return;

      const embedded_media = this.findEmbeddedMediaForSource(
        this.selected_source_media
      );
      if (!embedded_media) return this.selected_source_media;

      return {
        ...this.selected_source_media,
        _media: embedded_media,
      };
    },
    cell_file_from_source_medias() {
      if (!this.selected_source_media_with_fallback || !this.table_folder_path)
        return;
      return this.getSourceMedia({
        source_media: this.selected_source_media_with_fallback,
        folder_path: this.table_folder_path,
      });
    },
    cell_current_file() {
      return this.cell_file_from_source_medias;
    },
    is_media_content_type() {
      return !!this.content_type_lower && this.content_type_lower !== "text";
    },
    has_text_content() {
      const content = this.normalized_cell.content || "";
      if (typeof content !== "string") return false;
      const without_tags = content
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ");
      return without_tags.trim().length > 0;
    },
    show_media_preview() {
      return !!this.cell_current_file && this.is_media_content_type;
    },
    show_empty_actions() {
      return (
        this.can_edit &&
        !this.show_media_preview &&
        !this.has_text_content &&
        this.content_type_lower !== "text"
      );
    },
    show_text_editor() {
      return !this.show_media_preview;
    },
    media_ratio() {
      const ratio = this.cell_current_file?.$infos?.ratio;
      if (typeof ratio !== "number" || ratio <= 0) return 1;
      return 1 / ratio;
    },
    media_container_style() {
      return {
        width: "100%",
        maxWidth: "min(32vw, 360px)",
        maxHeight: "35vh",
        aspectRatio: this.media_ratio,
      };
    },
  },
  methods: {
    buildNormalizedCell(cell) {
      const empty_cell = {
        content_type: "",
        content: "",
        source_medias: [],
        media_width: null,
      };

      if (typeof cell === "string") {
        return {
          ...empty_cell,
          content: cell,
        };
      }
      if (!cell || typeof cell !== "object") return empty_cell;

      const normalized_cell = {
        ...empty_cell,
        ...cell,
      };
      if (typeof normalized_cell.content !== "string")
        normalized_cell.content = "";
      if (!Array.isArray(normalized_cell.source_medias))
        normalized_cell.source_medias = [];
      return normalized_cell;
    },
    emitUpdatedCell(updated_data) {
      const new_cell = {
        ...this.normalized_cell,
        ...updated_data,
      };
      this.$emit("update", new_cell);
    },
    save({ key, value }) {
      this.emitUpdatedCell({ [key]: value });
    },
    findEmbeddedMediaForSource(source_media) {
      if (!source_media || this.table_source_medias.length === 0) return;

      for (const table_source_media of this.table_source_medias) {
        if (!table_source_media?._media) continue;
        if (this.sourceMediaMatches(source_media, table_source_media)) {
          debugger;
          return table_source_media._media;
        }
      }
    },
    sourceMediaMatches(source_media_a, source_media_b) {
      if (!source_media_a || !source_media_b) return false;
      if (
        source_media_a.meta_filename_in_project &&
        source_media_b.meta_filename_in_project &&
        source_media_a.meta_filename_in_project ===
          source_media_b.meta_filename_in_project
      )
        return true;
      if (
        source_media_a.meta_filename &&
        source_media_b.meta_filename &&
        source_media_a.meta_filename === source_media_b.meta_filename
      )
        return true;
      if (
        source_media_a.path &&
        source_media_b.path &&
        source_media_a.path === source_media_b.path
      )
        return true;
      return false;
    },
    createText() {
      this.emitUpdatedCell({
        content_type: "text",
        source_medias: [],
        media_width: null,
      });
      setTimeout(() => {
        this.$refs.text_editor?.enableEditMode();
      }, 200);
    },
    async pickMediaForCell(medias) {
      const media = medias?.[0];
      if (!media || !this.table_folder_path) return;

      const import_mode = this.$root.publication_include_mode;
      const new_entry = await this.prepareMediaForPublication({
        path_to_source_media_meta: media.$path,
        publication_path: this.table_folder_path,
        import_mode,
      });
      if (!new_entry) return;

      this.emitUpdatedCell({
        content_type: media.$type,
        source_medias: [new_entry],
        media_width: null,
      });
      this.show_media_picker = false;
    },
    resetCell() {
      this.emitUpdatedCell({
        content_type: "",
        source_medias: [],
        media_width: null,
        content: "",
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._cellEdit {
  --icon-size: 1rem;
}

._cellEdit--actions {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}

._cellEdit--mediaPreview {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);
}

._cellEdit--media {
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius);
  background: var(--c-gris_clair);

  ::v-deep {
    ._mediaContent,
    img {
      width: 100%;
      height: 100%;
    }

    ._mediaContent--image,
    .plyr--video,
    .plyr__poster,
    ._mediaContent--iframe,
    ._iframeStylePreview {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      background-size: contain;
      background-position: center;
    }
  }
}

._cellEdit--mediaActions {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-end;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 4);

  @media (hover: hover) {
    ._cellEdit & {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    ._cellEdit:hover & {
      opacity: 1;
    }
  }
}

._cellEdit ::v-deep {
  ._collaborativeEditor {
    display: flex;
    gap: calc(var(--spacing) / 2);
  }

  ._floatingEditBtn {
    order: 1;
  }
}
</style>
