<template>
  <div
    class="_publierPane"
    :class="{
      'is--editable': can_edit,
    }"
  >
    <PublicationsList
      v-if="!publication_opened"
      :project_path="project.$path"
      :can_edit="can_edit"
      @togglePubli="$emit('update:publication_opened', $event)"
    />
    <PublicationOpen
      v-else
      :project_path="project.$path"
      :publication_slug="publication_opened"
      :page_opened="page_opened"
      :can_edit="can_edit"
      @togglePage="$emit('update:page_opened', $event)"
      @close="
        $emit('update:publication_opened', false);
        $emit('update:page_opened', false);
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
    page_opened: String,
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
  padding: calc(var(--spacing) * 2);

  // padding-bottom: calc(var(--spacing) * 4);
  // overflow: auto;
  // height: 100%;
  background: white;
  background: var(--c-bodybg);

  &.is--editable {
    // background: var(--body-color);
    background: var(--color-publish);
  }
}
</style>
