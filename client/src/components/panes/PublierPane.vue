<template>
  <div>
    <div class="_topBtn">
      <button
        type="button"
        class="u-button u-button_red u-button_big"
        v-if="$api.is_logged_in"
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
          <path
            style="fill: #fc4b60"
            d="M24.6,24.4c-32.8,32.8-32.8,86.1,0,119c32.8,32.8,85.9,32.8,118.7,0c32.8-32.8,32.8-85.9,0-118.7
		C110.5-8.2,57.5-8.2,24.6,24.4z"
          />
          <polygon
            style="fill: #ffbe32"
            points="132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 
		73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 		"
          />
        </svg>
        {{ $t("create") }}
      </button>
    </div>

    <CreatePublication
      v-if="show_create_publication"
      :project_path="project.$path"
      @close="show_create_publication = false"
    />

    <div class="_publications">
      <div v-for="publication in publications" :key="publication.$path">
        {{ publication.$path }}
      </div>
      <div class="_publications--list">
        <PublicationPreview
          image_name="publi_apercu.png"
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
      </div>
    </div>
  </div>
</template>
<script>
import CreatePublication from "@/components/publications/CreatePublication.vue";
import PublicationPreview from "@/components/publications/PublicationPreview.vue";

export default {
  props: {
    project: Object,
  },
  components: {
    CreatePublication,
    PublicationPreview,
  },
  data() {
    return {
      show_create_publication: false,
      publications: [],
    };
  },
  created() {},
  async mounted() {
    const path = `${this.project.$path}/publications`;
    this.publications = await this.$api.getFolders({
      path,
    });
    this.$api.join({ room: path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    openEntry({ slug }) {
      this.$emit("update:opened_journal_entry", { slug });
    },
    closeEntry() {
      this.entry_just_opened = this.opened_journal_entry.slug;
      this.$emit("update:opened_journal_entry", {});
    },
  },
};
</script>
<style lang="scss" scoped>
._topBtn {
  display: flex;
  place-content: center;
  margin: calc(var(--spacing) * 2);
}
._publications {
  margin: calc(var(--spacing) * 2);
}
._publications--list {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) * 2);
  align-items: flex-start;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}
</style>
