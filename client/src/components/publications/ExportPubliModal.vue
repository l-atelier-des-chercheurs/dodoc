<template>
  <BaseModal2 :title="$t('export_publi')" @close="$emit('close')">
    <div>
      <div class="u-spacingBottom">
        <DLabel :str="$t('document_type')" />
        <RadioCheckboxInput
          :value.sync="export_mode"
          :options="export_options"
          :can_edit="true"
        />
      </div>

      <template v-if="export_mode === 'pdf'">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="exportPublication('pdf')"
        >
          <sl-icon name="filetype-pdf" />
          {{ $t("create") }}
        </button>
      </template>
      <template v-else-if="export_mode === 'png'">
        <template v-if="publication.template === 'page_by_page'">
          <div class="u-spacingBottom">
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

        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="exportPublication('png')"
        >
          <b-icon icon="file-earmark-image" />
          {{ $t("create") }}
        </button>
      </template>
    </div>
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
      ],
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
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
      if (this.publication.template === "page_by_page")
        instructions.page = this.page_to_export_as_image;
      if (this.publication.page_spreads === true) instructions.page_width *= 2;
      this.task_instructions = instructions;
    },
  },
};
</script>
<style lang="scss" scoped></style>
