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
      {{ archive_name }}

      <!-- <a
        :download="archive_name"
        :href="download_url"
        target="_blank"
        class="u-buttonLink"
        v-text="archive_name"
      /> -->
      <button
        class="u-button u-button_red"
        type="button"
        autofocus
        @click="startDownload"
      >
        {{ $t("download") }}
      </button>
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
      start_folder_download: false,
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
    startDownload() {
      return this.$api.downloadFolder({
        path: this.path,
        filename: this.archive_name,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
