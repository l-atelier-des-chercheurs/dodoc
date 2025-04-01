<template>
  <div class="">
    <BaseModal2
      :title="$t('import')"
      :confirm_before_closing="confirm_before_closing"
      size="large"
      @close="$emit('close')"
    >
      <div class="_uploadFiles">
        <UploadFile
          v-for="(file, index) in files_to_upload"
          :key="file.name"
          :file="file"
          :path="path"
          @skip="abortFile(index)"
          @hide="hideFile(index)"
        />
      </div>
    </BaseModal2>
  </div>
</template>
<script>
import UploadFile from "@/adc-core/inputs/UploadFile.vue";

export default {
  props: {
    files_to_import: Array,
    path: String,
  },
  components: {
    UploadFile,
  },
  data() {
    return {
      files_to_upload: this.files_to_import || [],
      upload_percentages: 0,
    };
  },
  watch: {},
  created() {},
  mounted() {
    // this.sendAllFiles();
  },
  beforeDestroy() {},
  computed: {
    confirm_before_closing() {},
  },
  methods: {
    async sendAllFiles() {
      let list_of_added_metas = [];

      for (const file of this.files_to_upload) {
        const meta_filename = await this.sendThisFile(file);
        if (meta_filename) list_of_added_metas.push(meta_filename);
      }

      // TODO : if retrying sending a file we don't emit importedmedias
      this.$emit("importedMedias", list_of_added_metas);

      setTimeout(() => {
        this.$emit("close");
      }, 2000);
    },
    abortFile() {},
    hideFile() {
      this.files_to_upload = this.files_to_upload.filter(
        (file) => file.name !== file.name
      );
    },
  },
};
</script>
<style lang="scss">
._uploadFiles {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);
}
</style>
