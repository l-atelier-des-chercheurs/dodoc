<template>
  <DetailsPane
    :header="$t('levels_and_competences')"
    :icon="'bookmark-star'"
    :has_items="!!project.level"
    :is_open_initially="true"
    :can_be_toggled="false"
  >
    <div class="u-spacingBottom">
      <DLabel :str="$t('skill_level')" />

      <!-- <TagsList
        :tags="project.level ? [project.level] : []"
        :tag_type="'level'"
      /> -->
      <!-- <TagsField
        :label="$t('level')"
        :field_name="'level'"
        :content="project.level ? [project.level] : []"
        :path="project.$path"
        :can_edit="can_edit"
      /> -->

      <TagsList
        v-if="project.level"
        :tags="project.level ? [project.level] : []"
        :tag_type="'level'"
      />

      <SelectField
        :field_name="'level'"
        :content="project.level || ''"
        :path="project.$path"
        :can_edit="can_edit"
        :options="basic_competences"
        :size="'small'"
      />
    </div>
    <div class="u-spacingBottom">
      <DLabel :str="$t('target_audience')" />

      <TagsList
        v-if="project.target_audience"
        :tags="project.target_audience"
        :tag_type="'target_audience'"
      />

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

      <TagsList
        v-if="project.disciplines"
        :tags="project.disciplines"
        :tag_type="'disciplines'"
      />

      <RadioCheckboxField
        :field_name="'disciplines'"
        :input_type="'checkbox'"
        :content="project.disciplines"
        :path="project.$path"
        :can_edit="can_edit"
        :options="discipline_options"
      />
    </div>
  </DetailsPane>
</template>
<script>
// import competences from "@/utils/competences.json";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      // competences,
      basic_competences: [
        {
          key: "",
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
