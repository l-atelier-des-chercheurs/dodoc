<template>
  <div>
    <a href="#" @click.prevent="openCanvasInNewTab()">
      <qrcode 
        ref="qr_canvas"
        :value="urlToApp" 
        :options="{ size: 400, foreground: '#333', background: 'transparent' }"
      ></qrcode>
    </a>
    <button type="button"
      class="buttonLink hide_on_print"
      @click.prevent="printQR"
    >
      {{ $t('print') }} 
    </button>
  </div>
</template>
<script>
import qrcode from '@xkeshi/vue-qrcode';

export default {
  props: {
    urlToApp: String
  },
  components: {
    qrcode,
  },
  data() {
    return {
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
  },
  methods: {
    printQR: function() {
      window.print();
    },
    openCanvasInNewTab() {
      window.open(this.$refs.qr_canvas.$el.toDataURL("image/png"), '_blank');      
    }
  }
}
</script>
<style>

</style>