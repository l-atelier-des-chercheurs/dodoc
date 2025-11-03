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

    <template
      v-if="
        export_mode === 'pdf' &&
        ['page_by_page', 'edition'].includes(publication.template) &&
        publication.pages.length > 1
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
        v-if="pdf_pages_to_export_mode === 'custom' && total_number_of_pages"
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
              total: total_number_of_pages,
            })
          }}
        </template>
      </div>
    </template>

    <template v-if="export_mode === 'png' && publication.pages.length > 1">
      <template v-if="publication.template === 'page_by_page'">
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
      :instructions="task_instructions"
      @close="task_instructions = false"
    />
  </BaseModal2>
</template>
<script>
import ExportItemAndSaveOrDownload from "@/components/publications/ExportItemAndSaveOrDownload.vue";

export default {
  props: {
    modal_title: String,
    publication: Object,
    pane_infos: Object,
  },
  components: {
    ExportItemAndSaveOrDownload,
  },
  data() {
    return {
      task_instructions: false,
      page_to_export_as_image: 1,
      pdf_pages_to_export_mode: "all",
      specific_pdf_page_or_spread_to_export: "",

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
    this.publication_ratio = this.page_height / this.page_width;
    this.page_to_export_as_image = this.current_page_number || 1;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    page_count() {
      return this.publication.pages.length;
    },
    is_spread() {
      return this.publication.page_spreads === true;
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
    total_number_of_pages() {
      if (!this.publication.pages) return false;
      return this.publication.pages.length;
    },
    total_number_of_spreads() {
      if (!this.total_number_of_pages) return false;
      return Math.floor(this.total_number_of_pages / 2) + 1;
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
    custom_resolution_unit() {
      if (
        this.publication.layout_mode === "print" ||
        this.publication.template === "edition"
      )
        return "mm";
      return "px";
    },
    url_to_print_from() {
      const route = this.$router.resolve({
        path: this.createURLFromPath(this.publication.$path),
      });
      return window.location.origin + route.href;
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
    makePageNumber(i) {
      if (this.current_page_number === i) return `• ${i}`;
      return i;
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
      if (
        this.publication.template === "page_by_page" &&
        this.export_mode === "png"
      )
        instructions.page = this.page_to_export_as_image;

      if (this.export_mode === "pdf") {
        if (this.pdf_pages_to_export_mode === "current")
          instructions.page = !this.is_spread
            ? this.current_page_number
            : this.current_spread_number;
        else if (this.pdf_pages_to_export_mode === "custom")
          instructions.page = this.specific_pdf_page_or_spread_to_export;
        else instructions.page = "1-" + this.total_number_of_pages;
      }

      if (this.is_spread) instructions.page_width *= 2;
      this.task_instructions = instructions;
    },
  },
};
</script>
<style lang="scss" scoped></style>
