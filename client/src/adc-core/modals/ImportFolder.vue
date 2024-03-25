<template>
  <BaseModal2 :title="modal_name" @close="$emit('close')">
    <div
      class="u-instructions u-spacingBottom"
      v-html="$t('import_a_project_instr')"
    />

    <div class="" v-if="!folder_to_import">
      <input
        type="file"
        :id="id + '-add_file'"
        name="file"
        accept=".zip"
        class="inputfile-2"
        @change="importProject($event)"
      />
      <label :for="id + '-add_file'">
        <b-icon icon="upload" :label="$t('import')" />
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
      {{ $t("import_in_progress") }}<br />
      {{ transfer_percent }}%
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
      transfer_percent: undefined,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async importProject($event) {
      this.folder_to_import = Array.from($event.target.files).at(0);
      this.transfer_percent = 0;

      const additional_meta = {
        $admins: this.setDefaultContentAdmins(),
        $contributors: [],
      };

      const new_folder_slug = await this.$api.importFolder({
        path: this.path,
        filename: this.folder_to_import.name,
        file: this.folder_to_import,
        additional_meta,
        onProgress: (progressEvent) => {
          this.transfer_percent = parseInt(
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          );
        },
      });
      new_folder_slug;
      this.transfer_percent = 100;

      setTimeout(() => {
        this.$emit("close");
      }, 1000);
    },
  },
};
</script>
<style lang="scss" scoped></style>
