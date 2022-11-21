<template>
  <div>
    // Lister medias_list
    {{ publication.medias_list }}

    <div v-for="file in publication.$files" :key="file.$path">
      {{ file }}
      <button type="button" @click="removeFile(file.$path)">
        Supprimer média
      </button>
    </div>

    <MediaPicker :publication_path="publication.$path" />
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    MediaPicker,
  },
  data() {
    return {
      medias: [],
      fetch_publication_error: null,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createMedia() {
      await this.$api
        .uploadFile({
          path: this.publication.$path,
          additional_meta: {
            path_to_source_media: "plop",
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
    },
    async removeFile(path) {
      await this.$api
        .deleteItem({
          path,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
    },
  },
};
</script>
<style lang="scss" scoped></style>
