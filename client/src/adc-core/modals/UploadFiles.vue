<template>
  <div class="">
    <BaseModal2
      :title="$t('import')"
      :confirm_before_closing="confirm_before_closing"
      size="large"
      @close="$emit('close')"
    >
      <DLabel
        :str="
          $tc('files_being_sent', number_of_files_not_yet_sent, {
            count: number_of_files_not_yet_sent,
          })
        "
      />

      <transition-group class="_uploadFiles" name="listComplete" appear>
        <UploadFile
          v-for="(file, index) in files_to_upload"
          :key="file.name"
          :file="file"
          :path="path"
          :index_indicator="index + 1 + '/' + files_to_upload.length"
          :allow_caption_edition="allow_caption_edition"
          ref="filesList"
          @skip="abortFile(index)"
          @hide="hideFile(index)"
          @uploaded="fileUploaded"
        />
      </transition-group>

      <template #footer>
        <div />
        <button
          type="button"
          class="u-button"
          @click="$emit('close')"
          :class="{
            'u-button_red': confirm_before_closing,
          }"
        >
          <!-- <template v-if="files_to_upload.length > 0">
            {{ $t("cancel") }}
          </template>
          <template v-else> -->
          {{ confirm_before_closing ? $t("interrupt") : $t("close") }}
          <!-- </template> -->
        </button>
      </template>
    </BaseModal2>
  </div>
</template>
<script>
import UploadFile from "@/adc-core/inputs/UploadFile.vue";

export default {
  props: {
    files_to_import: Array,
    path: String,
    allow_caption_edition: Boolean,
  },
  components: {
    UploadFile,
  },
  data() {
    return {
      files_to_upload: this.files_to_import || [],
      upload_percentages: 0,
      list_of_added_metas: [],
      list_of_added_files: [],
    };
  },
  watch: {
    files_to_upload: {
      handler() {
        if (this.files_to_upload.length === 0) {
          this.$emit("close");
        }
      },
      deep: true,
    },
  },
  created() {},
  mounted() {
    setTimeout(() => {
      this.uploadAllFiles();
    }, 500);
  },
  beforeDestroy() {
    this.$emit("importedMedias", this.list_of_added_metas);
  },
  computed: {
    confirm_before_closing() {
      return this.number_of_files_not_yet_sent > 0;
    },
    number_of_files_not_yet_sent() {
      return this.files_to_upload.filter(
        (file) => !this.list_of_added_files.includes(file.name)
      ).length;
    },
  },
  methods: {
    async uploadAllFiles() {
      if (!this.$refs.filesList) return;

      for (let i = 0; i < this.$refs.filesList.length; i++) {
        const fileComponent = this.$refs.filesList[i];
        if (fileComponent.status === "waiting") {
          await fileComponent.uploadFile();
        }
      }
    },
    fileUploaded({ filename, meta_filename }) {
      if (meta_filename) this.list_of_added_metas.push(meta_filename);
      if (filename) this.list_of_added_files.push(filename);
    },
    abortFile(index) {
      this.files_to_upload.splice(index, 1);
    },
    hideFile(index) {
      this.files_to_upload.splice(index, 1);
    },
  },
};
</script>
<style lang="scss">
._uploadFiles {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1);
  padding: calc(var(--spacing) / 4) 0;
}
</style>
