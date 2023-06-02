<template>
  <DetailsPane
    :header="keywords_title"
    :icon="'tag'"
    :has_items="!!project.keywords"
  >
    <div class="">
      <TagsField
        :field_name="'keywords'"
        :content="project.keywords"
        :path="project.$path"
        :can_edit="can_edit"
      />
    </div>
  </DetailsPane>
</template>
<script>
export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    keywords_title() {
      // if (this.project.keywords && this.project.keywords.length > 0)
      //   return this.$t("keywords") + ` (${this.project.keywords.length})`;
      return this.$t("keywords");
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
