

<template>
  <Modal
    @close="$emit('close')"
    @submit="submitPassword"
    :read_only="false"
    :typeOfModal="'EditMeta'"
    :hide_close_button="true"
    >
    <template slot="header">
      <span class="">{{ $t('connect_to_dodoc') }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="pwd" required autofocus autoselect>            
      </div>

      <span class="switch switch-xs margin-bottom-small">
        <input id="remember_password_on_this_device" type="checkbox" v-model="remember_password_on_this_device" />
        <label for="remember_password_on_this_device">{{ $t('remember_password_on_this_device') }}</label>
      </span>
    </template>

    <template slot="submit_button">
      {{ $t('send') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';

export default {
  props: {
  },
  components: {
    Modal,
  },
  data() {
    return {
      pwd: '',
      remember_password_on_this_device: false
    }
  },
  
  created() {
  },
  mounted() {
    var session_storage_pwd = this.$auth.getSessionPasswordFromLocalStorage();

    if (session_storage_pwd) {
      this.pwd = session_storage_pwd;
      this.submitPassword();

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log(this.$t('notifications.using_saved_password'));      
    }
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
  },
  methods: {
    submitPassword() {
      if(this.remember_password_on_this_device) {
        this.$auth.saveSessionPasswordToLocalStorage(this.pwd);
      }

      this.$socketio.connect(this.pwd);
      this.$emit('close');
    }
  }
}
</script>
<style>

</style>