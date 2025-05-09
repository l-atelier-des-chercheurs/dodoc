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

    <template v-if="export_mode === 'pdf'"> </template>

    <template v-if="export_mode === 'png'">
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
    export_mode_icon() {
      if (this.export_mode === "pdf") return "file-pdf";
      if (this.export_mode === "png") return "file-earmark-image";
      if (this.export_mode === "webpage") return "window";
      return undefined;
    },
    current_page_number() {
      if (this.pane_infos?.page_id && this.publication.pages) {
        debugger;
        const page_number = this.publication.pages.findIndex(
          (p) => p.id === this.pane_infos.page_id
        );
        return page_number + 1;
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
      if (this.publication.page_spreads === true) instructions.page_width *= 2;
      this.task_instructions = instructions;
    },
  },
};
</script>
<style lang="scss" scoped></style>
