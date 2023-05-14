<template>
  <ProjectCard
    :header="$t('machines_and_materials')"
    :icon="'tools'"
    :has_items="
      machines_materials_items_length > 0
        ? machines_materials_items_length
        : false
    "
  >
    <div class="u-spacingBottom">
      <TagsField
        :label="$t('materials')"
        :field_name="'materials'"
        :content="project.materials"
        :path="project.$path"
        :can_edit="can_edit"
      />
    </div>
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
  computed: {
    machines_materials_items_length() {
      let count = 0;

      if (this.project.materials && Array.isArray(this.project.materials))
        count += this.project.materials.length;
      if (this.project.machines && Array.isArray(this.project.machines))
        count += this.project.machines.length;

      return count;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
