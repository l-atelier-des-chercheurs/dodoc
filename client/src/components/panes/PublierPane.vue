<template>
  <div
    class="_publierPane"
    :class="{
      'is--editable': can_edit,
    }"
  >
    <PublicationsList
      v-if="!publication_opened"
      :project="project"
      :can_edit="can_edit"
      @togglePubli="$emit('update:publication_opened', $event)"
    />
    <PublicationOpen
      v-else
      :project_path="project.$path"
      :publication_slug="publication_opened"
      :page_opened_id="page_opened_id"
      :can_edit="can_edit"
      @togglePage="$emit('update:page_opened_id', $event)"
      @close="
        $emit('update:publication_opened', false);
        $emit('update:page_opened_id', false);
      "
    />
    <MediaModal
      v-if="media_to_edit"
      class="_editMediaModal"
      :key="media_to_edit.$path"
      :file="media_to_edit"
      @close="media_to_edit = false"
    />
  </div>
</template>
<script>
import PublicationsList from "@/components/publications/PublicationsList.vue";
import PublicationOpen from "@/components/publications/PublicationOpen.vue";
import MediaModal from "@/components/MediaModal";

export default {
  props: {
    project: Object,
    publication_opened: String,
    page_opened_id: String,
    can_edit: Boolean,
  },
  components: {
    PublicationsList,
    PublicationOpen,
    MediaModal,
  },
  data() {
    return {
      media_to_edit: false,
    };
  },
  created() {
    this.$eventHub.$on("publication.openModal", this.openMediaModal);
  },
  mounted() {},
  beforeDestroy() {
    this.$eventHub.$off("publication.openModal", this.openMediaModal);
  },
  watch: {},
  computed: {},
  methods: {
    openMediaModal(path) {
      this.media_to_edit = this.getMediaInFolder({
        path_to_source_media_meta: path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._publierPane {
  // padding: calc(var(--spacing) * 1);

  // padding-bottom: calc(var(--spacing) * 4);
  // overflow: auto;
  // height: 100%;
  // padding-top: 2px;
  background: white;
  background: var(--c-gris_clair);
  background-color: var(--c-bodybg);

  &.is--editable {
    background: var(--color-publish);
  }
}

._editMediaModal {
  z-index: 100;
}
</style>
