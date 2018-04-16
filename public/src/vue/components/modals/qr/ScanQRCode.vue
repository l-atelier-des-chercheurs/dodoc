<template>
  <div>
    <video ref="preview"></video>
  </div>
</template>
<script>

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    if (document.querySelector('script[src="' + src + '"]')) {
      resolve();
      return;
    }

    const el = document.createElement('script');

    el.type = 'text/javascript';
    el.async = true;
    el.src = src;

    el.addEventListener('load', resolve);
    el.addEventListener('error', reject);
    el.addEventListener('abort', reject);

    document.head.appendChild(el);
  })
}

export default {
  props: {
  },
  components: {
  },
  data() {
    return {
    }
  },
  created() {
  },
  mounted() {
    loadScript("/libs/instascan.min.js")
      .then(() => {
        // Script is loaded, do something

        this.scanner = new Instascan.Scanner({ 
          video: this.$refs.preview,
          mirror: false,
          scanPeriod: 4
        });
        this.scanner.addListener('scan',(content) => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success('QR code detected');

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
        
      })
      .catch(() => {
        // Failed to fetch script
      });

  },
  beforeDestroy() {
    this.scanner.stop();
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