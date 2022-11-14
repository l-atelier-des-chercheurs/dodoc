<template>
  <div>
    <div class="_msg u-instructions u-padding-small">
      Créez ici des publications : journal du projet, tutoriel, livret, etc.
      <br />
      Elles contiendront du texte et des éléments que vous avez collecté.
    </div>

    <button type="button" @click="show_create_publication = true">
      <sl-icon name="plus" label="Panneaux" />
      {{ $t("create") }}
    </button>

    <CreatePublication
      v-if="show_create_publication"
      :project_slug="project.$slug"
      @close="show_create_publication = false"
    />

    <button type="button" @click="listPublications">Lister publications</button>
    publications = {{ publications }}
  </div>
</template>
<script>
import CreatePublication from "@/components/publications/CreatePublication.vue";

export default {
  props: {
    project: Object,
  },
  components: {
    CreatePublication,
  },
  data() {
    return {
      show_create_publication: false,
      publications: [],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async listPublications() {
      const path = `projects/${this.project.$slug}/publications`;
      this.publications = await this.$api.getFolders({
        path,
      });
      debugger;
      this.$api.join({ room: path });
    },
  },
};
</script>
<style lang="scss" scoped>
._msg {
  padding: calc(var(--spacing) * 2);
}
</style>
