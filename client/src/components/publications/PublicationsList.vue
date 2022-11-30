<template>
  <div>
    <div class="_topBtn">
      <h2>Publications</h2>
      <button
        type="button"
        class="u-button u-button_bleuvert u-button_big"
        v-if="can_edit"
        @click="show_create_publication = true"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 168 168"
          style="enable-background: new 0 0 168 168"
          xml:space="preserve"
        >
          <polygon
            style="fill: white"
            points="132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 
		73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 		"
          />
        </svg>
        {{ $t("create") }}
      </button>
    </div>
    <CreatePublication
      v-if="show_create_publication"
      :project_path="project_path"
      @close="show_create_publication = false"
      @openPubli="$emit('togglePubli', { slug: $event })"
    />
    <br />

    <div class="_publications">
      <div class="_publications--list">
        <div v-for="publication in publications" :key="publication.$path">
          <PublicationPreview
            :publication="publication"
            image_name="publi_apercu.png"
            @open="openEntry(publication.$path)"
          />
        </div>
        <!-- 
        <PublicationPreview
          title="Pyramide Etalans"
          type="Page à page"
        />
        <PublicationPreview
          image_name="publi_apercu-2.png"
          title="Séminaire Mandela"
          type="Page à page"
        /> 
        <PublicationPreview
          image_name="publi_nunicons.png"
          title="Nunicons 3D"
          type="Fiche projet <i>Je Fabrique mon Matériel Pédagogique</i>"
        />
        -->
      </div>
    </div>
  </div>
</template>
<script>
import CreatePublication from "@/components/publications/CreatePublication.vue";
import PublicationPreview from "@/components/publications/PublicationPreview.vue";

export default {
  props: {
    project_path: String,
    can_edit: Boolean,
  },
  components: {
    CreatePublication,
    PublicationPreview,
  },
  data() {
    return {
      path: `${this.project_path}/publications`,
      show_create_publication: false,
      publications: [],
    };
  },
  created() {},
  async mounted() {
    this.publications = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {},
  methods: {
    openEntry(path) {
      const publication_slug = path.split("/").at(-1);
      this.$emit("togglePubli", { slug: publication_slug });
    },
    closeEntry() {
      this.$emit("togglePubli", {});
    },
  },
};
</script>
<style lang="scss" scoped>
._publications--list {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) * 2);
  align-items: flex-start;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}
</style>
