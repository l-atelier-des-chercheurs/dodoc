<template>
  <div>
    <button type="button" @click="createText">Créer du texte</button>
    <button
      type="button"
      @click="show_create_link_field = !show_create_link_field"
    >
      Ajouter un site web
    </button>

    <form
      v-if="show_create_link_field"
      class="input-validation-required"
      @submit.prevent="createLink"
    >
      <sl-input
        variant="url"
        label="URL"
        placeholder="https://example.com/"
        required
        v-sl-model="url_to"
      />
      <br />
      <sl-button type="submit" variant="primary">Ajouter</sl-button>
    </form>

    Médias = {{ all_files.length }}
    <br />
    <br />
    <div class="_lib">
      <MediaCard
        v-for="file of all_files"
        :key="file.slug"
        :file="file"
        :project_slug="project_slug"
      />
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

      show_create_link_field: false,
      url_to: "https://latelier-des-chercheurs.fr/",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    all_files() {
      return this.project?.files || [];
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

    async createText() {
      const filename = "texte.txt";
      const content = "PLOP PLIP";

      const additional_meta = {
        caption: "plip",
      };

      this.uploadText({ filename, content, additional_meta });
    },

    async createLink() {
      const filename = this.url_to;
      const content = this.url_to;

      const additional_meta = {
        type: "url",
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing);
}
</style>
