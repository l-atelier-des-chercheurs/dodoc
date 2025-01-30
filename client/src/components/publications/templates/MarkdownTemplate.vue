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
        <transition name="scaleInFade" mode="in-out">
          <OpenChapter
            v-if="open_chapter"
            :key="open_chapter.$path"
            :chapter="open_chapter"
            :can_edit="can_edit"
            @remove="removeChapter(open_chapter)"
            @close="$emit('toggleSection', null)"
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
  },
  data() {
    return {};
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
</style>
