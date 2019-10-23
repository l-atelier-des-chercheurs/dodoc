<template>
  <Modal @close="$emit('close')" :read_only="read_only" :typeOfModal="'SmallAndScroll'">
    <template slot="header">
      <span class>{{ $t('remote_access') }}</span>
    </template>

    <template slot="preview">
      <div class="m_selectedQRShareMode hide_on_print">
        <label for="CreateQRCode">
          <input type="radio" id="CreateQRCode" value="CreateQRCode" v-model="current_mode" />
          {{ $t('share_access') }}
        </label>
        <label for="ScanQRCode">
          <input type="radio" id="ScanQRCode" value="ScanQRCode" v-model="current_mode" />
          {{ $t('scan_qr_code') }}
        </label>
      </div>

      <div class="font-small">
        <div v-if="current_mode === 'CreateQRCode'" class>
          <CreateQRCode :slugFolderName="slugProjectName" />
        </div>

        <div v-if="current_mode === 'ScanQRCode'" class="m_scanQR">
          <label>Scanner un code QR</label>
          <ScanQRCode></ScanQRCode>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import ScanQRCode from "./qr/ScanQRCode.vue";
import CreateQRCode from "./qr/CreateQRCode.vue";

export default {
  props: ["read_only", "slugProjectName"],
  components: {
    Modal,
    CreateQRCode,
    ScanQRCode
  },
  data() {
    return {
      current_mode: "CreateQRCode"
    };
  },
  mounted() {},
  computed: {},
  methods: {}
};
</script>
<style lang="scss">
.m_selectedQRShareMode {
  display: flex;
  flex-flow: row wrap;

  > * {
    flex: 1 1 0;
    margin: 0;
    padding: 0;
    min-width: 150px;
    border-bottom: 2px solid var(--c-gris-clair);
    border-right: 2px solid var(--c-gris-clair);
    display: flex;
    align-items: center;

    input {
      display: block;
      flex: 0 0 auto;
      margin: calc(var(--spacing) / 2);
    }

    &:last-child {
      border-right: none;
    }
  }
}
</style>
