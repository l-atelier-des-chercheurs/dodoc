<template>
  <DetailsPane
    :header="keywords_title"
    :icon="'tag'"
    :has_items="!!project.keywords"
    :is_open_initially="true"
    :can_be_toggled="false"
  >
    <div class="">
      <TagsField
        :label="$t('keywords')"
        :field_name="'keywords'"
        :tag_type="'keywords'"
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
