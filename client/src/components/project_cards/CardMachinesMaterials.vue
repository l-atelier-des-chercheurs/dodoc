<template>
  <ProjectCard
    :header="$t('machines_and_materials')"
    :icon="'tools'"
    :has_items="!!project.materials || !!project.machines"
  >
    <div class="">
      <TagsField
        :label="$t('materials')"
        :field_name="'materials'"
        :content="project.materials"
        :path="project.$path"
        :can_edit="can_edit"
      />
    </div>
    <br />
    <div class="">
      <TagsField
        :label="$t('machines')"
        :field_name="'machines'"
        :content="project.machines"
        :path="project.$path"
        :can_edit="can_edit"
      />
    </div>
  </ProjectCard>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: { ProjectCard },
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
<style lang="scss" scoped></style>
