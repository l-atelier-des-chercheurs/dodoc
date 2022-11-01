<template>
  <ProjectCard>
    <div slot="header">
      {{ $t("license") }}
      <sl-icon name="file-earmark-spreadsheet" />
    </div>
    <div class="">
      <RadioField
        :field_name="'license'"
        :content="project.license"
        :path="`/projects/${project.slug}`"
        :can_edit="can_edit_project"
        :options="license_options"
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
    return {
      license_options: [
        {
          key: "creativecommons_by_nc_sa",
          text: "creativecommons_by_nc_sa_explanations",
        },
        {
          key: "all_rights_reserved",
          text: "all_rights_reserved_explanations",
        },
        {
          key: "copyleft",
          text: "copyleft_explanations",
        },
        {
          key: "custom_license",
          text: "custom_license_explanations",
        },
      ],
    };
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
