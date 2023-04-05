<template>
  <ProjectCard :header="$t('visibility')" :icon="'globe'">
    <div>
      {{ $t("visibility_text") }}
    </div>

    <br />

    <div class="">
      <DLabel :str="$t('status')" />
      <SelectField
        :field_name="'$status'"
        :content="project.$status"
        :path="project.$path"
        :can_edit="can_edit_project"
        :options="status_options"
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
      status_options: [
        {
          key: "draft",
          text: this.$t("draft"),
          instruction: this.$t("draft_status_explanations"),
        },
        {
          key: "finished",
          text: this.$t("finished"),
          instruction: this.$t("finished_status_explanations"),
        },
        {
          key: "invisible",
          text: this.$t("invisible"),
          instruction: this.$t("invisible_status_explanations_projects"),
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
