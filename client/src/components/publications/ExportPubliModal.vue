<template>
  <BaseModal2 :title="$t('export_publi')" @close="$emit('close')">
    <div class="u-spacingBottom">
      <DLabel :str="$t('document_type')" />
      <RadioCheckboxInput
        :value.sync="export_mode"
        :options="export_options"
        :can_edit="true"
      />
    </div>

    <template v-if="['pdf', 'webpage'].includes(export_mode)">
      <div slot="footer">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="exportPublication(export_mode)"
        >
          <b-icon :icon="export_mode === 'pdf' ? 'file-pdf' : 'window'" />
          {{ $t("create") }}
        </button>
      </div>
    </template>
    <template v-else-if="export_mode === 'png'">
      <template v-if="publication.template === 'page_by_page'">
        <div class="u-spacingBottom" />

        <div class="">
          <DLabel :str="$t('page_to_export')" />
          <select v-model="page_to_export_as_image">
            <option
              v-for="(a, i) in new Array(page_count)"
              :key="i + 1"
              v-text="i + 1"
            />
          </select>
        </div>
      </template>

      <div slot="footer">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="exportPublication('png')"
        >
          <b-icon icon="file-earmark-image" />
          {{ $t("create") }}
        </button>
      </div>
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
    publication: Object,
    page_opened_id: String,
  },
  components: {
    ExportItemAndSaveOrDownload,
  },
  data() {
    return {
      task_instructions: false,
      page_to_export_as_image: 1,

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
    if (this.page_opened_id && this.publication.pages) {
      const page_number = this.publication.pages.findIndex(
        (p) => p.id === this.page_opened_id
      );
      if (page_number) this.page_to_export_as_image = page_number + 1;
    }
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    page_count() {
      return this.publication.pages.length;
    },
  },
  methods: {
    async exportPublication(export_type) {
      const additional_meta = {};
      additional_meta.$origin = "publish";
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      let instructions = {
        recipe: export_type,
        page_width: this.publication.page_width,
        page_height: this.publication.page_height,
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
