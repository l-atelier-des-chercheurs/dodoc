<template>
  <ProjectCard
    :header="$t('levels_and_competences')"
    :icon="'bookmark-star'"
    :has_items="!!project.level"
  >
    <div class="u-spacingBottom">
      <DLabel :str="$t('skill_level')" />
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
    </div>
    <div class="">
      <DLabel :str="$t('disciplines')" />
      <RadioCheckboxField
        :field_name="'disciplines'"
        :input_type="'checkbox'"
        :content="project.disciplines"
        :path="project.$path"
        :can_edit="can_edit"
        :options="discipline_options"
      />
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
          key: "cycle1",
          label: this.$t("ta_cycle1"),
          instructions: this.$t("ta_cycle1_instr"),
        },
        {
          key: "cycle2",
          label: this.$t("ta_cycle2"),
          instructions: this.$t("ta_cycle2_instr"),
        },
        {
          key: "cycle3",
          label: this.$t("ta_cycle3"),
          instructions: this.$t("ta_cycle3_instr"),
        },
        {
          key: "cycle4",
          label: this.$t("ta_cycle4"),
          instructions: this.$t("ta_cycle4_instr"),
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
      discipline_options: [
        {
          key: "math",
          label: this.$t("di_math"),
        },
        {
          key: "french",
          label: this.$t("di_french"),
        },
        {
          key: "langs",
          label: this.$t("di_langs"),
        },
        {
          key: "history",
          label: this.$t("di_history"),
        },
        {
          key: "geography",
          label: this.$t("di_geography"),
        },
        {
          key: "biology",
          label: this.$t("di_biology"),
        },
        {
          key: "technology",
          label: this.$t("di_technology"),
        },
        {
          key: "physics",
          label: this.$t("di_physics"),
        },
        {
          key: "chemistry",
          label: this.$t("di_chemistry"),
        },
        {
          key: "sports",
          label: this.$t("di_sports"),
        },
        {
          key: "civics",
          label: this.$t("di_civics"),
        },
        {
          key: "arts",
          label: this.$t("di_arts"),
        },
        {
          key: "music",
          label: this.$t("di_music"),
        },
        {
          key: "transdisciplinary",
          label: this.$t("di_transdisciplinary"),
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
