<template>
  <BaseModal2
    @close="$emit('closeModal')"
    :title="$t('set_admins_and_contributors')"
  >
    <AuthorField
      :label="admin_label"
      class="u-spacingBottom"
      :field="'$admins'"
      :authors_paths="admins_path"
      :path="folder_path"
      :can_edit="can_edit"
      :instructions="admin_instructions"
    />

    <AuthorField
      :label="$t('contributors')"
      :field="'$contributors'"
      :authors_paths="contributors_path"
      :path="folder_path"
      :can_edit="can_edit"
      :instructions="contrib_instructions"
    />
  </BaseModal2>
</template>
<script>
export default {
  props: {
    folder_path: String,
    admins_path: [String, Array],
    contributors_path: [String, Array],
    admin_label: String,
    admin_instructions: String,
    contrib_instructions: String,
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
._list {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}
</style>
