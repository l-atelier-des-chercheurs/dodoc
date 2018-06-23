<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :typeOfModal="'SmallAndScroll'"
    >
    <template slot="header">
      <span class="">{{ $t('remote_access') }}</span>
    </template>

    <template slot="preview">
      <div class="margin-medium font-small">
        <div class="hide_on_print" v-html="$t('toconnectwithanotherdevice')" />

        <div v-for="(ip, index) in $root.state.localNetworkInfos.ip"
          class="m_qrSnippet"
          :key="index"
          >
          <div class="m_qrSnippet--motif">
            <CreateQRCode
              :urlToApp="getURLToApp(ip, $root.state.localNetworkInfos.port)"
            >
            </CreateQRCode>
          </div>
          <div class="m_qrSnippet--text">
            <a 
              class="break-long-lines js--openInBrowser"
              :href="getURLToApp(ip, $root.state.localNetworkInfos.port)"
              target="_blank"
            >
              <img 
                :src="'/images/i_logo.svg'" 
                @click="goHome()" 
              />          
            
              <template v-if="nameOfProject">
                • {{ nameOfProject }} •<br><br>
              </template>
              {{ getURLToApp(ip, $root.state.localNetworkInfos.port) }}
            </a>
          </div>
        </div>
      </div>

      <div class="m_scanQR margin-medium font-small">
        Scanner un code QR
        <ScanQRCode>
        </ScanQRCode>
      </div>

      
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import ScanQRCode from './qr/ScanQRCode.vue';
import CreateQRCode from './qr/CreateQRCode.vue';

export default {
  props: ['read_only','slugProjectName'],
  components: {
    Modal,
    CreateQRCode,
    ScanQRCode
  },
  data() {
    return {
    };
  },
  computed: {
    nameOfProject() {
      debugger;
      if(!this.slugProjectName || !this.$root.store.projects[this.slugProjectName].hasOwnProperty('name')) {
        return false;
      }
      return this.$root.store.projects[this.slugProjectName].name;
    }
  },
  methods: {
    getURLToApp(ip, port) {
      return `${this.$root.state.protocol}://${ip}:${port}/${
        this.slugProjectName !== false ? this.slugProjectName : ''
      }`;
    }
  }
};
</script>
<style>

</style>
