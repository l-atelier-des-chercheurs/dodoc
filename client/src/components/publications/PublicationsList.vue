<template>
  <div>
    <div class="_topBtn">
      <div class="u-sameRow">
        <DLabel :str="$t('publications')" :tag="'h2'" />
        <button
          type="button"
          class="u-button u-button_bleuvert"
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
            <path
              style="fill: var(--color-publish)"
              d="M24.6,24.4c-32.8,32.8-32.8,86.1,0,119c32.8,32.8,85.9,32.8,118.7,0c32.8-32.8,32.8-85.9,0-118.7
		C110.5-8.2,57.5-8.2,24.6,24.4z"
            />
            <polygon
              style="fill: #ffffff"
              points="132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 
		73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 		"
            />
          </svg>
          &nbsp;
          {{ $t("create") }}
        </button>
      </div>
    </div>
    <CreatePublication
      v-if="show_create_publication"
      :project_path="project_path"
      @close="show_create_publication = false"
      @openPubli="$emit('togglePubli', $event)"
    />
    <br />

    <div class="_publications">
      <transition-group
        tag="div"
        class="_publications--list"
        name="listComplete"
      >
        <div
          v-for="publication in sorted_publications"
          :key="publication.$path"
        >
          <PublicationPreview
            :publication="publication"
            image_name="publi_apercu.png"
            :can_edit="can_edit"
            @open="openEntry(publication.$path)"
          />
        </div>
      </transition-group>
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
  computed: {
    sorted_publications() {
      const _publications = this.publications.slice();
      return _publications.sort(
        (a, b) => +new Date(b.$date_created) - +new Date(a.$date_created)
      );
    },
  },
  methods: {
    openEntry(path) {
      const publication_slug = path.split("/").at(-1);
      this.$emit("togglePubli", publication_slug);
    },
    closeEntry() {
      this.$emit("togglePubli", false);
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
</style>
