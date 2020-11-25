<template>
  <div>
    <div>checkbox PARTAGER MON FLUX</div>
    <div>liste FLUX DISPONIBLES</div>

    <div>Your name {{ username }}</div>

    <div>
      User to call
      <input type="text" v-model="callee_username" />
    </div>

    <button type="button" @click="call">call</button>
  </div>
</template>
<script>
import RTCMultiConnection from "rtcmulticonnection";

export default {
  props: {
    stream: MediaStream,
  },
  components: {},
  data() {
    return {
      connection: undefined,

      username: `dodoc-${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,
      callee_username: "",

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
      audio: false,
      video: true,
    };

    this.connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: true,
    };

    // STAR_FIX_VIDEO_AUTO_PAUSE_ISSUES
    // via: https://github.com/muaz-khan/RTCMultiConnection/issues/778#issuecomment-524853468
    var bitrates = 512;

    this.connection.dontCaptureUserMedia = true;
    this.connection.addStream(this.stream);

    // var videoConstraints = {
    //   width: {
    //     ideal: 1280,
    //   },
    //   height: {
    //     ideal: 720,
    //   },
    //   frameRate: 30,
    // };

    // this.connection.mediaConstraints = {
    //   video: videoConstraints,
    //   audio: true,
    // };

    var CodecsHandler = this.connection.CodecsHandler;
    this.connection.processSdp = function (sdp) {
      sdp = CodecsHandler.preferCodec(sdp, "vp8");
      sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
        audio: 128,
        video: bitrates,
        screen: bitrates,
      });
      sdp = CodecsHandler.setVideoBitrates(sdp, {
        min: bitrates * 8 * 1024,
        max: bitrates * 8 * 1024,
      });
      return sdp;
    };

    // this.connection.videosContainer = document.getElementById('videos-container');
    this.connection.onstream = (event) => {
      console.log("MOUNTED • DistantFlux: onstream");

      if (this.is_calling) {
        this.is_calling = false;
        this.$emit("changeStreamTo", event.stream);
      }

      return;
    };
    this.connection.onstreamended = function (event) {
      console.log("MOUNTED • DistantFlux: onstreamended");
    };
    this.connection.onMediaError = function (e) {
      console.log("MOUNTED • DistantFlux: onMediaError");
    };

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
    this.connection.close();
  },

  watch: {},
  computed: {},
  methods: {
    call() {
      console.log("METHODS • DistantFlux: call");
      this.is_calling = true;

      this.connection.checkPresence(
        this.callee_username,
        (isOnline, username) => {
          console.log(
            `METHODS • DistantFlux: call / checkPresence with callee_username = ${this.callee_username}, is_calling = ${this.is_calling} and isOnline = ${isOnline}`
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
          this.connection.join(username, {
            isOneWay: true,
          });
        }
      );
    },
  },
};
</script>
