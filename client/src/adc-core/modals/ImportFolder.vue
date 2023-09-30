<template>
  <BaseModal2 :title="modal_name" @close="$emit('close')">
    <div class="u-spacingBottom" v-if="!folder_to_import">
      <input
        type="file"
        :id="id + '-add_file'"
        name="file"
        accept=".zip"
        class="inputfile-2"
        @change="importProject($event)"
      />
      <label :for="id + '-add_file'">
        <svg width="20" height="17" viewBox="0 0 20 17">
          <path
            d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
          />
        </svg>
        {{ $t("import_zip") }}
      </label>
      <!-- <UploadFiles
        v-if="selected_files.length > 0"
        :files_to_import="selected_files"
        :path="path"
        @close="selected_files = []"
      /> -->
    </div>
    <div v-else>
      {{ $t("import_in_progress") }}
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    modal_name: String,
    path: String,
  },
  components: {},
  data() {
    return {
      error_msg: "",
      selected_files: [],
      id: `admin_images_upload_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,
      folder_to_import: undefined,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    importProject($event) {
      this.folder_to_import = Array.from($event.target.files).at(0);

      const additional_meta = {
        $admins: this.setDefaultContentAdmins(),
        $contributors: [],
      };

      this.$api.importFolder({
        path: this.path,
        filename: this.folder_to_import.name,
        file: this.folder_to_import,
        additional_meta,
        onprogress: () => {},
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
