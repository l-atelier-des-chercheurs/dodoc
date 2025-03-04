<template>
  <DetailsPane
    v-if="can_edit || has_items"
    :header="$t('levels_and_competences')"
    :icon="'bookmark-star'"
    :has_items="has_items"
  >
    <div class="u-spacingBottom">
      <!-- <DLabel :str="$t('skill_level')" /> -->

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

      <RadioCheckboxField
        :label="$t('skill_level')"
        :field_name="'level'"
        :input_type="'radio'"
        :content="project.level"
        :path="project.$path"
        :can_edit="can_edit"
        :options="basic_competences"
      >
        <template #preview="{ item }">
          <div class="_list" v-if="item && !!item.key">
            <SingleTag
              :tag_type="'level'"
              :tag_str="item.label"
              :mode="'inactive'"
            />
          </div>
        </template>
      </RadioCheckboxField>
    </div>
    <div class="u-spacingBottom">
      <RadioCheckboxField
        :label="$t('target_audience')"
        :field_name="'target_audience'"
        :input_type="'checkbox'"
        :content="project.target_audience"
        :path="project.$path"
        :can_edit="can_edit"
        :options="target_audience_options"
      >
        <template #preview="{ items }">
          <TagsList
            v-if="items"
            :tags="items.map(({ key }) => key)"
            :tag_type="'target_audience'"
          />
        </template>
      </RadioCheckboxField>
    </div>
    <div class="">
      <RadioCheckboxField
        :label="$t('disciplines')"
        :field_name="'disciplines'"
        :input_type="'checkbox'"
        :content="project.disciplines"
        :path="project.$path"
        :can_edit="can_edit"
        :options="discipline_options"
      >
        <template #preview="{ items }">
          <TagsList
            v-if="items"
            :tags="items.map(({ key }) => key)"
            :tag_type="'disciplines'"
          />
        </template>
      </RadioCheckboxField>
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
          label: this.$t("not_specified"),
        },
        {
          key: "beginner",
          label: this.$t("beginner"),
        },
        {
          key: "intermediate",
          label: this.$t("intermediate"),
        },
        {
          key: "experienced",
          label: this.$t("experienced"),
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
  computed: {
    items_count() {
      return (
        (this.project.level ? 1 : 0) +
        (this.project.target_audience?.length > 0
          ? this.project.target_audience.length
          : 0) +
        (this.project.disciplines?.length > 0
          ? this.project.disciplines.length
          : 0)
      );
    },
    has_items() {
      return this.items_count > 0 ? this.items_count : false;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._list {
  display: flex;
  flex-flow: row wrap;
}
</style>
