<template>
  <div class="_agoraExport">
    <div
      v-for="agoramodule in section_modules_list"
      :key="agoramodule.$path"
      class="_item"
    >
      <template v-if="getFirstSourceMedia(agoramodule.source_medias)">
        <MediaContent
          :file="getFirstSourceMedia(agoramodule.source_medias)"
          :resolution="1600"
          :context="'full'"
          :show_fs_button="true"
        />
      </template>
      <template v-else>
        <div>Erreur au chargement du média</div>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    publication: Object,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    first_section() {
      const sections = this.getSectionsWithProps({
        publication: this.publication,
        group: "sections_list",
      });
      return sections[0];
    },
    section_modules_list() {
      return this.getModulesForSection({
        publication: this.publication,
        section: this.first_section,
      }).map(({ _module }) => _module);
    },
  },
  methods: {
    getFirstSourceMedia(source_medias) {
      const first_source_media = source_medias[0];
      if (!first_source_media) return false;

      debugger;
      return this.getSourceMedia({
        source_media: {
          meta_filename: first_source_media.meta_filename,
        },
        folder_path: this.publication.$path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._agoraExport {
}

._item {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  padding: 10px;
  overflow: hidden;

  ::v-deep ._mediaContent {
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
    }

    ._mediaContent--image,
    .plyr--video,
    .plyr__poster,
    ._mediaContent--iframe,
    ._iframeStylePreview {
      position: absolute;
      height: 100%;
      width: 100%;
      object-fit: contain;
      background-size: contain;
    }
  }
}
</style>
