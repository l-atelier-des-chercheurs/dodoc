<template>
  <div class="_qrCode">
    <!-- <div class=""> -->
    <!-- <TitleField
        :field_name="'qr_code_text'"
        :content="make.qr_code_text"
        :path="make.$path"
        :required="true"
        :can_edit="true"
      /> -->
    <!-- </div> -->
    <QRCodeWithLink :text="make.qr_code_text" @updateQRCode="updateQRCode" />

    <div class="_bottomBtns" v-if="qrcode_dataurl">
      <button
        type="button"
        class="u-button u-button_orange"
        @click="saveToProject"
      >
        <span class="u-icon" v-html="dodoc_icon_collect" />
        {{ $t("save_to_project") }}
      </button>
    </div>

    <div class="_saveNotice" v-if="status_saving_to_project">
      <template v-if="status_saving_to_project === 'saving'">
        {{ $t("saving") }}
      </template>
      <template v-else-if="status_saving_to_project === 'saved'">
        {{ $t("media_was_saved_to_project") }}
      </template>
    </div>
  </div>
</template>
<script>
import QRCodeWithLink from "@/adc-core/ui/QRCodeWithLink.vue";

export default {
  props: {
    make: Object,
  },
  components: {
    QRCodeWithLink,
  },
  data() {
    return {
      text: this.make.text,
      show_save_export_modal: false,

      qrcode_dataurl: null,
      qrcode_text: null,

      status_saving_to_project: null,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    updateQRCode({ dataurl, text }) {
      this.qrcode_dataurl = dataurl;
      this.qrcode_text = text;
    },

    async saveToProject() {
      this.status_saving_to_project = "saving";

      const file = this.dataURLtoBlob(this.qrcode_dataurl);
      const parent_project_path = this.getParent(
        this.getParent(this.make.$path)
      );

      const additional_meta = {
        caption: this.$t("qr_code_content") + " : " + this.qrcode_text,
      };

      const { meta_filename } = await this.$api
        .uploadFile({
          path: parent_project_path,
          filename: "qrcode.png",
          file,
          additional_meta,
        })
        .catch((err) => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("media_couldnt_be_sent"));
          this.status_saving_to_project = null;
          throw err;
        });

      this.$eventHub.$emit("pane.animate", "collect");
      setTimeout(() => {
        this.status_saving_to_project = "saved";
        setTimeout(() => {
          this.status_saving_to_project = null;
        }, 2000);
      }, 1000);
    },
  },
};
</script>
<style lang="scss" scoped>
._qrCode {
  position: relative;

  background-color: white;
  border-radius: var(--border-radius);
  max-width: 500px;
  padding: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) / 1) auto;
}

._bottomBtns {
  display: flex;
  justify-content: center;
  gap: calc(var(--spacing));
  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
}

._saveNotice {
  position: absolute;
  inset: -2px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
