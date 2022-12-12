<template>
  <BaseModal2 :title="$root.app_infos.name_of_instance" @close="$emit('close')">
    <p>
      {{ $t("general_password_modal_text") }}
      <br />
      <a :href="'mailto:' + contact_email" target="_blank">
        {{ contact_email }}
      </a>
    </p>

    <form @submit.prevent="submitGeneralPassword">
      <DLabel :str="$t('password')" />
      <TextInput
        :content.sync="password_to_submit"
        :required="true"
        :input_type="'password'"
        @toggleValidity="($event) => (allow_send = $event)"
      />

      <ToggleInput
        :content.sync="remember_on_this_device"
        :label="$t('save_on_this_device')"
        :options="{
          true: $t('will_use_cookies'),
          false: $t('will_use_cookies'),
        }"
      />

      <br />

      <button
        type="submit"
        :disabled="!allow_send"
        class="u-button u-button_bleuvert"
      >
        {{ $t("access") }}
      </button>
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
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    contact_email() {
      return this.$root.app_infos.contactmail_of_instance;
    },
  },
  methods: {
    async submitGeneralPassword() {
      try {
        this.response = await this.$api.submitGeneralPassword({
          password: this.password_to_submit,
          remember_on_this_device: this.remember_on_this_device,
        });
        this.$emit("close");
      } catch (err) {
        this.response = err;
        this.$alertify.delay(4000).error(err);
        return false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
