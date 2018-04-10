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
      scanner: undefined
    }
  },
  created() {
  },
  mounted() {
    debugger;
    this.scanner = new Instascan.Scanner({ 
      video: this.$refs.preview,
      mirror: false,
      scanPeriod: 25
    });
    this.scanner.addListener('scan',(content) => {
      window.location.assign(content);
    });
    Instascan.Camera.getCameras().then((cameras) => {
      if (cameras.length > 0) {
        var selectedCam = cameras[0];
        $.each(cameras, (i, c) => {
            if (c.name.indexOf('back') != -1) {
                selectedCam = c;
                return false;
            }
        });
        this.scanner.start(selectedCam);
      } else {
        console.error('No cameras found.');
      }
    }).catch((e) => {
      console.error(e);
    });
  },
  beforeDestroy() {
    if(this.scanner !== undefined) {
      this.scanner.stop();
    }

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