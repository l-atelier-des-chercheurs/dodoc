<template>
  <div class="_errorBar">
    <span v-if="issue_list.length === 0">
      {{ $t("edition_no_errors") }}
    </span>
    <button
      v-for="issue in issue_list"
      :key="issue.id"
      type="button"
      class="u-button u-button_red u-button_small _errorBar--btn"
      @click="openIssueChapter(issue)"
    >
      {{ issue.label }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    all_chapters: {
      type: Array,
      required: true,
    },
    publication: {
      type: Object,
      required: true,
    },
    content_html: {
      type: String,
      required: true,
    },
    view_mode: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      issue_list: [],
      error_observer: null,
    };
  },
  mounted() {
    this.setupErrorObserver();
    this.scheduleIssuesRefresh();
  },
  beforeDestroy() {
    this.teardownErrorObserver();
  },
  watch: {
    content_html() {
      this.scheduleIssuesRefresh();
    },
    view_mode() {
      this.scheduleIssuesRefresh();
    },
    all_chapters: {
      handler() {
        this.scheduleIssuesRefresh();
      },
      deep: true,
    },
  },
  computed: {
    chapter_index_by_meta() {
      return this.all_chapters.reduce((acc, chapter, index) => {
        const chapter_meta_filename = this.getFilename(chapter.$path);
        acc[chapter_meta_filename] = index + 1;
        return acc;
      }, {});
    },
  },
  methods: {
    openIssueChapter(issue) {
      if (!issue?.chapter_meta_filename) return;
      this.$emit("openChapter", issue.chapter_meta_filename);
    },
    getContentEl() {
      const view_content_el = this.$el?.closest("._viewContent");
      return view_content_el?.querySelector("._viewContent--content");
    },
    setupErrorObserver() {
      this.teardownErrorObserver();
      const content_el = this.getContentEl();
      if (!content_el) return;

      this.error_observer = new MutationObserver(() => {
        this.refreshIssues();
      });
      this.error_observer.observe(content_el, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    },
    teardownErrorObserver() {
      if (!this.error_observer) return;
      this.error_observer.disconnect();
      this.error_observer = null;
    },
    scheduleIssuesRefresh() {
      this.$nextTick(() => {
        this.refreshIssues();
        setTimeout(() => this.refreshIssues(), 150);
      });
    },
    refreshIssues() {
      const issues = [];
      const added_issue_ids = new Set();
      this.collectMissingMediaIssues(issues, added_issue_ids);
      this.collectTextOverflowIssues(issues, added_issue_ids);
      issues.sort((a, b) => {
        if (a.chapter_number !== b.chapter_number) {
          return a.chapter_number - b.chapter_number;
        }
        return a.label.localeCompare(b.label);
      });
      this.issue_list = issues;
    },
    collectMissingMediaIssues(issues, added_issue_ids) {
      this.all_chapters.forEach((chapter, chapter_index) => {
        const chapter_number = chapter_index + 1;
        const chapter_meta_filename = this.getFilename(chapter.$path);

        if (chapter._main_text?.$content) {
          const missing_refs = this.findMissingRefsInText({
            text_content: chapter._main_text.$content,
            source_medias: chapter.source_medias,
          });
          missing_refs.forEach((reference) => {
            const error_detail = this.$t("edition_error_media_not_found", {
              reference,
            });
            this.pushIssue({
              issues,
              added_issue_ids,
              chapter_meta_filename,
              chapter_number,
              error_detail,
              issue_id: `${chapter_meta_filename}::missing_ref::${reference}`,
            });
          });
        }

        if (chapter.section_type === "grid") {
          (chapter.grid_areas || []).forEach((area) => {
            const source_media = area?.source_medias?.[0];
            if (!source_media) return;
            const media = this.getSourceMedia({
              source_media,
              folder_path: this.publication.$path,
            });
            const local_media = chapter?.source_medias?.find(
              (sm) =>
                sm?.meta_filename_in_project ===
                source_media?.meta_filename_in_project
            )?._media;
            const resolved_media = media || local_media;

            if (!resolved_media || resolved_media?.$status === "missing") {
              const reference =
                source_media.meta_filename_in_project ||
                source_media.meta_filename ||
                this.$t("unknown_media_reference");
              const cell_id = area?.id || "?";
              const error_detail = this.$t(
                "edition_error_media_not_found_on_cell",
                {
                  reference,
                  cell_id,
                }
              );
              this.pushIssue({
                issues,
                added_issue_ids,
                chapter_meta_filename,
                chapter_number,
                error_detail,
                issue_id: `${chapter_meta_filename}::missing_grid::${cell_id}::${reference}`,
              });
            }

            if (
              resolved_media?.$type === "text" &&
              resolved_media?.$content?.length > 0
            ) {
              const missing_refs = this.findMissingRefsInText({
                text_content: resolved_media.$content,
                source_medias: resolved_media.source_medias,
              });
              missing_refs.forEach((reference) => {
                const cell_id = area?.id || "?";
                const error_detail = this.$t(
                  "edition_error_media_not_found_on_cell",
                  {
                    reference,
                    cell_id,
                  }
                );
                this.pushIssue({
                  issues,
                  added_issue_ids,
                  chapter_meta_filename,
                  chapter_number,
                  error_detail,
                  issue_id: `${chapter_meta_filename}::missing_grid_text_ref::${cell_id}::${reference}`,
                });
              });
            }
          });
        }
      });
    },
    collectTextOverflowIssues(issues, added_issue_ids) {
      const content_el = this.getContentEl();
      if (!content_el) return;

      const overflow_cells = content_el.querySelectorAll(".has--textOverflow");
      overflow_cells.forEach((cell) => {
        const chapter_el = cell.closest(".chapter[data-chapter-meta-filename]");
        if (!chapter_el) return;
        const chapter_meta_filename = chapter_el.getAttribute(
          "data-chapter-meta-filename"
        );
        if (!chapter_meta_filename) return;

        const chapter_number =
          this.chapter_index_by_meta[chapter_meta_filename];
        const cell_id = this.getGridCellId(cell);
        const error_detail = this.$t("edition_error_text_overflow_on_cell", {
          cell_id,
        });
        this.pushIssue({
          issues,
          added_issue_ids,
          chapter_meta_filename,
          chapter_number,
          error_detail,
          issue_id: `${chapter_meta_filename}::overflow::${cell_id}`,
        });
      });
    },
    getGridCellId(cell) {
      const base_cell_id = cell.getAttribute("data-grid-area-id") || "?";
      const chain_index = cell.getAttribute("data-grid-area-is-chain-index");
      if (!chain_index || chain_index === "0") return base_cell_id;
      return `${base_cell_id}${chain_index}`;
    },
    findMissingRefsInText({ text_content, source_medias = [] }) {
      const references = this.extractMediaReferences(text_content);
      return references
        .filter((reference) => {
          const media = this.getMediaSrc(reference.meta_src, source_medias);
          return !media || media?.$status === "missing";
        })
        .map((reference) => reference.display_text);
    },
    extractMediaReferences(text_content = "") {
      const refs = [];
      const known_refs = new Set();

      const addReference = ({ key, meta_src, display_text }) => {
        if (!meta_src || known_refs.has(key)) return;
        known_refs.add(key);
        refs.push({
          meta_src,
          display_text,
        });
      };

      const media_tag_regex =
        /\((image|video|audio|pdf|embed)\s*:\s*([^)]+)\)/gi;
      let media_match = null;
      while ((media_match = media_tag_regex.exec(text_content)) !== null) {
        const media_type = media_match[1].toLowerCase();
        const meta_src = media_match[2].trim();
        addReference({
          key: `tag::${media_type}::${meta_src}`,
          meta_src,
          display_text: `${media_type}: ${meta_src}`,
        });
      }

      const markdown_image_regex = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
      let markdown_match = null;
      while (
        (markdown_match = markdown_image_regex.exec(text_content)) !== null
      ) {
        const meta_src = markdown_match[1].trim();
        addReference({
          key: `markdown::${meta_src}`,
          meta_src,
          display_text: meta_src,
        });
      }

      return refs;
    },
    getMediaSrc(meta_src, source_medias) {
      if (!meta_src) return;

      let source_media;

      if (meta_src.startsWith("./")) {
        meta_src = meta_src.substring(2);
        source_media = {
          meta_filename: meta_src,
        };
      } else if (meta_src.startsWith("../")) {
        meta_src = meta_src.substring(3);
        source_media = {
          meta_filename_in_project: meta_src,
        };
      } else {
        source_media = {
          meta_filename_in_project: meta_src,
        };
      }

      let media = this.getSourceMedia({
        source_media,
        folder_path: this.publication.$path,
      });

      if (!media && source_medias?.length > 0) {
        const local_media = source_medias.find(
          (sm) => sm.meta_filename_in_project === meta_src
        );
        if (local_media) media = local_media._media;
      }

      if (!media) return;

      return media;
    },
    pushIssue({
      issues,
      added_issue_ids,
      chapter_meta_filename,
      chapter_number,
      error_detail,
      issue_id,
    }) {
      if (!chapter_meta_filename || !chapter_number || !issue_id) return;
      if (added_issue_ids.has(issue_id)) return;
      added_issue_ids.add(issue_id);
      issues.push({
        id: issue_id,
        chapter_meta_filename,
        chapter_number,
        error_detail,
        label: this.$t("edition_error_on_chapter", {
          chapter_number,
          error_detail,
        }),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
._errorBar {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
  margin: calc(var(--spacing) / 2);
  max-width: min(70ch, calc(100% - var(--spacing)));
  max-height: 45%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  gap: calc(var(--spacing) / 4);
}

._errorBar--btn {
  text-align: left;
}
</style>
