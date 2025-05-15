<template>
  <div class="_editionTemplate">
    <splitpanes v-if="can_edit" class="_splitpanes">
      <pane v-if="show_edit_pane">
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
              :can_edit="can_edit"
              @removeChapter="removeChapter"
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
            {{ $t("graphic_styles") }}
          </button>
        </div>

        <transition name="scaleInFade_fast" mode="in-out">
          <GraphicStyles
            v-if="open_graphic_styles"
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
            :prev_section="prev_section"
            :next_section="next_section"
            :can_edit="can_edit"
            :publication_path="publication.$path"
            @remove="removeChapter(opened_chapter)"
            @close="$emit('updatePane', { key: 'chapter', value: false })"
            @prev="openChapter(-1)"
            @next="openChapter(1)"
          />
        </transition>
      </pane>
      <pane v-if="show_preview_pane">
        <div class="_viewer">
          <ViewContent
            :publication="publication"
            :opened_chapter_meta_filename="opened_section_meta_filename"
            :view_mode="view_mode"
            :opened_style_file_meta="opened_style_file_meta"
            :show_source_html.sync="show_source_html"
            :can_edit="can_edit"
            @openChapter="
              $emit('updatePane', { key: 'chapter', value: $event })
            "
            @changeView="
              $emit('updatePane', { key: 'view_mode', value: $event })
            "
            @setStyleFile="$emit('updatePane', { key: 'style', value: $event })"
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
    <ViewContent
      v-else
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
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    view_mode() {
      return this.pane_infos?.view_mode || "book";
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
    open_graphic_styles() {
      return this.pane_infos?.edit_graphics === true;
    },
    opened_style_file_meta() {
      return this.pane_infos?.style || "default";
    },
    meta_filenames_already_present() {
      let current = [],
        other = [];

      this.all_chapters.forEach((chapter) => {
        if (Array.isArray(chapter.source_medias)) {
          chapter.source_medias.forEach((sm) => {
            if (
              this.getFilename(chapter.$path) ===
              this.opened_section_meta_filename
            ) {
              current.push(sm.meta_filename_in_project);
            } else {
              other.push(sm.meta_filename_in_project);
            }
          });
        }
      });

      return [
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
    openChapter(dir) {
      const idx = this.all_chapters.findIndex((f) =>
        f.$path.endsWith(this.opened_section_meta_filename)
      );
      const new_idx = idx + dir;
      if (new_idx >= 0 && new_idx <= this.all_chapters.length - 1) {
        this.$emit("updatePane", {
          key: "chapter",
          value: this.all_chapters[new_idx].$path,
        });
      }
    },
    async removeChapter(chapter) {
      if (chapter._main_text) {
        await this.$api.deleteItem({
          path: chapter._main_text.$path,
        });
      }
      await this.$api.deleteItem({
        path: chapter.$path,
      });
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
