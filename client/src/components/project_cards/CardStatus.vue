<template>
  <ProjectCard>
    <div slot="header">
      {{ $t("progress") }}
      <sl-icon name="globe" />
    </div>
    <div class="">
      <ToggleField
        :label="$t('public')"
        :field_name="'$public'"
        :content="project.$public"
        :path="`/projects/${project.$slug}`"
        :options="{
          true: $t('public_status_explanations'),
          false: $t('not_public_status_explanations'),
        }"
        :can_edit="can_edit_project"
      />
      <br />
      <SelectField
        :field_name="'status'"
        :content="project.status"
        :path="`/projects/${project.$slug}`"
        :can_edit="can_edit_project"
        :options="status_options"
      />
      <div class="u-wips" />
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
      status_options: [
        {
          key: "draft",
          text: "draft_status_explanations",
        },
        {
          key: "finished",
          text: "finished_status_explanations",
        },
      ],
      // temp value, that uses
      visible_value: this.project.status,
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
