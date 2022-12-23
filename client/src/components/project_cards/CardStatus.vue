<template>
  <ProjectCard>
    <div slot="header">
      {{ $t("visibility_progress") }}
      <sl-icon name="globe" />
    </div>
    <div>
      {{ $t("visibility_progress_text") }}
    </div>

    <br />

    <div class="">
      <!-- <ToggleField
        :label="$t('public')"
        :field_name="'$public'"
        :content="project.$public"
        :path="project.$path"
        :options="{
          true: $t('public_status_explanations'),
          false: $t('not_public_status_explanations'),
        }"
        :can_edit="can_edit_project"
      />
      <br /> -->
      <DLabel :str="$t('status')" />
      <SelectField
        :field_name="'status'"
        :content="project.status"
        :path="project.$path"
        :can_edit="can_edit_project"
        :options="status_options"
      />

      <br />

      <DLabel :str="$t('progress')" :instructions="$t('progress_instr')" />
      <sl-progress-bar value="50" class="progress-bar-values">
        50%
      </sl-progress-bar>
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
          instruction: "draft_status_explanations",
        },
        {
          key: "finished",
          text: this.$t("finished"),
          instruction: "finished_status_explanations",
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
