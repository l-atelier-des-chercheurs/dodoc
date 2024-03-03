<template>
  <BaseModal2 :title="$t('export_publi')" @close="$emit('close')">
    <button
      type="button"
      class="u-buttonLink _exportBtn"
      :disabled="is_exporting"
      @click="exportPublication"
    >
      <sl-icon name="filetype-pdf" />
      {{ $t("export_in_pdf") }}
    </button>

    <transition name="fade_fast" :duration="150" mode="out-in">
      <LoaderSpinner v-if="is_exporting" />
    </transition>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    publication: Object,
  },
  components: {},
  data() {
    return {
      is_exporting: false,
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
  computed: {},
  methods: {
    async exportPublication() {
      const additional_meta = {};
      additional_meta.$origin = "publish";
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      let instructions = {
        recipe: "pdf",
        page_width: this.publication.page_width,
        page_height: this.publication.page_height,
        layout_mode: this.publication.layout_mode || "print",
        suggested_file_name: this.publication.title,
        additional_meta,
      };

      if (this.publication.page_spreads === true) instructions.page_width *= 2;

      const current_task_id = await this.$api.exportFolder({
        path: this.publication.$path,
        instructions,
      });
      this.$alertify.delay(4000).log(this.$t("compilation_started"));

      this.is_exporting = true;

      const checkIfEnded = ({ task_id }) => {
        if (task_id !== current_task_id) return;
        this.is_exporting = false;
        this.$eventHub.$off("task.ended", checkIfEnded);
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
  },
};
</script>
<style lang="scss" scoped></style>
