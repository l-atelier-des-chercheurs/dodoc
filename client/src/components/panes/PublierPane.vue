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
      @togglePubli="$emit('updatePane', { key: 'folder', value: $event })"
    />
    <PublicationOpen
      v-else
      :project_path="project.$path"
      :publication_slug="publication_opened"
      :pane_infos="pane_infos"
      :can_edit="can_edit"
      @togglePage="$emit('updatePane', { key: 'page_id', value: $event })"
      @close="
        $emit('updatePane', { key: 'folder', value: false });
        $emit('updatePane', { key: 'page_id', value: false });
      "
    />
  </div>
</template>
<script>
import PublicationsList from "@/components/publications/PublicationsList.vue";
import PublicationOpen from "@/components/publications/PublicationOpen.vue";

export default {
  props: {
    project: Object,
    pane_infos: Object,
    can_edit: Boolean,
  },
  components: {
    PublicationsList,
    PublicationOpen,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    publication_opened() {
      return this.pane_infos.folder;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._publierPane {
  // padding: calc(var(--spacing) * 1);

  // padding-bottom: calc(var(--spacing) * 4);
  // overflow: auto;
  // height: 100%;
  // padding-top: 2px;
  // background: white;
  // background: var(--c-gris_clair);
  // background-color: var(--c-bodybg);

  &.is--editable {
    background: var(--color-publish);
  }
}

._editMediaModal {
  position: fixed;
  z-index: 100;
}
</style>
