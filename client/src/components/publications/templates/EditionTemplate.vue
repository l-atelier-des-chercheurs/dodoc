<template>
  <div class="_editionTemplate">
    <splitpanes v-if="can_edit" class="_splitpanes">
      <pane v-if="show_edit_pane" min-size="10">
        <div class="_chapterSummary">
          <div class="_chapterSummary--content">
            <div class="_showPreviewBtn">
              <ToggleInput
                :content.sync="show_preview_pane"
                :label="$t('show_preview') + ' ➵'"
              />
            </div>

            <ChaptersSummary
              :publication="publication"
              :sections="all_chapters"
              :opened_section_meta_filename="opened_section_meta_filename"
              :view_mode="view_mode"
              :chapters_positions="chapters_positions"
              @toggleSection="
                $emit('updatePane', { key: 'chapter', value: $event })
              "
            />
          </div>
        </div>

        <div class="_editGraphics">
          <button
            type="button"
            class="u-button u-button_bleumarine"
            @click="$emit('updatePane', { key: 'edit_graphics', value: true })"
          >
            <b-icon icon="file-code" />
            {{ $t("graphic_styles") }}
          </button>
        </div>

        <transition name="pagechange" mode="in-out">
          <GraphicStyles
            v-if="show_graphic_styles"
            :key="'edit_graphics'"
            :publication="publication"
            :opened_style_file_meta="opened_style_file_meta"
            :show_source_html.sync="show_source_html"
            @close="$emit('updatePane', { key: 'edit_graphics', value: false })"
            @setStyleFile="$emit('updatePane', { key: 'style', value: $event })"
          />
          <OpenChapter
            v-else-if="opened_chapter"
            :key="opened_chapter.$path"
            :chapter="opened_chapter"
            :chapters="all_chapters"
            :prev_section="prev_section"
            :next_section="next_section"
            :publication="publication"
            :chapter_position="getChapterPosition(opened_chapter.$path)"
            :view_mode="view_mode"
            @duplicate="duplicateChapter(opened_chapter)"
            @remove="removeChapter(opened_chapter)"
            @close="closeChapter"
            @prev="openChapter(-1)"
            @next="openChapter(1)"
          />
        </transition>
      </pane>
      <pane v-if="show_preview_pane" min-size="10">
        <div class="_viewer">
          <ViewContent
            :publication="publication"
            :opened_chapter_meta_filename="opened_section_meta_filename"
            :view_mode="view_mode"
            :opened_style_file_meta="opened_style_file_meta"
            :show_source_html.sync="show_source_html"
            :show_source_html_toggle="
              can_edit && view_mode === 'book' && show_graphic_styles
            "
            :can_edit="can_edit"
            @openChapter="
              $emit('updatePane', { key: 'chapter', value: $event })
            "
            @changeView="
              $emit('updatePane', { key: 'view_mode', value: $event })
            "
            @setStyleFile="$emit('updatePane', { key: 'style', value: $event })"
            @updateChaptersPositions="chapters_positions = $event"
          />
        </div>
      </pane>
    </splitpanes>
    <PublicationSettings v-if="can_edit">
      <WidthHeightField
        :publication="publication"
        :force_layout_mode="'print'"
      />
    </PublicationSettings>

    <!-- preview mode -->
    <div class="_previewMode" v-else>
      <ViewContent
        :publication="publication"
        :opened_chapter_meta_filename="opened_section_meta_filename"
        :view_mode="view_mode"
        :opened_style_file_meta="opened_style_file_meta"
        :viewer_type="'div'"
        :can_edit="false"
        @openChapter="$emit('updatePane', { key: 'chapter', value: $event })"
        @changeView="$emit('updatePane', { key: 'view_mode', value: $event })"
        @setStyleFile="$emit('updatePane', { key: 'style', value: $event })"
      />
    </div>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";

import ChaptersSummary from "@/components/publications/edition/ChaptersSummary.vue";
import OpenChapter from "@/components/publications/edition/OpenChapter.vue";
import ViewContent from "@/components/publications/edition/ViewContent.vue";
import GraphicStyles from "@/components/publications/edition/GraphicStyles.vue";
import PublicationSettings from "@/components/publications/PublicationSettings.vue";
import WidthHeightField from "@/adc-core/fields/WidthHeightField.vue";

export default {
  props: {
    publication: Object,
    pane_infos: Object,
    can_edit: Boolean,
  },
  components: {
    Splitpanes,
    Pane,
    ChaptersSummary,
    OpenChapter,
    ViewContent,
    GraphicStyles,
    PublicationSettings,
    WidthHeightField,
  },
  provide() {
    return {
      $getMetaFilenamesAlreadyPresent: () =>
        this.meta_filenames_already_present,
    };
  },
  data() {
    return {
      show_edit_pane: true,
      show_preview_pane: true,
      show_source_html: false,
      chapters_positions: {},
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    this.$emit("updatePane", { key: "chapter", value: false });
  },
  watch: {},
  computed: {
    view_mode() {
      return this.pane_infos?.view_mode || "web";
    },
    all_chapters() {
      return this.getSectionsWithProps({
        publication: this.publication,
        group: "sections_list",
      }).map((chapter) => {
        // const associated_text = this.publication.$files.find(
        //   (f2) => f2.$path.endsWith(".md")
        // );
        if (chapter.main_text_meta) {
          chapter._main_text = this.publication.$files.find((f) =>
            f.$path.endsWith("/" + chapter.main_text_meta)
          );
        }
        if (!chapter.section_type) {
          chapter.section_type = "text";
        }

        return chapter;
      });
    },
    opened_section_meta_filename() {
      return this.pane_infos.chapter;
    },
    opened_chapter() {
      if (this.opened_section_meta_filename) {
        return this.all_chapters.find((f) =>
          f.$path.endsWith(this.opened_section_meta_filename)
        );
      }
      return false;
    },
    prev_section() {
      if (!this.opened_chapter) return false;
      const idx = this.all_chapters.findIndex((f) =>
        f.$path.endsWith(this.opened_section_meta_filename)
      );
      return this.all_chapters[idx - 1];
    },
    next_section() {
      if (!this.opened_chapter) return false;
      const idx = this.all_chapters.findIndex((f) =>
        f.$path.endsWith(this.opened_section_meta_filename)
      );
      return this.all_chapters[idx + 1];
    },
    show_graphic_styles() {
      return this.pane_infos?.edit_graphics === true;
    },
    opened_style_file_meta() {
      return this.pane_infos?.style || "default";
    },
    meta_filenames_already_present() {
      let current = [],
        other = [],
        cover = [];

      const all_medias = this.publication.$files;

      try {
        if (all_medias.find((f) => f.cover_type === "front")) {
          const cover_media = all_medias.find((f) => f.cover_type === "front");
          if (cover_media?.source_medias)
            cover.push(cover_media?.source_medias[0].meta_filename_in_project);
        }
      } catch (error) {}

      this.all_chapters.forEach((chapter) => {
        const listMediasOnMeta = (source_medias) => {
          if (!source_medias || !Array.isArray(source_medias)) return;
          source_medias.forEach((sm) => {
            if (!sm.meta_filename_in_project) return;
            if (
              this.getFilename(chapter.$path) ===
              this.opened_section_meta_filename
            ) {
              current.push(sm.meta_filename_in_project);
            } else {
              other.push(sm.meta_filename_in_project);
            }
          });
        };

        if (
          chapter.section_type === "text" &&
          Array.isArray(chapter.source_medias)
        ) {
          listMediasOnMeta(chapter.source_medias);
        } else if (
          chapter.section_type === "grid" &&
          Array.isArray(chapter.grid_areas)
        ) {
          chapter.grid_areas.forEach((area) => {
            if (area.source_medias && Array.isArray(area.source_medias)) {
              if (
                area.source_medias[0]?.hasOwnProperty(
                  "meta_filename_in_project"
                )
              ) {
                listMediasOnMeta(area.source_medias);
              } else if (
                area.source_medias[0]?.hasOwnProperty("meta_filename")
              ) {
                const text_media_in_grid_area = all_medias.find((f) =>
                  f.$path.endsWith("/" + area.source_medias[0].meta_filename)
                );
                if (text_media_in_grid_area) {
                  listMediasOnMeta(text_media_in_grid_area?.source_medias);
                }
              }
            }
          });
        }
      });

      return [
        {
          label: this.$t("on_the_cover"),
          medias: cover,
          color: "var(--c-bleuvert)",
        },
        {
          label: this.$t("in_this_section"),
          medias: current,
          color: "var(--c-orange)",
        },
        {
          label: this.$t("in_another_section"),
          medias: other,
          color: "var(--c-bleuvert)",
        },
      ];
    },
  },
  methods: {
    closeChapter() {
      this.$emit("updatePane", { key: "chapter", value: false });
    },
    openChapter(dir) {
      const idx = this.all_chapters.findIndex((f) =>
        f.$path.endsWith(this.opened_section_meta_filename)
      );
      const new_idx = idx + dir;
      if (new_idx >= 0 && new_idx <= this.all_chapters.length - 1) {
        const new_chapter_filename = this.getFilename(
          this.all_chapters[new_idx].$path
        );
        this.$emit("updatePane", {
          key: "chapter",
          value: new_chapter_filename,
        });
      }
    },
    async duplicateChapter(chapter) {
      try {
        const copied_filenames = {};
        const new_meta = {
          section_title:
            this.$t("copy_of") +
            " " +
            (chapter.section_title || this.$t("untitled")),
        };

        if (chapter.section_type === "text") {
          new_meta.source_medias = await this.duplicateSourceMedias({
            source_medias: chapter.source_medias,
            copied_filenames,
          });
          if (chapter._main_text) {
            new_meta.main_text_meta = await this.duplicateTextFile({
              text_file: chapter._main_text,
              copied_filenames,
            });
          }
        } else if (chapter.section_type === "grid") {
          new_meta.grid_areas = await this.duplicateGridAreas({
            grid_areas: chapter.grid_areas,
            copied_filenames,
          });
          new_meta.source_medias = this.getGridEmbeddedSourceMedias({
            grid_areas: new_meta.grid_areas,
          });
        } else {
          new_meta.source_medias = await this.duplicateSourceMedias({
            source_medias: chapter.source_medias,
            copied_filenames,
          });
        }

        const new_chapter_meta = await this.$api.copyFile({
          path: chapter.$path,
          new_meta,
        });

        const sections_list = this.getSectionsList({
          publication: this.publication,
          group: "sections_list",
        }).slice();
        const section_index = sections_list.findIndex(
          (s) => s.meta_filename === this.getFilename(chapter.$path)
        );
        sections_list.splice(section_index + 1, 0, {
          meta_filename: new_chapter_meta,
        });

        await this.$api.updateMeta({
          path: this.publication.$path,
          new_meta: {
            sections_list,
          },
        });

        this.$emit("updatePane", {
          key: "chapter",
          value: new_chapter_meta,
        });
      } catch (err) {
        this.$alertify.delay(4000).error(err);
      }
    },
    async duplicateLocalMedia({ meta_filename, copied_filenames }) {
      if (copied_filenames[meta_filename])
        return copied_filenames[meta_filename];

      const new_meta_filename = await this.$api.copyFile({
        path: this.publication.$path + "/" + meta_filename,
      });
      copied_filenames[meta_filename] = new_meta_filename;
      return new_meta_filename;
    },
    async duplicateSourceMedias({ source_medias, copied_filenames }) {
      if (!Array.isArray(source_medias)) return [];

      const new_source_medias = [];
      for (const source_media of source_medias) {
        const { _media, ...clean_source_media } = source_media;
        if (clean_source_media.meta_filename) {
          const new_meta_filename = await this.duplicateLocalMedia({
            meta_filename: clean_source_media.meta_filename,
            copied_filenames,
          });
          new_source_medias.push({
            ...clean_source_media,
            meta_filename: new_meta_filename,
          });
        } else {
          new_source_medias.push({ ...clean_source_media });
        }
      }
      return new_source_medias;
    },
    rewriteMarkdownMediaRefs({ content, copied_filenames }) {
      if (!content) return content;

      let rewritten = content;
      Object.entries(copied_filenames).forEach(([old_meta, new_meta]) => {
        const escaped = old_meta.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        rewritten = rewritten.replace(
          new RegExp(`(?<!\\.)\\./${escaped}`, "g"),
          `./${new_meta}`
        );
      });
      return rewritten;
    },
    async duplicateTextFile({ text_file, copied_filenames }) {
      const og_meta_filename = this.getFilename(text_file.$path);
      if (copied_filenames[og_meta_filename])
        return copied_filenames[og_meta_filename];

      const new_source_medias = await this.duplicateSourceMedias({
        source_medias: text_file.source_medias,
        copied_filenames,
      });
      const new_content = this.rewriteMarkdownMediaRefs({
        content: text_file.$content,
        copied_filenames,
      });

      const new_meta_filename = await this.$api.copyFile({
        path: text_file.$path,
      });
      copied_filenames[og_meta_filename] = new_meta_filename;

      await this.$api.updateMeta({
        path: this.publication.$path + "/" + new_meta_filename,
        new_meta: {
          $content: new_content,
          source_medias: new_source_medias,
        },
      });

      return new_meta_filename;
    },
    async duplicateGridAreas({ grid_areas, copied_filenames }) {
      if (!Array.isArray(grid_areas)) return [];

      const new_grid_areas = [];
      for (const area of grid_areas) {
        const new_area = { ...area };
        if (Array.isArray(area.source_medias) && area.source_medias.length > 0) {
          const new_source_medias = [];
          for (const source_media of area.source_medias) {
            const { _media, ...clean_source_media } = source_media;
            if (clean_source_media.meta_filename) {
              const file = this.findModuleFromMetaFilename({
                files: this.publication.$files,
                meta_filename: clean_source_media.meta_filename,
              });
              const is_text =
                file &&
                (file.$type === "text" || file.content_type === "markdown");

              const new_meta_filename = is_text
                ? await this.duplicateTextFile({
                    text_file: file,
                    copied_filenames,
                  })
                : await this.duplicateLocalMedia({
                    meta_filename: clean_source_media.meta_filename,
                    copied_filenames,
                  });

              new_source_medias.push({
                ...clean_source_media,
                meta_filename: new_meta_filename,
              });
            } else {
              new_source_medias.push({ ...clean_source_media });
            }
          }
          new_area.source_medias = new_source_medias;
        }
        new_grid_areas.push(new_area);
      }
      return new_grid_areas;
    },
    async removeChapter(chapter) {
      if (chapter._main_text) {
        await this.$api.deleteItem({
          path: chapter._main_text.$path,
        });
      }
      await this.removeSection2({
        publication: this.publication,
        group: "sections_list",
        section: chapter,
      });
    },
    getChapterPosition(chapter_path) {
      const chapter_meta_filename = this.getFilename(chapter_path);
      return this.chapters_positions[chapter_meta_filename];
    },
  },
};
</script>
<style lang="scss" scoped>
._editionTemplate {
  position: relative;
  width: 100%;
  height: 100%;
}

._splitpanes {
  position: absolute;
  height: 100%;
  width: 100%;
}

._previewMode {
  overflow: auto;
  padding: var(--spacing);
}

._chapterSummary {
  position: relative;
  height: 100%;
  overflow: auto;
  background-color: var(--c-gris_clair);
  padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2);
}
._chapterSummary--content {
  margin: 0 auto;
  max-width: 640px;
}
._showPreviewBtn {
  display: flex;
  justify-content: flex-end;
  margin-bottom: calc(var(--spacing) * 1);
}
._viewer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: auto;
}
._editGraphics {
  position: absolute;
  z-index: 10;
  width: 100%;
  bottom: 0;
  left: 0;
  padding: calc(var(--spacing) * 1);
  text-align: center;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}
</style>
