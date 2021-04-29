<template>
  <Modal
    @close="$emit('close')"
    @submit="submitPassword"
    :read_only="false"
    :typeOfModal="'EditMeta'"
    :prevent_close="true"
  >
    <template slot="header">
      <span class>{{ $t("connect_to_dodoc") }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-bottom-small">
        <label>{{ $t("password") }}</label>
        <PasswordField
          v-model="pwd"
          :required="true"
          :autofocus="true"
          :autoselect="true"
          :field_type="'current-password'"
          @enter-was-pressed="submitPassword"
        />
      </div>

      <span class="switch switch-xs margin-bottom-small">
        <input
          id="remember_password_on_this_device"
          type="checkbox"
          v-model="remember_password_on_this_device"
        />
        <label for="remember_password_on_this_device">{{
          $t("remember_password_on_this_device")
        }}</label>
      </span>
    </template>

    <template slot="submit_button">{{ $t("send") }}</template>
  </Modal>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      pwd: "",
      remember_password_on_this_device: false,
    };
  },

  created() {},
  mounted() {
    const el = this.$el.querySelector("[autofocus]");
    el.focus();
  },
  beforeDestroy() {},

  watch: {},
  computed: {},
  methods: {
    submitPassword() {
      if (this.remember_password_on_this_device) {
        this.$auth.saveSessionPasswordToLocalStorage(this.pwd);
      }

      this.$socketio.connect(this.pwd);
      this.$emit("close");
    },
  },
};
</script>
<style></style>
