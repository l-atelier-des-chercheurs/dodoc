<template>
  <div>
    <button type="button" class="u-buttonLink" @click="showDownloadModal">
      <b-icon icon="download" />
      {{ button_text || $t("download") }}
    </button>

    <BaseModal2
      v-if="show_download_modal"
      :title="modal_title || button_text || $t('download')"
      @close="show_download_modal = false"
    >
      <div class="_cont">
        <div v-if="modal_instructions" class="u-spacingBottom">
          {{ modal_instructions }}
        </div>
        <SizeDisplay
          v-if="folder_size"
          class="u-spacingBottom"
          :size="folder_size"
        />
      </div>

      <template slot="footer">
        <button
          class="u-button u-button_red"
          type="button"
          autofocus
          v-if="!download_started"
          @click="startDownload"
        >
          {{ $t("download") }}
        </button>
        <template v-else>
          <div class="_spinner" v-if="is_downloading" key="loader">
            <LoaderSpinner />
          </div>
          <template v-else>
            <template v-if="err_code">
              {{ err_code }}
            </template>
            <template v-else>
              {{ $t("download_ready") }}
            </template>
          </template>
        </template>
      </template>
    </BaseModal2>
  </div>
</template>
<script>
export default {
  props: {
    button_text: String,
    modal_title: String,
    modal_instructions: String,
    path: String,
  },
  components: {},
  data() {
    return {
      show_download_modal: false,

      download_started: false,
      is_downloading: false,
      err_code: "",

      folder_size: undefined,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    archive_name() {
      return this.getFilename(this.path) + ".zip";
    },
  },
  methods: {
    showDownloadModal() {
      this.show_download_modal = true;
      this.download_started = false;
      this.is_downloading = false;
      this.err_code = "";
      this.folder_size = "";

      this.getFolderSize();
    },
    async getFolderSize() {
      const project = await this.$api
        .getFolder({
          path: `${this.path}`,
          detailed_infos: true,
        })
        .catch((err) => {
          err;
          // this.fetch_publication_error = err.response;
        });
      this.folder_size = project.$infos?.size;
    },
    async startDownload() {
      this.download_started = true;
      this.is_downloading = true;

      await this.$api
        .downloadFolder({
          path: this.path,
          filename: this.archive_name,
        })
        .catch((err) => {
          err;
          this.err_code = "failed_to_download";
        });
      setTimeout(() => (this.is_downloading = false), 500);
    },
  },
};
</script>
<style lang="scss" scoped>
._cont {
  position: relative;
}
</style>
