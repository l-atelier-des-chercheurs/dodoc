<template>
  <BaseModal2 @close="$emit('closeModal')" :title="modal_title">
    <div v-if="true" class="u-instructions">
      <template
        v-if="
          $root.app_infos.instance_meta.require_signup_to_contribute &&
          !connected_as
        "
      >
        <div class="u-spacingBottom">
          {{ $t("you_must_login_to_contribute") }}
        </div>
      </template>
      <template
        v-else-if="
          connected_as && !canLoggedinContributeToFolder({ folder: folder })
        "
      >
        <div class="u-spacingBottom">
          {{ $t("not_allowed_to_contribute_contact_referent") }}
        </div>
      </template>
    </div>

    <AuthorField
      :label="admin_label"
      class="u-spacingBottom"
      :field="'$admins'"
      :authors_paths="admins_path"
      :path="folder.$path"
      :can_edit="can_edit"
      :instructions="admin_instructions"
    />

    <AuthorField
      :label="$t('contributors')"
      :field="'$contributors'"
      :authors_paths="contributors_path"
      :path="folder.$path"
      :can_edit="can_edit"
      :instructions="contrib_instructions"
    />

    <template #footer>
      <div />
      <button type="button" class="u-button" @click="$emit('closeModal')">
        <b-icon icon="x" />
        {{ $t("close") }}
      </button>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    modal_title: String,
    folder: Object,
    admins_path: [Boolean, String, Array],
    contributors_path: [Boolean, String, Array],
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
