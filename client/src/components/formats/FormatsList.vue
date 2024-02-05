<template>
  <div class="_formatsList">
    <div class="u-instructions">
      {{ $t("format_instr") }}
    </div>
    <div class="">
      <button
        type="button"
        class="u-button u-button_white"
        @click="show_create_format = true"
      >
        <b-icon icon="plus-circle" />&nbsp;
        {{ $t("create_a_format") }}
      </button>
      <CreateFolder
        v-if="show_create_format"
        :modal_name="$t('create_a_format')"
        :path="'formats'"
        :default_folder_status="'private'"
        @close="show_create_format = false"
        @openNew="openNewFormat"
      />
    </div>

    <div class="_list">
      <div v-for="format in formats" :key="format.$path">
        <button
          type="button"
          class="u-button u-button_black"
          @click="$emit('toggleFormat', getFilename(format.$path))"
        >
          {{ format.title }}
        </button>
      </div>
    </div>
  </div>
  <!-- </BaseModal2> -->
</template>
<script>
export default {
  props: {
    shared_folder: Object,
    shared_files: Array,
  },
  components: {},
  data() {
    return {
      show_create_format: false,
      formats: [],
      path: "formats",
    };
  },
  i18n: {
    messages: {
      fr: {
        formats: "Formats",
        create_a_format: "Créer un format",
        format_instr:
          "Les formats regroupent des médias dans l’espace partagé pour les partager.",
      },
    },
  },
  async created() {
    this.formats = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {},
  methods: {
    openNewFormat(new_folder_slug) {
      this.show_create_format = false;
      this.$emit("toggleFormat", new_folder_slug);
    },
  },
};
</script>
<style lang="scss" scoped>
._formatsList {
  > * {
    margin-bottom: calc(var(--spacing) / 2);
  }
}
._list {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
  overflow: auto;

  > * {
  }
}
</style>
