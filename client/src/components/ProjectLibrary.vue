<template>
  <div>
    <button type="button" @click="createText">Créer du texte</button>
    <button type="button" @click="createLink">Créer un lien</button>
    <button type="button" @click="loadLibrary">Charger la bibliothèque</button>
    {{ all_files.length }}
    <div class="_lib">
      <div v-for="file of all_files" :key="file.slug">
        <MediaCard :file="file" :project_slug="project_slug" />
      </div>
    </div>
  </div>
</template>
<script>
import MediaCard from "@/components/MediaCard.vue";

export default {
  props: {
    project_slug: String,
    project: Object,
  },
  components: {
    MediaCard,
  },
  data() {
    return {
      fetch_status: null,
      fetch_error: null,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    all_files() {
      return this.project.files || [];
    },
  },
  methods: {
    // async loadLibrary() {
    //   this.fetch_status = "pending";
    //   this.fetch_error = null;

    //   try {
    //     const response = await this.$axios.get(
    //       `/projects/${this.project_slug}`
    //     );

    //     const project_index = window.store.projects.findIndex(
    //       (project) => project.slug === this.project_slug
    //     );
    //     this.$set(window.store.projects[project_index], "files", response.data);

    //     this.fetch_status = "success";
    //   } catch (e) {
    //     this.fetch_status = "error";
    //     this.fetch_error = e.response.data;
    //   }
    // },
    subscribeToProject() {},

    async createText() {
      const filename = "texte.txt";
      const content = "PLOP PLIP";

      const additional_meta = {
        caption: "plip",
      };

      this.uploadText({ filename, content, additional_meta });
    },

    async createLink() {
      const filename = "mon-lien.txt";
      const content = "https://www.plurality-university.org/";

      const additional_meta = {
        type: "url",
        caption: "plop",
      };

      this.uploadText({ filename, content, additional_meta });
    },

    async uploadText({ filename, content, additional_meta }) {
      let formData = new FormData();

      const _file_to_upload = new Blob([content], { type: "text/plain" });
      formData.append("file", _file_to_upload, filename);

      if (additional_meta)
        formData.append(filename, JSON.stringify(additional_meta));

      const path = `/projects/${this.project_slug}/_upload`;

      let res = await this.$axios
        .post(path, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          this.files_to_upload_meta[filename].status = "failed";
          this.files_to_upload_meta[filename].upload_percentages = 0;
          throw err;
        });

      res.data.meta_filename;
    },
  },
};
</script>
<style lang="scss" scoped>
._lib {
  display: flex;
  flex-flow: row wrap;
}
</style>
