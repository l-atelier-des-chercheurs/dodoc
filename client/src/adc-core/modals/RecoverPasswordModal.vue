<template>
  <BaseModal2
    :title="$t('recover_password')"
    :is_closable="true"
    @close="$emit('close')"
  >
    <div class="u-spacingBottom">
      <p v-if="!$root.app_infos.instance_meta.can_send_email">
        {{ $t("please_contact_to_recover") }} <br />
        <a
          :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
          target="_blank"
        >
          {{ $root.app_infos.instance_meta.contactmail }}
        </a>
      </p>
      <p
        v-else-if="status === 'waiting'"
        v-html="
          $t('click_to_send_recovery_mail', { account_name: author.name })
        "
      ></p>
      <div v-if="status === 'recovery_mail_sent'">
        <p
          v-html="
            $t('recovery_mail_sent_to', {
              account_name: author.name,
              email: recovery_email_sent_to,
            })
          "
        ></p>
        </p>
        <p>
          {{ $t("recovery_mail_sent_to_instructions") }}
        </p>
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
        <b-icon icon="x" />
        {{ $t("close") }}
      </button>
      <button
        v-if="
          status === 'waiting' && $root.app_infos.instance_meta.can_send_email
        "
        type="button"
        class="u-button u-button_bleuvert"
        @click="recoverPassword"
      >
        <b-icon icon="envelope" />
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
        const result = await this.$api.recoverPassword({
          path: this.author.$path,
        });
        this.status = "recovery_mail_sent";
        this.recovery_email_sent_to = result.data?.recovery_email_sent_to;
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
