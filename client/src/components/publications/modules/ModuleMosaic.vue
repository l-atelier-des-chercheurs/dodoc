<template>
  <div class="_moduleMosaic">
    <div class="_mediaGrid">
      <div v-for="media in source_medias" :key="media.$path">
        <MediaContent
          v-if="media"
          :file="media"
          :resolution="1600"
          :context="'full'"
        />
      </div>
    </div>
    <div></div>
    <MediaPicker
      v-if="$api.is_logged_in"
      :publication_path="publication_path"
      @selectMedia="selectMedia"
    />
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    publimodule: Object,
  },
  components: {
    MediaPicker,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    publication_path() {
      return this.publimodule.$path.substring(
        0,
        this.publimodule.$path.lastIndexOf("/")
      );
    },
    source_medias() {
      if (!this.publimodule.source_medias) return [];
      return this.publimodule.source_medias.map((path) =>
        this.getSourceMedia({ source_media_path: path })
      );
    },
  },
  methods: {
    selectMedia({ path_to_source_media }) {
      const source_medias = this.publimodule.source_medias.slice();
      source_medias.push(path_to_source_media);
      this.$emit("updateMeta", { source_medias });
    },
  },
};
</script>
<style lang="scss" scoped>
._moduleMosaic {
}
._mediaGrid {
  display: flex;
  flex-flow: row nowrap;
}
</style>
