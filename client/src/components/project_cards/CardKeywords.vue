<template>
  <DetailsPane
    v-if="can_edit || has_items"
    :header="keywords_title"
    :icon="'tag'"
    :has_items="has_items"
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
    has_items() {
      return this.project.keywords?.length > 0
        ? this.project.keywords.length
        : false;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
