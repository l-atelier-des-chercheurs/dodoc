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
        <ShowFolderSize :path="path" />
      </div>

      <template slot="footer">
        <div />
        <button
          class="u-button u-button_bleuvert"
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
import ShowFolderSize from "@/adc-core/ui/ShowFolderSize.vue";

export default {
  props: {
    button_text: String,
    modal_title: String,
    modal_instructions: String,
    path: String,
  },
  components: {
    ShowFolderSize,
  },
  data() {
    return {
      show_download_modal: false,

      download_started: false,
      is_downloading: false,
      err_code: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    showDownloadModal() {
      this.show_download_modal = true;
      this.download_started = false;
      this.is_downloading = false;
      this.err_code = "";
    },
    async startDownload() {
      this.download_started = true;
      this.is_downloading = true;

      await this.$api
        .downloadFolder({
          path: this.path,
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
