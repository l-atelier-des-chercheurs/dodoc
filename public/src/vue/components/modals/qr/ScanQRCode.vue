<template>
  <div>
    <video ref="preview"></video>
  </div>
</template>
<script>
import Instascan from 'instascan';


export default {
  props: {
  },
  components: {
    Instascan
    
  },
  data() {
    return {
    }
  },
  
  created() {
  },
  mounted() {
    let scanner = new Instascan.Scanner({ video: this.$refs.previe) });
    scanner.addListener('scan', function (content) {
      console.log(content);
    });
    Instascan.Camera.getCameras().then(function (cameras) {
      if (cameras.length > 0) {
        scanner.start(cameras[0]);
      } else {
        console.error('No cameras found.');
      }
    }).catch(function (e) {
      console.error(e);
    });
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style>

</style>