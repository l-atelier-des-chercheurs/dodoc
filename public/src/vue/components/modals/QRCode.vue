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
        <CreateQRCode
          :slugProjectName="slugProjectName"
        >
        </CreateQRCode>
      </div>

      <div class="m_scanQR margin-medium font-small">
        <label>Scanner un code QR</label>
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
  mounted() {
  },
  computed: {
  },
  methods: {
  }
};
</script>
<style>

</style>
