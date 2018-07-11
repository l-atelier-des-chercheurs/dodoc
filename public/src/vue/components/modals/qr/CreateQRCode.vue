<template>
  <div>
    <div class="hide_on_print" v-html="$t('toconnectwithanotherdevice')" />

    <div v-for="(ip, index) in $root.state.localNetworkInfos.ip"
      class="m_qrSnippet"
      :key="index"
      >
      <div class="m_qrSnippet--motif">
        <qrcode 
          ref="qr_canvas"
          :value="getURLToApp(ip)" 
          :options="{ size: 400, foreground: '#333', background: 'transparent' }"
        ></qrcode>
        <button type="button"
          class="buttonLink hide_on_print"
          @click.prevent="printQR"
        >
          {{ $t('print') }} 
        </button>

        <CreateQRCode 
        >
        </CreateQRCode>
      </div>
      <div class="m_qrSnippet--text">
        <a 
          class="break-long-lines js--openInBrowser"
          :href="getURLToApp(ip)"
          target="_blank"
        >
          <img 
            :src="'/images/i_logo.svg'" 
          />          
        
          <template v-if="nameOfProject">
            • {{ nameOfProject }} •<br><br>
          </template>
          <span class="font-verysmall">
            {{ getURLToApp(ip) }}
          </span>
        </a>
      </div>
    </div>

  </div>
</template>
<script>
import qrcode from '@xkeshi/vue-qrcode';

export default {
  props: ['slugProjectName', 'media_filename'],
  components: {
    qrcode
  },
  data() {
    return {
    }
  },
  created() {
  },
  mounted() {
    this.$root.updateNetworkInfos();
  },
  beforeDestroy() {
  },
  watch: {
  },
  computed: {
    nameOfProject() {
      if(!this.slugProjectName || !this.$root.store.projects[this.slugProjectName].hasOwnProperty('name')) {
        return false;
      }
      return this.$root.store.projects[this.slugProjectName].name;
    }
  },
  methods: {
    printQR: function() {
      window.print();
    },
    getURLToApp(ip) {
      let url = `${this.$root.state.protocol}://${ip}:${this.$root.state.localNetworkInfos.port}`;
      if(this.slugProjectName) {
        url += `/${this.slugProjectName}`;
        if(this.media_filename) {
          url += `/media/${this.media_filename}`;
        }
      }
      return url;        
    }
  }
}
</script>
<style>

</style>