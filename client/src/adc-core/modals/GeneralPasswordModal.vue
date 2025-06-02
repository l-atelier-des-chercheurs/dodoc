<template>
  <BaseModal2
    :title="$root.app_infos.instance_meta.name || $t('home')"
    :is_closable="false"
    @close="$emit('close')"
  >
    <p class="u-spacingBottom">
      {{ $t("general_password_modal_text") }}
      <template v-if="$root.app_infos.instance_meta.contactmail">
        <br />
        <a
          :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
          target="_blank"
        >
          {{ $root.app_infos.instance_meta.contactmail }}
        </a>
      </template>
    </p>

    <form @submit.prevent="submitGeneralPassword">
      <TextInput
        :label_str="'general_password'"
        :content.sync="password_to_submit"
        :required="true"
        :input_type="'password'"
        @toggleValidity="($event) => (allow_send = $event)"
        @onEnter="submitGeneralPassword"
      />

      <!-- <ToggleInput
        :content.sync="remember_on_this_device"
        :label="$t('save_on_this_device')"
        :options="{
          true: $t('will_use_cookies'),
          false: $t('will_use_cookies'),
        }"
      /> -->

      <button
        type="submit"
        v-if="!password_submit_error"
        :disabled="!allow_send"
        class="u-button u-button_bleuvert"
      >
        {{ $t("access") }}
      </button>
      <div v-else>
        {{ password_submit_error }}
      </div>
    </form>
  </BaseModal2>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      password_to_submit: "",
      allow_send: false,
      remember_on_this_device: true,
      password_submit_error: false,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async submitGeneralPassword() {
      try {
        await this.$api.submitGeneralPassword({
          password: this.password_to_submit,
          remember_on_this_device: this.remember_on_this_device,
        });
        this.$emit("close");
      } catch (err) {
        let msg = err.code;
        if (err.code === "submitted_general_password_is_wrong")
          msg = this.$t("submitted_password_is_wrong");

        this.password_submit_error = msg;
        this.$alertify.delay(4000).error(msg);

        setTimeout(() => {
          this.password_submit_error = false;
        }, 4000);
        return false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
