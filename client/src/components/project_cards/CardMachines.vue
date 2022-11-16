<template>
  <ProjectCard>
    <div slot="header">
      {{ $t("machines_and_materials") }}
    </div>
    <div class="">
      <TagsField
        :field_name="'materials'"
        :content="project.materials"
        :path="project.$path"
        :can_edit="can_edit_project"
      />
    </div>
  </ProjectCard>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";

export default {
  props: {
    project: Object,
    can_edit_project: Boolean,
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
