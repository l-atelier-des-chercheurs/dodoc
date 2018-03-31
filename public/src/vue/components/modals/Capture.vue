<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('capture') }}</span> <i>{{ folder.name }}</i>
    </template>

    <template slot="sidebar">
    </template>    

    <template slot="preview">
      Hello !
      <video ref="videoElement" autoplay muted /> 

    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';

import RecordRTC from 'recordrtc';


export default {
  props: {
    folder: Object
  },
  components: {
    Modal
  },
  data() {
    return {
      videoStream: '',
      audioStream: '',
      currentFeedsSource: {}
    }
  },
  
  created() {
  },
  mounted() {
    debugger;
    this.startCameraFeed();

  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
  },
  methods: {
    startCameraFeed() {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: startCameraFeed');
        
        this.stopAllFeeds();
        this.getCameraFeed()
          .then((stream) => {
            this.videoStream = stream;
            this.$refs.videoElement.srcObject = stream;
            resolve();
          }, (err) => {
            alertify.error( "Failed to start camera feed: " + err);
            reject();
          });
      });
    },
    stopAllFeeds() {
      console.log('METHODS • Capture: stopAllFeeds');
      debugger;
      if( !this.$refs.videoElement.paused)
        this.$refs.videoElement.pause();

      if(this.videoStream) this.videoStream.getTracks().forEach((track) => track.stop());
      if(this.audioStream) this.audioStream.getTracks().forEach((track) => track.stop());

      // imageMode.stop();
      // videoMode.stop();
      // stopMotionMode.stop();
      // audioMode.stop();
    },
    getCameraFeed(withAudio) {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: getCameraFeed');

        if( currentFeedsSource === undefined || currentFeedsSource.video === undefined) {
          reject("Camera not yet ready");
        }

        navigator.getUserMedia(
          {
            video: currentFeedsSource.video,
            audio: withAudio
          },
          function (stream) {
            resolve(stream);
          },
          function(err) {
            $(document).trigger('open_settings_pane');
            for (index=0; index < videoResSwitches.length; index++) {
              videoResSwitches[index].checked = false;
            }
            alertify.error(dodoc.lang().videoStreamCouldntBeStartedTryChangingRes);
          }
        );
      });
    }
    

  }
}
</script>
<style>

</style>