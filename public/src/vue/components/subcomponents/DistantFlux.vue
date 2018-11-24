<template>
</template>
<script>
import RTCMultiConnection from 'rtcmulticonnection';

export default {
  props: {
  },
  components: {
  },
  data() {
    return {
      connection: undefined,
      username: this.$root.settings.capture_options.distant_flux.username,
      callee_username: this.$root.settings.capture_options.distant_flux.callee_username,
      is_calling: false,
      is_booting: true
    }
  },
  
  created() {
  },
  mounted() {
    console.log('METHODS • DistantFlux: mounted');
    
    this.connection = new RTCMultiConnection();

    // by default, socket.io server is assumed to be deployed on your own URL
    // connection.socketURL = '/';
    // comment-out below line if you do not have your own socket.io server
    this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    this.connection.socketMessageEvent = 'dodoc-demo';
    // do not shift room control to other users
    this.connection.autoCloseEntireSession = true;
    this.connection.session = {
      audio: true,
      video: true,
      broadcast: true // if you remove this, then it becomes MANY-to-MANY
    };

    this.connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: true
    };
    // this.connection.videosContainer = document.getElementById('videos-container');
    this.connection.onstream = (event) => {
      console.log('MOUNTED • DistantFlux: onstream');
      this.is_booting = false;
      if(this.is_calling) {
        this.$emit('changeStreamTo', event.stream);
        this.is_calling = false;
      }
      return;
    };
    this.connection.onstreamended = function(event) {
      console.log('MOUNTED • DistantFlux: onstreamended');
    };
    this.connection.onMediaError = function(e) {
      console.log('MOUNTED • DistantFlux: onMediaError');
      if (e.message === 'Concurrent mic process limit.') {
        if (DetectRTC.audioInputDevices.length <= 1) {
          alert(
            'Please select external microphone. Check github issue number 483.'
          );
          return;
        }
        var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
        this.connection.mediaConstraints.audio = {
          deviceId: secondaryMic
        };
        this.connection.join(this.connection.sessionid);
      }
    };

    this.$eventHub.$on('call_callee', this.call);
    this.connection.open(this.username);

    // detect 2G
    if (
      navigator.connection &&
      navigator.connection.type === 'cellular' &&
      navigator.connection.downlinkMax <= 0.115
    ) {
      alert('2G is not supported. Please use a better internet service.');
    }
  },
  beforeDestroy() {
    this.$eventHub.$off('call_callee', this.call);
  },

  watch: {
  },
  computed: {
  },
  methods: {
    call() {
      console.log('METHODS • DistantFlux: call');
      this.is_calling = true;
      this.connection.checkPresence(this.$root.settings.capture_options.distant_flux.callee_username, (isOnline, username) => {
        console.log(`METHODS • DistantFlux: call / checkPresence with callee_username = ${this.$root.settings.capture_options.distant_flux.callee_username}, is_calling = ${this.is_calling} and isOnline = ${isOnline}`);
        if (!isOnline) {
          alert(username + ' is not online.');
          return;
        }
        this.connection.join(username);
      });      
    },
  }
}
</script>
