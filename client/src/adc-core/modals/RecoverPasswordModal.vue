<template>
  <BaseModal2
    :title="$t('recover_password')"
    :is_closable="true"
    @close="$emit('close')"
  >
    <div class="u-spacingBottom">
      {{ $t("please_contact_to_recover") }} <br />
      <a
        :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
        target="_blank"
      >
        {{ $root.app_infos.instance_meta.contactmail }}
      </a>
    </div>
    <template #footer>
      <button type="button" class="u-button" @click="$emit('close')">
        {{ $t("close") }}
      </button>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  name: "RecoverPasswordModal",
};
</script>
<style lang="scss" scoped></style>
