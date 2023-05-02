<template>
  <ProjectCard :header="$t('levels_and_competences')" :icon="'bookmark-star'">
    <div class="">
      <SelectField
        :field_name="'level'"
        :content="project.level || ''"
        :path="project.$path"
        :can_edit="can_edit"
        :options="basic_competences"
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
        {
          key: "expert",
          text: this.$t("expert"),
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
