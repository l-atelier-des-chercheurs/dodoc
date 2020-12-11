<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :typeOfModal="'SmallAndScroll'"
  >
    <template slot="header">
      <span class>{{ $t("remote_access") }}</span>
    </template>

    <template slot="preview">
      <div class="m_sideBySideSwitches hide_on_print">
        <label for="QRCodeToResource">
          <input
            type="radio"
            id="QRCodeToResource"
            value="QRCodeToResource"
            v-model="current_mode"
          />
          {{ $t("share_access") }}
        </label>
        <label for="ScanQRCode">
          <input
            type="radio"
            id="ScanQRCode"
            value="ScanQRCode"
            v-model="current_mode"
          />
          {{ $t("scan_qr_code") }}
        </label>
      </div>

      <div class="font-small">
        <div v-if="current_mode === 'QRCodeToResource'" class>
          <QRCodeToResource :slugFolderName="slugProjectName" />
        </div>

        <div v-if="current_mode === 'ScanQRCode'" class="m_scanQR">
          <ScanQRCode></ScanQRCode>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import ScanQRCode from "./qr/ScanQRCode.vue";
import QRCodeToResource from "./qr/QRCodeToResource.vue";

export default {
  props: ["read_only", "slugProjectName"],
  components: {
    QRCodeToResource,
    ScanQRCode,
  },
  data() {
    return {
      current_mode: "QRCodeToResource",
    };
  },
  mounted() {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss"></style>
