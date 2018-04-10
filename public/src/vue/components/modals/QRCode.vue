<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('create_a_folder') }}</span>
    </template>

    <template slot="preview">
      <div class="margin-medium font-small">
        <span v-html="$t('toconnectwithanotherdevicetothisfolder')"></span>

        <div v-for="(ip, index) in $root.state.localNetworkInfos.ip"
          class="js--openInBrowser qrSnippet button button-circled margin-vert-medium border-circled button-inline padding-small"
          :key="index"
          >
          <a 
            class="qrSnippet--text"
            :href="getURLToApp(ip, $root.state.localNetworkInfos.port)"
            target="_blank"
          >
            {{ getURLToApp(ip, $root.state.localNetworkInfos.port) }}
          </a>
          <div class="qrSnippet--motif">
            <CreateQRCode
              :urlToApp="getURLToApp(ip, $root.state.localNetworkInfos.port)"
            >
            </CreateQRCode>
          </div>
        </div>
      </div>

      <div class="margin-medium font-small">
        Scanner un code QR
        <ScanQRCode>
        </ScanQRCode>
      </div>

      
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import alertify from 'alertify.js';
import ScanQRCode from './qr/ScanQRCode.vue';
import CreateQRCode from './qr/CreateQRCode.vue';

export default {
  props: {
    read_only: Boolean,
    slugFolderName: String
  },
  components: {
    Modal,
    CreateQRCode,
    ScanQRCode
  },
  data() {
    return {
    };
  },
  computed: {},
  methods: {
    getURLToApp(ip, port) {
      return `${this.$root.state.protocol}://${ip}:${port}/${
        this.slugFolderName !== undefined ? this.slugFolderName : ''
      }`;
    }
  }
};
</script>
<style>

</style>
