<template>
  <div class="_moduleMosaic">
    <div v-for="media in medias" :key="media.$path">
      <MediaContent
        v-if="media"
        :file="media"
        :resolution="1600"
        :context="'full'"
      />
    </div>
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
    medias: Array,
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
</style>
