<template>
  <BaseModal2 :title="modal_title" @close="$emit('close')">
    <div class="u-spacingBottom">
      <DLabel :str="$t('document_type')" />
      <RadioCheckboxInput
        :value.sync="export_mode"
        :options="export_options"
        :can_edit="true"
      />
    </div>

    <div v-if="has_free_page_format" class="u-spacingBottom">
      <DLabel :str="$t('format')" />
      <div class="u-inputGroup">
        <select v-model="page_format">
          <option
            v-for="name in Object.keys(iso_formats)"
            :key="name"
            :value="name"
          >
            {{ name }}
          </option>
        </select>
        <select v-model="page_orientation">
          <option value="portrait">{{ $t("portrait") }}</option>
          <option value="landscape">{{ $t("landscape") }}</option>
        </select>
      </div>
    </div>

    <template v-if="can_impose_booklet">
      <div class="u-spacingBottom">
        <ToggleInput
          :content.sync="impose_booklet"
          :label="$t('booklet_imposition')"
          :options="{
            true: $t('booklet_imposition_explanations'),
          }"
        />
      </div>
      <div v-if="impose_booklet" class="u-spacingBottom">
        <DLabel :str="$t('pages_per_signature')" />
        <select v-model.number="signature_size">
          <option :value="0">{{ $t("single_signature") }}</option>
          <option v-for="size in signature_sizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
      <BookletImpositionSchema
        v-if="impose_booklet && page_count > 0"
        class="u-spacingBottom"
        :page_count="page_count"
        :signature_size="signature_size"
        :page_width="page_width"
        :page_height="page_height"
      />
    </template>

    <template
      v-if="
        export_mode === 'pdf' &&
        ['page_by_page', 'edition'].includes(publication.template) &&
        page_count > 1 &&
        !impose_booklet
      "
    >
      <DLabel
        :str="!is_spread ? $t('pages_to_export') : $t('spreads_to_export')"
      />
      <div class="u-inputGroup">
        <select v-model="pdf_pages_to_export_mode">
          <option value="all">
            {{ !is_spread ? $t("all_pages") : $t("all_spreads") }}
          </option>
          <option
            v-if="
              (!is_spread && current_page_number !== false) ||
              (is_spread && current_spread_number !== false)
            "
            value="current"
          >
            {{ current_info }}
          </option>
          <option value="custom">{{ $t("custom") }}</option>
        </select>

        <input
          v-if="pdf_pages_to_export_mode === 'custom'"
          size="large"
          type="text"
          v-model="specific_pdf_page_or_spread_to_export"
          :placeholder="
            !is_spread
              ? $t('page_number_or_interval')
              : $t('spread_number_or_interval')
          "
        />
      </div>

      <div
        class="u-instructions"
        v-if="pdf_pages_to_export_mode === 'custom' && page_count"
      >
        <template v-if="is_spread">
          {{
            $t("total_number_of_spreads_in_publication", {
              total: total_number_of_spreads,
            })
          }}
        </template>
        <template v-else>
          {{
            $t("total_number_of_pages_in_publication", {
              total: page_count,
            })
          }}
        </template>
      </div>
    </template>

    <template v-if="can_pick_image_quality">
      <div class="u-spacingBottom" />
      <DLabel :str="$t('embedded_images_quality')" />
      <select v-model="image_quality">
        <option value="high">{{ $t("image_quality_high") }}</option>
        <option value="medium">{{ $t("image_quality_medium") }}</option>
        <option value="source">{{ $t("image_quality_source") }}</option>
      </select>
      <div class="u-instructions">
        {{ $t("image_quality_source_instructions") }}
      </div>
    </template>

    <template v-if="export_mode === 'png' && page_count > 1">
      <template
        v-if="['page_by_page', 'edition'].includes(publication.template)"
      >
        <div class="u-spacingBottom" />

        <div class="">
          <DLabel :str="$t('page_to_export')" />
          <select v-model="page_to_export_as_image">
            <option
              v-for="(a, i) in new Array(page_count)"
              :key="i + 1"
              :value="i + 1"
              v-text="makePageNumber(i + 1)"
            />
          </select>
        </div>
      </template>
    </template>

    <template slot="footer">
      <div />
      <button
        type="button"
        class="u-button u-button_bleuvert"
        @click="exportPublication(export_mode)"
      >
        <b-icon :icon="export_mode_icon" />
        {{ $t("create") }}
      </button>
    </template>

    <ExportItemAndSaveOrDownload
      v-if="task_instructions"
      :publication_path="publication.$path"
      :can_save_to_project="can_save_to_project"
      :instructions="task_instructions"
      :title="task_title"
      @close="task_instructions = false"
    />
  </BaseModal2>
</template>
<script>
import ExportItemAndSaveOrDownload from "@/components/publications/ExportItemAndSaveOrDownload.vue";
import BookletImpositionSchema from "@/components/publications/BookletImpositionSchema.vue";
import { resolveAppPublicOrigin } from "@/utils/app_public_url.js";

export default {
  props: {
    modal_title: String,
    publication: Object,
    pane_infos: Object,
    can_save_to_project: Boolean,
  },
  components: {
    ExportItemAndSaveOrDownload,
    BookletImpositionSchema,
  },
  data() {
    return {
      task_instructions: false,
      task_title: "",
      page_to_export_as_image: 1,
      pdf_pages_to_export_mode: "all",
      specific_pdf_page_or_spread_to_export: "",
      impose_booklet: false,
      signature_size: 0,
      signature_sizes: [4, 8, 12, 16, 20, 24, 28, 32],
      image_quality: "high",

      iso_formats: {
        A3: [297, 420],
        A4: [210, 297],
        A5: [148, 210],
        A6: [105, 148],
      },
      page_format: "A4",
      page_orientation: "portrait",

      page_width: this.publication.page_width || 210,
      page_height: this.publication.page_height || 297,

      export_mode: "pdf",
      export_options: [
        {
          key: "pdf",
          label: this.$t("pdf"),
        },
        {
          key: "png",
          label: this.$t("image"),
        },
        {
          key: "webpage",
          label: this.$t("webpage"),
        },
      ],
    };
  },
  created() {
    if (this.has_free_page_format) this.applyPageFormat();
    this.publication_ratio = this.page_height / this.page_width;
    this.page_to_export_as_image = this.current_page_number || 1;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    page_format() {
      this.applyPageFormat();
    },
    page_orientation() {
      this.applyPageFormat();
    },
  },
  computed: {
    available_export_options() {
      return this.export_options;
    },
    page_count() {
      if (this.publication.template === "edition")
        return this.publication.number_of_book_pages || 0;
      return this.publication.pages?.length || 0;
    },
    is_spread() {
      return this.publication.page_spreads === true;
    },
    // templates without a fixed page size: the format is chosen at export
    has_free_page_format() {
      return (
        this.export_mode === "pdf" &&
        ["story", "story_with_sections", "cartography"].includes(
          this.publication.template
        )
      );
    },
    can_impose_booklet() {
      return (
        this.export_mode === "pdf" &&
        [
          "page_by_page",
          "edition",
          "story",
          "story_with_sections",
          "cartography",
        ].includes(this.publication.template) &&
        (this.publication.layout_mode || "print") === "print"
      );
    },
    can_pick_image_quality() {
      return this.export_mode === "pdf";
    },
    export_mode_icon() {
      if (this.export_mode === "pdf") return "file-pdf";
      if (this.export_mode === "png") return "file-earmark-image";
      if (this.export_mode === "webpage") return "window";
      return undefined;
    },
    current_page_number() {
      if (this.pane_infos?.page_id && this.publication.pages) {
        const page_number = this.publication.pages.findIndex(
          (p) => p.id === this.pane_infos.page_id
        );
        return page_number + 1;
      }
      return false;
    },
    total_number_of_spreads() {
      if (!this.page_count) return false;
      return Math.floor(this.page_count / 2) + 1;
    },
    current_spread_number() {
      if (this.pane_infos?.page_id && this.publication.page_spreads) {
        const page_number = this.publication.pages.findIndex(
          (p) => p.id === this.pane_infos.page_id
        );
        // page 0 = spread = 1
        // page 1 = spread = 2
        // page 2 = spread = 2
        // page 3 = spread = 3
        // page 4 = spread = 3
        // page 5 = spread = 4
        // page 6 = spread = 4
        return Math.floor((page_number + 1) / 2) + 1;
      }
      return false;
    },
    url_to_print_from() {
      const route = this.$router.resolve({
        path: this.createURLFromPath(this.publication.$path),
      });
      return resolveAppPublicOrigin() + route.href;
    },
    current_info() {
      let html = this.$t("current_f") + " (";
      html += this.is_spread
        ? this.$t("spread").toLowerCase()
        : this.$t("page").toLowerCase();
      html +=
        " " +
        (this.is_spread
          ? this.current_spread_number
          : this.current_page_number) +
        ")";
      return html;
    },
  },
  methods: {
    applyPageFormat() {
      const [short, long] = this.iso_formats[this.page_format];
      const landscape = this.page_orientation === "landscape";
      this.page_width = landscape ? long : short;
      this.page_height = landscape ? short : long;
    },
    makePageNumber(i) {
      if (this.current_page_number === i) return `• ${i}`;
      return i;
    },
    pageCountForPrintExport(url_query) {
      const page = url_query?.page;
      if (page == null || page === "") return undefined;
      const page_str = String(page);
      if (page_str.includes("-")) {
        const [start, end] = page_str.split("-");
        return Number(end) - Number(start) + 1;
      }
      return 1;
    },
    // returns [first_page, last_page] from a "n" or "a-b" page query,
    // converting spread numbers to page numbers for PDF exports
    pageRangeFromQuery(page, export_type) {
      if (page == null || page === "") return false;
      const [start, end = start] = String(page).split("-").map(Number);
      if (!Number.isInteger(start) || !Number.isInteger(end)) return false;
      if (this.is_spread && export_type === "pdf") {
        // spread 1 = page 1, spread n = pages 2n-2 and 2n-1
        const first_page = Math.max(1, 2 * start - 2);
        let last_page = 2 * end - 1;
        if (this.page_count) last_page = Math.min(last_page, this.page_count);
        return [first_page, last_page];
      }
      return [start, end];
    },
    makeTaskTitle(export_type, page_range) {
      if (export_type === "webpage") return this.$t("webpage");
      if (export_type === "png") {
        if (!page_range) return this.$t("image");
        return this.$t("image_of_page", { page: page_range[0] });
      }
      if (!page_range) return this.$t("pdf");
      const [start, end] = page_range;
      if (start === end) return this.$t("pdf_of_page", { page: start });
      return this.$t("pdf_of_pages", { start, end });
    },
    async exportPublication(export_type) {
      const additional_meta = {};
      additional_meta.$origin = "publish";
      additional_meta.$credits = this.$t("created_by_publication", {
        publication_title: this.publication.title,
      });
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      let instructions = {
        recipe: export_type,
        page_width: this.page_width,
        page_height: this.page_height,
        layout_mode: this.publication.layout_mode || "print",
        suggested_file_name: this.publication.title,
        additional_meta,
      };

      if (export_type === "webpage") instructions.layout_mode = "screen";

      const url_query = {};
      if (this.publication.template === "edition") {
        url_query.view_mode = "book";
        if (this.pane_infos?.style) url_query.style = this.pane_infos.style;
      }
      if (this.can_pick_image_quality)
        url_query.image_quality = this.image_quality;
      if (this.publication.template === "cartography") {
        url_query.display = "all";
        if (this.pane_infos?.view) url_query.view = this.pane_infos.view;
      }
      if (
        ["page_by_page", "edition"].includes(this.publication.template) &&
        this.export_mode === "png"
      ) {
        url_query.page = String(this.page_to_export_as_image);
      }
      if (this.can_impose_booklet && this.impose_booklet) {
        url_query.single_pages = "true";
        instructions.url_query = url_query;
        instructions.imposition = {
          mode: "booklet",
          signature_size: this.signature_size,
        };
        instructions.suggested_file_name += "-imp";
        this.task_title = this.$t("pdf_with_imposition");
        this.task_instructions = instructions;
        return;
      }
      if (this.export_mode === "pdf") {
        if (this.pdf_pages_to_export_mode === "current") {
          url_query.page = String(
            !this.is_spread
              ? this.current_page_number
              : this.current_spread_number
          );
        } else if (this.pdf_pages_to_export_mode === "custom") {
          url_query.page = this.specific_pdf_page_or_spread_to_export;
        }
      }
      instructions.url_query = url_query;
      instructions.page_count = this.pageCountForPrintExport(url_query);

      const page_range = this.pageRangeFromQuery(url_query.page, export_type);
      if (page_range) {
        const [start, end] = page_range;
        instructions.suggested_file_name +=
          start === end ? `-p${start}` : `-p${start}-${end}`;
      }
      this.task_title = this.makeTaskTitle(export_type, page_range);

      if (this.is_spread) instructions.page_width *= 2;
      this.task_instructions = instructions;
    },
  },
};
</script>
<style lang="scss" scoped></style>
