<template>
  <a href="#" @click.prevent="openCanvasInNewTab()">
    <qrcode 
      ref="qr_canvas"
      :value="urlToApp" 
      :options="{ size: 400, foreground: '#333', background: 'transparent' }"
      
    ></qrcode>
  </a>
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
    openCanvasInNewTab() {
      window.open(this.$refs.qr_canvas.$el.toDataURL("image/png"), '_blank');      
    }
  }
}
</script>
<style>

</style>