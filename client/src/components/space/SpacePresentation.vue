<template>
  <div>
    <div>
      <TitleField
        :field_name="'title'"
        class="_title"
        :label="$t('title')"
        :tag="'h1'"
        :content="space.title"
        :path="space.$path"
        :maxlength="280"
        :can_edit="can_edit"
        :instructions="$t('project_title_instructions')"
      />
    </div>

    <br />

    <div class="">
      <TitleField
        :field_name="'description'"
        class="_description"
        :label="$t('description')"
        :content="space.description"
        :path="space.$path"
        :maxlength="480"
        :can_edit="can_edit"
        :instructions="$t('project_description_instructions')"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    space: Object,
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
