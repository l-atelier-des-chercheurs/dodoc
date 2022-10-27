<template>
  <ProjectCard>
    <div slot="header">
      {{ $t("files") }}
      <sl-icon name="file-earmark-arrow-down" />
    </div>
    <div class="">
      <ul>
        <li>
          <a
            target="_blank"
            ng-href="/uploads/project_cao/102/%C3%A9l%C3%A9phant.svg"
            download="/uploads/project_cao/102/%C3%A9l%C3%A9phant.svg"
            class="ng-binding"
            href="/uploads/project_cao/102/%C3%A9l%C3%A9phant.svg"
            ><i class="fa fa-arrow-circle-o-down"> </i> éléphant.svg</a
          >
        </li>
        <li>
          <a
            target="_blank"
            ng-href="/uploads/project_cao/101/%C3%A9l%C3%A9phant_serre_livre.svg"
            download="/uploads/project_cao/101/%C3%A9l%C3%A9phant_serre_livre.svg"
            class="ng-binding"
            href="/uploads/project_cao/101/%C3%A9l%C3%A9phant_serre_livre.svg"
            ><i class="fa fa-arrow-circle-o-down"> </i>
            éléphant_serre_livre.svg</a
          >
        </li>
      </ul>
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
          key: "custom_lisense",
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
