<template>
  <div>
    // Lister medias_list

    <div class="_mediasList">
      medias_list = {{ medias_list }}
      <div v-for="meta_filename in medias_list" :key="meta_filename">
        <MediaPublication
          :publication_file="findFileFromMetaFilename(meta_filename)"
          @remove="removePublicationMedia(meta_filename)"
        />
      </div>
    </div>

    <br /><br />

    {{ publication.$files.map((f) => f.$path) }}
    <MediaPicker
      :publication_path="publication.$path"
      @selectMedia="appendMedia"
    />
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";
import MediaPublication from "@/components/publications/MediaPublication.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    MediaPicker,
    MediaPublication,
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
  computed: {
    medias_list() {
      if (
        this.publication.medias_list &&
        Array.isArray(this.publication.medias_list)
      )
        return this.publication.medias_list;
      else return [];
    },
  },
  methods: {
    async appendMedia(path) {
      let meta_filename = await this.$api
        .uploadFile({
          path: this.publication.$path,
          additional_meta: {
            path_to_source_media: path,
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const medias_list = this.medias_list.slice();
        medias_list.push(meta_filename);

        this.response = await this.$api.updateMeta({
          path: this.publication.$path,
          new_meta: {
            medias_list,
          },
        });
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
    findFileFromMetaFilename(meta_filename) {
      return this.publication.$files.find((f) => {
        const _meta_name = f.$path.substring(f.$path.lastIndexOf("/") + 1);
        return _meta_name === meta_filename;
      });
    },
    async removePublicationMedia(meta_filename) {
      let medias_list = this.medias_list.slice();
      medias_list = medias_list.filter((_mf) => _mf !== meta_filename);
      this.response = await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          medias_list,
        },
      });

      const file = this.findFileFromMetaFilename(meta_filename);
      await this.$api
        .deleteItem({
          path: file.$path,
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
