<template>
  <div>
    <button
      type="button"
      class="u-buttonLink"
      @click="show_download_folder = true"
    >
      <b-icon icon="download" />
      {{ $t("download") }}
    </button>

    <BaseModal2
      v-if="show_download_folder"
      :title="$t('download')"
      @close="show_download_folder = false"
    >
      <!-- {{ archive_name }} -->

      <!-- <a
        :download="archive_name"
        :href="download_url"
        target="_blank"
        class="u-buttonLink"
        v-text="archive_name"
      /> -->
      <div class="_cont">
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
              {{ $t("downloaded") }}
            </template>
          </template>
        </template>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
export default {
  props: {
    path: String,
  },
  components: {},
  data() {
    return {
      show_download_folder: false,

      download_started: false,
      is_downloading: false,
      err_code: "",
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
