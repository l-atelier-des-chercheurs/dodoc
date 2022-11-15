<template>
  <div>
    <button type="button" @click="show_create_publication = true">
      <sl-icon name="plus" label="Panneaux" />
      {{ $t("create") }}
    </button>

    <CreatePublication
      v-if="show_create_publication"
      :project_path="project.$path"
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
