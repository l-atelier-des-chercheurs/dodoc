<template>
  <div>
    le publication story ici
    <button type="button" @click="createMedia">Créer un média</button>
    <div v-for="file in publication.$files" :key="file.$path">
      {{ file }}
      <button type="button" @click="removeFile(file.$path)">
        Supprimer média
      </button>
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
