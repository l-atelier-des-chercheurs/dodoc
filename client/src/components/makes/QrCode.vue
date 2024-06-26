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
    <QRCodeWithLink :text="make.qr_code_text" />
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
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._qrCode {
  ::v-deep > * {
    background-color: white;
    max-width: 600px;
    margin: calc(var(--spacing) / 1) auto;
  }
}
</style>
