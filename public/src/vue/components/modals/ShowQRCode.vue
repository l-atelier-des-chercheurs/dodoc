<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('create_a_folder') }}</span>
    </template>

    <template slot="preview">
      <span v-html="$t('toconnectwithanotherdevicetothisfolder')"></span>

      <a v-for="(ip, index) in $root.state.localNetworkInfos.ip"
        :href="getURLToApp(ip, $root.state.localNetworkInfos.port)"
        class="js--openInBrowser qrSnippet button button-circled margin-vert-medium border-circled button-inline padding-small"
        target="_blank"
        :key="index"
        >
        <div class="qrSnippet--text">
          {{ getURLToApp(ip, $root.state.localNetworkInfos.port) }}
        </div>
        <div class="qrSnippet--motif">
          <qrcode :value="getURLToApp(ip, $root.state.localNetworkInfos.port)" :options="{ size: 100 }"></qrcode>
        </div>
      </a>

      Scanner un code QR
      <ScanQRCode>

      </ScanQRCode>

      <ScanQR>
      </ScanQR>
      
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import alertify from 'alertify.js';
import qrcode from '@xkeshi/vue-qrcode';
import ScanQRCode from './qr/ScanQRCode.vue';

export default {
  props: {
    read_only: Boolean,
    slugFolderName: String
  },
  components: {
    Modal,
    qrcode,
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
    },
  }
};
</script>
<style>

</style>
