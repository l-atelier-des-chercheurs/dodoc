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
  </div>
</template>
<script>
import PublicationsList from "@/components/publications/PublicationsList.vue";
import PublicationOpen from "@/components/publications/PublicationOpen.vue";

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
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
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
