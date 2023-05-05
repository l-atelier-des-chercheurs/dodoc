<template>
  <ProjectCard :header="$t('authors_and_license')" :icon="'people'">
    <AdminsAndContributorsField
      :show_section="['admins', 'contributors']"
      :folder="project"
      :can_edit="can_edit"
      :admin_instructions="$t('project_admin_instructions')"
      :contrib_instructions="$t('project_contrib_instructions')"
    />

    <br />

    <div class="">
      <TitleField
        :label="$t('authors')"
        :field_name="'authors_list'"
        :content="project.authors_list"
        :path="project.$path"
        :can_edit="can_edit"
      />
    </div>

    <br />

    <DLabel
      :str="$t('license')"
      :instructions="can_edit ? $t('licence_instructions') : ''"
    />
    <div class="">
      <RadioField
        :field_name="'license'"
        :content="project.license"
        :path="project.$path"
        :can_edit="can_edit"
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
    can_edit: Boolean,
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
