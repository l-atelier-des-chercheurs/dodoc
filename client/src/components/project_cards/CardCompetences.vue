<template>
  <ProjectCard
    :header="$t('levels_and_competences')"
    :icon="'bookmark-star'"
    :has_items="!!project.level"
  >
    <div class="u-spacingBottom">
      <DLabel :str="$t('fabrication_level')" />
      <SelectField
        :field_name="'level'"
        :content="project.level || '-'"
        :path="project.$path"
        :can_edit="can_edit"
        :options="basic_competences"
      />
    </div>
    <div class="u-spacingBottom">
      <DLabel :str="$t('target_audience')" />

      <RadioCheckboxField
        :field_name="'target_audience'"
        :input_type="'checkbox'"
        :content="project.target_audience"
        :path="project.$path"
        :can_edit="can_edit"
        :options="target_audience_options"
      />

      <!-- <SelectField
        :field_name="'level'"
        :content="project.level || '-'"
        :path="project.$path"
        :can_edit="can_edit"
        :options="basic_competences"
      /> -->
    </div>
  </ProjectCard>
</template>
<script>
// import competences from "@/utils/competences.json";
import ProjectCard from "@/components/ProjectCard.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: { ProjectCard },
  data() {
    return {
      // competences,
      basic_competences: [
        {
          key: "-",
          text: "–",
        },
        {
          key: "beginner",
          text: this.$t("beginner"),
        },
        {
          key: "intermediate",
          text: this.$t("intermediate"),
        },
        {
          key: "experienced",
          text: this.$t("experienced"),
        },
      ],
      target_audience_options: [
        {
          key: "cycle-1",
          label: this.$t("ta_cycle_1"),
          instructions: this.$t("ta_cycle_1_instr"),
        },
        {
          key: "cycle-2",
          label: this.$t("ta_cycle_2"),
          instructions: this.$t("ta_cycle_2_instr"),
        },
        {
          key: "cycle-3",
          label: this.$t("ta_cycle_3"),
          instructions: this.$t("ta_cycle_3_instr"),
        },
        {
          key: "cycle-4",
          label: this.$t("ta_cycle_4"),
          instructions: this.$t("ta_cycle_4_instr"),
        },
        {
          key: "ulis",
          label: this.$t("ta_ulis"),
        },
        {
          key: "cap",
          label: this.$t("ta_cap"),
        },
        {
          key: "lycee",
          label: this.$t("ta_lycee"),
        },
        {
          key: "lycee2",
          label: this.$t("ta_lycee2"),
        },
        {
          key: "post",
          label: this.$t("ta_post"),
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
