<template>
  <div>
    <PublicationsList
      v-if="!publication_opened || !publication_opened.slug"
      :project_path="project"
      :can_edit="can_edit"
      @togglePubli="$emit('update:publication_opened', $event)"
    />
    <PublicationOpen
      v-else
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
