<template>
  <Modal
    @close="$emit('close')"
    @submit="createQRCode"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
    :is_loading="is_sending_content_to_server"
  >
    <template slot="header">
      <div class>{{ $t("create_qr_code") }}</div>
    </template>

    <template slot="sidebar">
      <div class="margin-bottom-small">
        {{ $t("create_qr_code_instructions") }}
      </div>
      <div class="margin-bottom-small">
        <label>{{ $t("link") }}</label>
        <input
          class="input-big"
          type="text"
          v-model.trim="url"
          required
          :readonly="read_only"
        />
      </div>
      <div class="margin-bottom-small _canvas">
        <qrcode
          v-if="url"
          ref="qr_canvas"
          :value="url"
          :options="{
            size: 800,
            foreground: '#333',
            background: '#fff',
          }"
        />
        <div v-else class="_qr_placeholder"></div>
      </div>
    </template>
    <template slot="submit_button">{{ $t("create") }}</template>
  </Modal>
</template>
<script>
import qrcode from "@xkeshi/vue-qrcode";

export default {
  props: {
    read_only: Boolean,
    type: String,
    slugFolderName: String,
  },
  components: {
    qrcode,
  },
  data() {
    return {
      url: "",
      is_sending_content_to_server: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    askBeforeClosingModal() {
      if (this.url.length > 0) return true;
      else return false;
    },
  },
  methods: {
    createQRCode() {
      this.is_sending_content_to_server = true;

      this.$refs.qr_canvas.$el.toBlob(
        (imageBlob) => {
          this.$root
            .createMedia({
              slugFolderName: this.slugFolderName,
              type: this.type,
              rawData: imageBlob,
              additionalMeta: {
                type: "image",
                caption: this.url,
              },
            })
            .then((mdata) => {
              this.is_sending_content_to_server = false;
              this.$emit("close");
              this.$root.openMedia({
                slugProjectName: this.slugFolderName,
                metaFileName: mdata.metaFileName,
              });
            });
        },
        "image/jpeg",
        0.95
      );
    },
  },
};
</script>
<style lang="scss" scoped>
._canvas >>> canvas {
  max-width: 100%;
}

._qr_placeholder {
  display: block;
  width: 100%;
  // height: 0;
  background-color: var(--c-gris-clair);

  &::before {
    content: "";
    display: block;
    position: relative;
    width: 100%;
    padding-bottom: 100%;
  }
}
</style>
