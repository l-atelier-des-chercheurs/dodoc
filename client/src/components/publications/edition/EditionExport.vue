<template>
  <div class="_editionExport">
    <ViewContent
      :publication="publication"
      :opened_chapter_meta_filename="opened_chapter_meta_filename"
      :view_mode="view_mode"
      :opened_style_file_meta="opened_style_file_meta"
      :viewer_type="'div'"
      :can_edit="false"
      @openChapter="toggleChapter"
      @changeView="changeView"
      @setStyleFile="setStyleFile"
    />
  </div>
</template>
<script>
import ViewContent from "@/components/publications/edition/ViewContent.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
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
    opened_chapter_meta_filename() {
      return this.$route.query?.chapter || "";
    },
    view_mode() {
      return this.$route.query?.view_mode || "book";
    },
    opened_style_file_meta() {
      return this.$route.query?.style || "first";
    },
  },
  methods: {
    toggleChapter(chapter_meta_filename) {
      this.updatePageQuery({
        prop: "chapter",
        val: chapter_meta_filename,
      });
    },
    changeView(view_mode) {
      this.updatePageQuery({
        prop: "view_mode",
        val: view_mode,
      });
    },
    setStyleFile(style_file_meta_filename) {
      this.updatePageQuery({
        prop: "style",
        val: style_file_meta_filename,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._editionExport {
  @media screen {
    padding: 0 calc(var(--spacing) * 2);
  }
  @media print {
    // helps prevent empty page at the end of the publication in export PDF
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
