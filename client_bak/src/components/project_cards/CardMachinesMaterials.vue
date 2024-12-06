<template>
  <DetailsPane
    :header="$t('machines_and_materials')"
    :icon="'tools'"
    :has_items="
      machines_materials_items_length > 0
        ? machines_materials_items_length
        : false
    "
    :is_open_initially="true"
    :can_be_toggled="false"
  >
    <div class="u-spacingBottom">
      <TagsField
        :label="$t('materials')"
        :field_name="'materials'"
        :tag_type="'materials'"
        :content="project.materials"
        :path="project.$path"
        :can_edit="can_edit"
      />
    </div>
    <div class="">
      <TagsField
        :label="$t('machines')"
        :field_name="'machines'"
        :tag_type="'machines'"
        :content="project.machines"
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
    machines_materials_items_length() {
      let count = 0;

      if (this.project.materials && Array.isArray(this.project.materials))
        count += this.project.materials.length;
      if (this.project.machines && Array.isArray(this.project.machines))
        count += this.project.machines.length;

      return count;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
