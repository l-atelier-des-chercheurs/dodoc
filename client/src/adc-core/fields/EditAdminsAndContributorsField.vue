<template>
  <BaseModal2
    @close="$emit('closeModal')"
    :title="$t('set_admins_and_contributors')"
  >
    <AuthorField
      :label="$t('referent')"
      :field="'$admins'"
      :authors_paths="admins_path"
      :path="folder_path"
      :can_edit="true"
      :instructions="admin_instructions"
    />

    <br />

    <AuthorField
      :label="$t('contributors')"
      :field="'$contributors'"
      :authors_paths="contributors_path"
      :path="folder_path"
      :can_edit="true"
      :instructions="contrib_instructions"
    />

    <!-- <DLabel :str="$t('referent')" />
    <div class="u-instructions" v-if="admin_instructions">
      <small v-html="admin_instructions" />
    </div> -->

    <!-- <div class="_list">
      <div v-if="admins_path === 'everyone'">
        {{ $t("everyone") }}
      </div>
      <AuthorTag
        v-else-if="Array.isArray(admins_path)"
        v-for="admin_path in admins_path"
        :path="admin_path"
        :key="admin_path"
        :edit_mode="true"
        :links_to_author_page="false"
      />
    </div> -->

    <br />

    <!-- <DLabel :str="$t('contributors')" />
    <div class="u-instructions" v-if="contrib_instructions">
      <small v-html="contrib_instructions" />
    </div> -->

    <!-- <div class="_list">
      <div v-if="contributors_path === 'everyone'">
        {{ $t("everyone") }}
      </div>
      <AuthorTag
        v-else-if="Array.isArray(contributors_path)"
        v-for="contributor_path in contributors_path"
        :path="contributor_path"
        :key="contributor_path"
        :edit_mode="true"
        :links_to_author_page="false"
      />
    </div> -->
  </BaseModal2>
</template>
<script>
export default {
  props: {
    folder_path: String,
    admins_path: [String, Array],
    contributors_path: [String, Array],
    admin_instructions: String,
    contrib_instructions: String,
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
