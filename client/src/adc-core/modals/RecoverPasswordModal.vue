<template>
  <BaseModal2
    :title="$t('recover_password')"
    :is_closable="true"
    @close="$emit('close')"
  >
    <div class="u-spacingBottom">
      <div v-if="status === 'recovery_mail_sent'">
        {{ recovery_email_sent_to }}
      </div>
      <div v-else-if="status === 'no_email_for_folder'">
        <p>
          {{ $t("no_email_for_account") }}
        </p>
        <p>
          {{ $t("please_contact_to_recover") }} <br />
          <a
            :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
            target="_blank"
          >
            {{ $root.app_infos.instance_meta.contactmail }}
          </a>
        </p>
      </div>
      <div v-else-if="status === 'error'">
        {{ err_recovering }}
      </div>
    </div>
    <template #footer>
      <button type="button" class="u-button" @click="$emit('close')">
        {{ $t("close") }}
      </button>
      <button
        type="button"
        class="u-button u-button_bleuvert"
        @click="recoverPassword"
      >
        {{ $t("recover_via_email") }}
      </button>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    author: Object,
  },
  components: {},
  data() {
    return {
      status: "waiting",
      recovery_email_sent_to: undefined,
      err_recovering: undefined,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async recoverPassword() {
      try {
        this.recovery_email_sent_to = await this.$api.recoverPassword({
          path: this.author.$path,
        });
        this.status = "recovery_mail_sent";
      } catch (err) {
        if (err.code === "no_email_for_folder") {
          this.status = "no_email_for_folder";
        } else {
          this.status = "error";
          this.err_recovering = err;
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
