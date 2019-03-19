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

      let url = new URL(window.location);

      function isIP( address ){ 
        const r = RegExp('((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])');
        return r.test( address )
      }

      // si on est en localhost (cas de electron et navigateur connecté à electron)
      // alors on remplace localhost par l’IP
      if(url.hostname === 'localhost') {
        url.hostname = ip;        
      } 
      // si on est sur une ip (cas d’un hébergement en ligne, ou d’un navigateur connecté à electron)
      // alors on remplace par l’IP
      else if(isIP(url.hostname)) {
        url.hostname = ip;        
      }
      // et si on est sur un nom de domaine alors on ne fait rien

      if(this.slugProjectName) {
        url.pathname = this.slugProjectName;
        if(this.media_filename) {
          url.pathname += `/media/${this.media_filename}`;
        }
      }
      return url;        
    }
  }
}
</script>
<style>

</style>