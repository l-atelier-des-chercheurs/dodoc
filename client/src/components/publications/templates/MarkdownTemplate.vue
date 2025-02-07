<template>
  <div class="_markdownTemplate">
    <splitpanes class="_splitpanes">
      <pane>
        <ChaptersSummary
          :publication="publication"
          :sections="all_chapters"
          :opened_section_meta_filename="opened_section_meta_filename"
          :can_edit="can_edit"
          @toggleSection="$emit('toggleSection', $event)"
        />

        <div class="_editGraphics">
          <button
            type="button"
            class="u-button u-button_bleumarine"
            @click="show_edit_graphics = true"
          >
            {{ $t("styles") }}
          </button>
        </div>

        <transition name="scaleInFade" mode="in-out">
          <OpenChapter
            v-if="open_chapter"
            :key="open_chapter.$path"
            :chapter="open_chapter"
            :can_edit="can_edit"
            :publication_path="publication.$path"
            @remove="removeChapter(open_chapter)"
            @close="$emit('toggleSection', null)"
          />
          <EditGraphicStyles
            v-else-if="show_edit_graphics"
            :publication="publication"
            @close="show_edit_graphics = false"
          />
        </transition>
      </pane>
      <pane>
        <div class="_viewer">
          <ViewContent
            :publication="publication"
            :opened_chapter_meta_filename="opened_section_meta_filename"
            :can_edit="can_edit"
            @openChapter="$emit('toggleSection', $event)"
          />
        </div>
      </pane>
    </splitpanes>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";

import ChaptersSummary from "@/components/publications/markdown/ChaptersSummary.vue";
import OpenChapter from "@/components/publications/markdown/OpenChapter.vue";
import ViewContent from "@/components/publications/markdown/ViewContent.vue";
import EditGraphicStyles from "@/components/publications/markdown/EditGraphicStyles.vue";

export default {
  props: {
    publication: Object,
    opened_section_meta_filename: String,
    can_edit: Boolean,
  },
  components: {
    Splitpanes,
    Pane,
    ChaptersSummary,
    OpenChapter,
    ViewContent,
    EditGraphicStyles,
  },
  provide() {
    return {
      $getMetaFilenamesAlreadyPresent: () =>
        this.meta_filenames_already_present,
    };
  },
  data() {
    return {
      show_edit_graphics: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
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
    open_chapter() {
      if (this.opened_section_meta_filename) {
        return this.all_chapters.find((f) =>
          f.$path.endsWith(this.opened_section_meta_filename)
        );
      }
      return false;
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
._markdownTemplate {
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
