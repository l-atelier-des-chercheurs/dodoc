<template>
  <div>
    <!-- <div ref="videoContainer" />FLUX -->
  </div>
</template>
<script>
import RTCMultiConnection from "rtcmulticonnection";

export default {
  props: {},
  components: {},
  data() {
    return {
      connection: undefined,
      username: this.$root.settings.capture_options.distant_flux.username,
      callee_username: this.$root.settings.capture_options.distant_flux
        .callee_username,
      is_calling: false,
    };
  },

  created() {},
  mounted() {
    console.log("METHODS • DistantFlux: mounted");

    this.connection = new RTCMultiConnection();

    // by default, socket.io server is assumed to be deployed on your own URL
    // this.connection.socketURL = "/";
    // comment-out below line if you do not have your own socket.io server
    this.connection.socketURL = "https://rtcmulticonnection.herokuapp.com:443/";

    this.connection.session = {
      audio: true,
      video: true,
    };
    this.connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true,
    };

    // STAR_FIX_VIDEO_AUTO_PAUSE_ISSUES
    // via: https://github.com/muaz-khan/RTCMultiConnection/issues/778#issuecomment-524853468
    var bitrates = 512;
    var resolutions = "HD";
    var videoConstraints = {};
    if (resolutions == "HD") {
      videoConstraints = {
        width: {
          ideal: 1280,
        },
        height: {
          ideal: 720,
        },
        frameRate: 30,
      };
    }
    if (resolutions == "Ultra-HD") {
      videoConstraints = {
        width: {
          ideal: 1920,
        },
        height: {
          ideal: 1080,
        },
        frameRate: 30,
      };
    }
    this.connection.mediaConstraints = {
      video: videoConstraints,
      audio: true,
    };
    var CodecsHandler = this.connection.CodecsHandler;
    this.connection.processSdp = function (sdp) {
      var codecs = "vp8";

      if (codecs.length) {
        sdp = CodecsHandler.preferCodec(sdp, codecs.toLowerCase());
      }
      if (resolutions == "HD") {
        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
          audio: 128,
          video: bitrates,
          screen: bitrates,
        });
        sdp = CodecsHandler.setVideoBitrates(sdp, {
          min: bitrates * 8 * 1024,
          max: bitrates * 8 * 1024,
        });
      }
      if (resolutions == "Ultra-HD") {
        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
          audio: 128,
          video: bitrates,
          screen: bitrates,
        });
        sdp = CodecsHandler.setVideoBitrates(sdp, {
          min: bitrates * 8 * 1024,
          max: bitrates * 8 * 1024,
        });
      }
      return sdp;
    };

    // this.connection.videosContainer = document.getElementById('videos-container');
    this.connection.onstream = (event) => {
      console.log("MOUNTED • DistantFlux: onstream");

      if (this.is_calling) {
        event.mediaElement.removeAttribute("src");
        event.mediaElement.removeAttribute("srcObject");
        event.mediaElement.muted = true;
        event.mediaElement.volume = 0;

        this.$emit("changeStreamTo", event.stream);

        // var video = document.createElement("video");

        // try {
        //   video.setAttributeNode(document.createAttribute("autoplay"));
        //   video.setAttributeNode(document.createAttribute("playsinline"));
        // } catch (e) {
        //   video.setAttribute("autoplay", true);
        //   video.setAttribute("playsinline", true);
        // }
        // video.volume = 0;
        // try {
        //   video.setAttributeNode(document.createAttribute("muted"));
        // } catch (e) {
        //   video.setAttribute("muted", true);
        // }
        // video.srcObject = event.stream;

        // this.$refs.videoContainer.appendChild(video);
        // setTimeout(function() {
        //   video.play();
        // }, 5000);

        this.is_calling = false;
      }

      return;
    };
    this.connection.onstreamended = function (event) {
      console.log("MOUNTED • DistantFlux: onstreamended");
    };
    this.connection.onMediaError = function (e) {
      console.log("MOUNTED • DistantFlux: onMediaError");
      if (e.message === "Concurrent mic process limit.") {
        if (DetectRTC.audioInputDevices.length <= 1) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              "Please select external microphone. Check github issue number 483."
            );
          return;
        }
        var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
        this.connection.mediaConstraints.audio = {
          deviceId: secondaryMic,
        };
        this.connection.join(this.connection.sessionid);
      }
    };

    this.$eventHub.$on("call_callee", this.call);
    this.connection.open(this.username);

    // detect 2G
    if (
      navigator.connection &&
      navigator.connection.type === "cellular" &&
      navigator.connection.downlinkMax <= 0.115
    ) {
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error("2G is not supported. Please use a better internet service.");
    }
  },
  beforeDestroy() {
    this.$eventHub.$off("call_callee", this.call);
  },

  watch: {},
  computed: {},
  methods: {
    call() {
      console.log("METHODS • DistantFlux: call");
      this.is_calling = true;

      this.connection.checkPresence(
        this.$root.settings.capture_options.distant_flux.callee_username,
        (isOnline, username) => {
          console.log(
            `METHODS • DistantFlux: call / checkPresence with callee_username = ${this.$root.settings.capture_options.distant_flux.callee_username}, is_calling = ${this.is_calling} and isOnline = ${isOnline}`
          );
          if (!isOnline) {
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(username + " is not online.");
            return;
          } else {
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .success(username + " is online.");
          }
          this.connection.join(username);
        }
      );
    },
  },
};
</script>
