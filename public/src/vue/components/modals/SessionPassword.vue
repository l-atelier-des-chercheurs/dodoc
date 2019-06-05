

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
      pwd: ''
    }
  },
  
  created() {
  },
  mounted() {
    var session_storage_pwd = this.$auth.getSessionPasswordFromLocalStorage();
    if (session_storage_pwd) {
      this.pwd = session_storage_pwd;
      this.submitPassword();
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
      this.$auth.setSessionPassword(this.pwd);
      this.$socketio.connect();
      this.$emit('close');
    }
  }
}
</script>
<style>

</style>