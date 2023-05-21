<template>
  <div class="_sectionTitle">
    <TitleField
      :field_name="'section_title'"
      :label="$t('section_title')"
      :content="section.section_title"
      :path="section.$path"
      :maxlength="120"
      :tag="'h3'"
      :can_edit="can_edit"
    />
    <TitleField
      :field_name="'section_description'"
      :label="$t('description')"
      :content="section.section_description"
      :path="section.$path"
      :maxlength="1280"
      :input_type="'markdown'"
      :can_edit="can_edit"
    />
  </div>
</template>
<script>
export default {
  props: {
    section: Object,
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
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
