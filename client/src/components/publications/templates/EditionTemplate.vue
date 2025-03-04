<template>
  <div class="_editionTemplate">
    <splitpanes class="_splitpanes">
      <pane>
        <ChaptersSummary
          :publication="publication"
          :sections="all_chapters"
          :opened_section_meta_filename="opened_section_meta_filename"
          :can_edit="can_edit"
          @toggleSection="
            $emit('updatePane', { key: 'chapter', value: $event })
          "
        />

        <div class="_editGraphics">
          <button
            type="button"
            class="u-button u-button_bleumarine"
            @click="$emit('updatePane', { key: 'edit_graphics', value: true })"
          >
            {{ $t("graphic_styles") }}
          </button>
        </div>

        <transition name="slideupFade" mode="in-out">
          <EditGraphicStyles
            v-if="open_graphic_styles"
            :key="'edit_graphics'"
            :publication="publication"
            @close="$emit('updatePane', { key: 'edit_graphics', value: false })"
          />
          <OpenChapter
            v-else-if="open_chapter"
            :key="open_chapter.$path"
            :chapter="open_chapter"
            :can_edit="can_edit"
            :publication_path="publication.$path"
            @remove="removeChapter(open_chapter)"
            @close="$emit('updatePane', { key: 'chapter', value: false })"
          />
        </transition>
      </pane>
      <pane>
        <div class="_viewer">
          <ViewContent
            :publication="publication"
            :opened_chapter_meta_filename="opened_section_meta_filename"
            :view_mode="view_mode"
            :can_edit="can_edit"
            @openChapter="
              $emit('updatePane', { key: 'chapter', value: $event })
            "
            @changeView="
              $emit('updatePane', { key: 'view_mode', value: $event })
            "
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
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";

import ChaptersSummary from "@/components/publications/edition/ChaptersSummary.vue";
import OpenChapter from "@/components/publications/edition/OpenChapter.vue";
import ViewContent from "@/components/publications/edition/ViewContent.vue";
import EditGraphicStyles from "@/components/publications/edition/EditGraphicStyles.vue";
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
    EditGraphicStyles,
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
    return {};
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
        return chapter;
      });
    },
    opened_section_meta_filename() {
      return this.pane_infos.chapter;
    },
    open_chapter() {
      if (this.opened_section_meta_filename) {
        return this.all_chapters.find((f) =>
          f.$path.endsWith(this.opened_section_meta_filename)
        );
      }
      return false;
    },
    open_graphic_styles() {
      return this.pane_infos?.edit_graphics === true;
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
