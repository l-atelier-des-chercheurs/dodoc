export default {
  data() {
    return {
      overflow_cells_by_chapter: {},
    };
  },
  mounted() {
    this.overflow_cells_by_chapter =
      this.$root.edition_text_overflow_cells || {};
    this.$eventHub.$on("edition.textOverflow", this.onEditionTextOverflow);
  },
  beforeDestroy() {
    this.$eventHub.$off("edition.textOverflow", this.onEditionTextOverflow);
  },
  methods: {
    onEditionTextOverflow(overflow_cells_by_chapter) {
      this.overflow_cells_by_chapter = overflow_cells_by_chapter || {};
    },
    getChapterOverflowCellIds(chapter) {
      if (!chapter?.$path) return [];
      const chapter_meta_filename = this.getFilename(chapter.$path);
      return this.overflow_cells_by_chapter[chapter_meta_filename] || [];
    },
    areaHasTextOverflow({ area_id, chapter }) {
      if (!area_id) return false;
      return this.getChapterOverflowCellIds(chapter).includes(area_id);
    },
    chainHasTextOverflow({ area_id, chapter }) {
      if (!area_id) return false;
      return this.getChapterOverflowCellIds(chapter).some(
        (cell_id) => cell_id === area_id || cell_id.startsWith(area_id)
      );
    },
  },
};
