<template>
  <Modal
    @close="$emit('close')"
    class="m_exportModal"
    :typeOfModal="'EditMeta'"
  >
    <template slot="header">
      <span class>{{ $t("export_creation") }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-sides-medium font-small">
        <div class>
          <p>{{ $t("export_stopmotion_instructions") }}</p>
          <hr />

          <div class="margin-bottom-small">
            <QRCodeToResource
              :type="'publications'"
              :slugFolderName="slugPubliName"
            />
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import QRCodeToResource from "./qr/QRCodeToResource.vue";
import { setTimeout } from "timers";

export default {
  props: {
    publication: Object,
    slugPubliName: String,
  },
  components: {
    QRCodeToResource,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
