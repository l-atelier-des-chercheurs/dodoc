<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="false"
    :isFile="true"
  >
    <!-- @submit="uploadFiles" -->
    <template slot="header">
      <span class>{{ $t("import_medias") }}</span>
    </template>

    <template slot="sidebar">
      <div>
        <UploadFile
          @close="$emit('update:selected_files', [])"
          :read_only="read_only"
          :slugFolderName="slugFolderName"
          :type="type"
          :selected_files.sync="selected_files"
        />
      </div>
    </template>

    <!-- 
    <template slot="submit_button" v-if="files_to_upload.length > 0">
      {{ $t('import_all_files') }}
    </template> 
    -->
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import UploadFile from "../subcomponents/UploadFile.vue";

export default {
  props: {
    read_only: Boolean,
    slugFolderName: String,
    type: String,
    selected_files: Array,
  },
  components: {
    Modal,
    UploadFile,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
