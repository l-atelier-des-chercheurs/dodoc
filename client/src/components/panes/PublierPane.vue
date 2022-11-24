<template>
  <div class="_publierPane">
    <PublicationsList
      v-if="!publication_opened || !publication_opened.slug"
      :project_path="project.$path"
      :can_edit="can_edit"
      @togglePubli="$emit('update:publication_opened', $event)"
    />
    <PublicationOpen
      v-else
      :project_path="project.$path"
      :publication_slug="publication_opened.slug"
      @close="$emit('update:publication_opened', {})"
    />
  </div>
</template>
<script>
import PublicationsList from "@/components/publications/PublicationsList.vue";
import PublicationOpen from "@/components/publications/PublicationOpen.vue";

export default {
  props: {
    project: Object,
    publication_opened: Object,
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
  // padding: calc(var(--spacing) * 2);
  // padding-bottom: calc(var(--spacing) * 4);
  overflow: auto;
  height: 100%;
}
</style>
