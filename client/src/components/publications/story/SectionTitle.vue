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
<style lang="scss" scoped>
._sectionTitle {
  margin: 0 calc(var(--spacing) / 1) calc(var(--spacing) * 1.5);
  padding-bottom: calc(var(--spacing) / 1);
  border-bottom: 2px solid var(--c-gris);
}
</style>
