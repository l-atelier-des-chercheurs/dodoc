<template>
  <div>
    Hello !
    {{ folder.name }}
    <fieldset>
      <legend>Mode</legend>
      <div v-for="mode in available_modes">
        <input type="radio" :id="mode.key" :value="mode.key" v-model="selected_mode">
        <label :for="mode.key">{{ mode.name }}</label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Sources</legend>
      <div v-for="(currentId, kind) in selected_devicesId">
        {{ kind }}
        <select v-if="sorted_available_devices.hasOwnProperty(kind)" v-model="selected_devicesId[kind]">
          <option v-for="(device, index) in sorted_available_devices[kind]" :value="device.deviceId">
            {{ device.label }}
          </option>        
        </select>
      </div>
    </fieldset>

    <div class="left_panel">
      <video 
        v-show="['photo', 'video', 'stopmotion'].includes(selected_mode)"
        ref="videoElement" 
        autoplay 
        muted 
      /> 
      <canvas 
        v-if="selected_mode === 'audio'"
        ref="equalizerElement" width="720" height="360" 
      />
    </div>

    <div class="right_panel">


    </div>


  </div>
</template>
<script>
import alertify from 'alertify.js';
import RecordRTC from 'recordrtc';
import _ from 'underscore';

export default {
  props: {
    folder: {
      type: Object,
      default: ''
    },
  },
  components: {
  },
  data() {
    return {
      selected_mode: '',
      available_modes: [
        { 
          name: this.$t('photo'),
          key: 'photo'
        },
        {
          name: this.$t('video'),
          key: 'video'
        },
        {
          name: this.$t('stopmotion'),
          key: 'stopmotion'
        },
        {
          name: this.$t('audio'),
          key: 'audio'
        }
      ],
      videoStream: '',
      audioStream: '',
      available_devices: {},
      selected_devicesId: {
        audioinput: '',
        videoinput: '',
        audiooutput: ''
      }
    }
  },
  created() {
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
  },

  watch: {
    'selected_devicesId.audioinput': function() {
      this.$refs.videoElement.setSinkId(this.selected_devicesId.audioinput);      
    },
    'selected_devicesId.videoinput': function() {
      this.startCameraFeed();
    },
    selected_mode: function() {
      this.stopAllFeeds();

      if(this.selected_mode === 'photo') {
        this.startCameraFeed()
      }

      else if(this.selected_mode === 'audio') {
        equalizer.clearCanvas();
        this.getAudioFeed()
        .then(stream => {
          equalizer.start(this.$refs.equalizerElement, stream);
        })
        .catch(err => {
        })      
      }
    }
  },
  computed: {
    sorted_available_devices() {
      return _.groupBy(this.available_devices, 'kind');
    }
  },
  methods: {
    init() {
      navigator.mediaDevices.enumerateDevices()
      .then((deviceInfos) => {
        this.available_devices = deviceInfos;

        // get from localstorage and put in selected_devicesId.audioinput, selected_devicesId.videoinput and selected_devicesId.audiooutput 

        // set initial value
        Object.keys(this.selected_devicesId).map((kind) => {
          if(this.selected_devicesId[kind] === '') {
            if(this.sorted_available_devices.hasOwnProperty(kind)) {
              this.selected_devicesId[kind] = this.sorted_available_devices[kind][0].deviceId;
            }
          }
        });

        // get last mode from localstorage

        // otherwise start first mode
        if(this.selected_mode === '') {
          this.selected_mode = this.available_modes[0].key;
        }
      });
    },


    stopAllFeeds() {
      console.log('METHODS • Capture: stopAllFeeds');
      if(this.$refs.hasOwnProperty('videoElement') && !this.$refs.videoElement.paused)
        this.$refs.videoElement.pause();

      if(this.videoStream) this.videoStream.getTracks().forEach((track) => track.stop());
      if(this.audioStream) this.audioStream.getTracks().forEach((track) => track.stop());
      equalizer.stop();
    },

    startCameraFeed() {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: startCameraFeed');
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log('METHODS • Capture: startCameraFeed');

        this.getCameraFeed()
          .then((stream) => {
            this.videoStream = stream;
            this.$refs.videoElement.srcObject = stream;
            resolve(stream);
          })
          .catch((err) => {
            alertify.error(err);
            reject();
          });
      });
    },

    getCameraFeed(withAudio = false) {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: getCameraFeed');

        if(this.selected_devicesId.videoinput === '') {
          reject(this.$t('notifications.video_source_not_set'));
        }
        const constraints = {
          video: {
            optional: [{ sourceId: this.selected_devicesId.videoinput }]
          },
          audio: withAudio
        };
        navigator.mediaDevices.getUserMedia(constraints)
          .then((stream) => {
            resolve(stream);
          })
          .catch((err) => {
            reject(this.$t('notifications.failed_to_start_video_change_source_or_res'));
          });
      });
    },

    startAudioFeed() {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: startAudioFeed');
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log('METHODS • Capture: startAudioFeed');
          
        this.getAudioFeed()
          .then((stream) => {
            this.audioStream = stream;
            resolve(stream);
          })
          .catch((err) => {
            alertify.error(err);
            reject();
          });
      });
    },

    getAudioFeed() {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: getAudioFeed');

        if(this.selected_devicesId.audioinput === '') {
          reject(this.$t('notifications.audio_source_not_set'));
        }
        const constraints = {
          video: false,
          audio: {
            optional: [{ sourceId: this.selected_devicesId.audioinput }]
          }
        };
        navigator.mediaDevices.getUserMedia(constraints)
          .then((stream) => {
            resolve(stream);
          })
          .catch((err) => {
            reject(this.$t('notifications.failed_to_start_audio_change_source'));
          });
      });
    },


  }
}

// CREATE A SOUND EQUALIZER
var equalizer = (function() {

  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function(callback, element){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  // Global Variables for Audio
  var sarahCouleur = "gray";
  var audioContext;
  var analyserNode;
  var javascriptNode;
  var sampleSize = 1024;  // number of samples to collect before analyzing
                          // decreasing this gives a faster sonogram, increasing it slows it down
  var amplitudeArray;     // array to hold frequency data
  var audioStream;
  var sourceNode;

  // Global Variables for Drawing
  var column = 0;
  var canvasWidth  = 720;
  var canvasHeight = 360;
  var ctx;

  var API = {
    start : function(canvasEl, stream) {
      debugger;
      ctx = canvasEl.getContext("2d");

      window.AudioContext = (function(){
          return  window.AudioContext || window.mozAudioContext;
      })();

      try {
          audioContext = new AudioContext();
      } catch(e) {
          console.log('Web Audio API is not supported in this browser');
      }
      startEqualizer( stream);

    },
    stop : function() {
      stopEqualizer();
    },
    clearCanvas : function() {
      clearCanvas();
    }
  }

  function startEqualizer( stream){
    console.log( 'starting equalizer');
    // e.preventDefault();
    clearCanvas();
    // Initialise getUserMedia
    setupAudioNodes( stream);
  }

  function stopEqualizer(){
    if( javascriptNode !== undefined)
      javascriptNode.onaudioprocess = null;
    if(audioStream !== undefined)
      audioStream.stop();
    if(sourceNode !== undefined)
      sourceNode.disconnect();
  }

  function setupAudioNodes(stream) {
    // create the media stream from the audio input source (microphone)
    sourceNode = audioContext.createMediaStreamSource(stream);
    audioStream = stream;

    analyserNode   = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);

    // Create the array for the data values
    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

    // setup the event handler that is triggered every time enough samples have been collected
    // trigger the audio analysis and draw one column in the display based on the results
    javascriptNode.onaudioprocess = function () {

        amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteTimeDomainData(amplitudeArray);

        // draw one column of the display
        requestAnimFrame(drawTimeDomain);
    }

    // Now connect the nodes together
    // Do not connect source node to destination - to avoid feedback
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
  }

  function onError(e) {
      console.log(e);
  }

  function drawTimeDomain() {
      var minValue = 9999999;
      var maxValue = 0;
      for (var i = 0; i < amplitudeArray.length; i++) {
          var value = amplitudeArray[i] / 256;
          if(value > maxValue) {
              maxValue = value;
          } else if(value < minValue) {
              minValue = value;
          }
      }

      var y_lo = canvasHeight - (canvasHeight * minValue) - 1;
      var y_hi = canvasHeight - (canvasHeight * maxValue) - 1;

      ctx.fillStyle = sarahCouleur;
      ctx.fillRect(column,y_lo, 1, y_hi - y_lo);
      // loop around the canvas when we reach the end
      column += 1;
      if(column >= canvasWidth) {
          column = 0;
          clearCanvas();
      }
  }

  function clearCanvas() {
    if(ctx === undefined) {
      return;
    }

    column = 0;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = 'blue';
    var y = (canvasHeight / 2) + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth-1, y);
    ctx.stroke();
  }

  return API;
})();

</script>
<style>

</style>