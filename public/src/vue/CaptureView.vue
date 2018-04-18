<template>
  <div class="m_captureview">
    <div class="m_captureview--modeSelector">
      <button type="button" class="bg-transparent" @click="previousMode()">
        ◀
      </button>
      <div 
        v-for="mode in available_modes"
        :key="mode.key"
      >
        <input type="radio" :id="mode.key" :value="mode.key" v-model="selected_mode">
        <label :for="mode.key">
          <img :src="mode.picto">
          <span>{{ mode.name }}</span>
        </label>
      </div>
      <button type="button" class="bg-transparent" @click="nextMode()">
        ▶
      </button>
    </div>

    <div class="m_captureview--panels"
      :class="{ 'is--justCaptured' : justCapturedMediaData.hasOwnProperty('type') }"
    >
      <div class="m_panel">
        <div class="m_panel--previewCard">
          <video 
            v-show="['photo', 'video', 'stopmotion'].includes(selected_mode)"
            ref="videoElement" 
            autoplay 
          /> 
          <canvas 
            v-if="selected_mode === 'audio'"
            ref="equalizerElement" width="720" height="360" 
          />
        </div>
        <div class="m_panel--buttons">
          <button type="button" 
            v-if="!isRecording"
            class="padding-verysmall bg-blanc"
            @click="capture()"
          >
            <img src="/images/i_record.svg">
          </button>
          <button type="button" 
            v-if="isRecording"
            class="padding-verysmall bg-blanc"
            @click="$eventHub.$emit('capture.stopRecording')"
          >
            <img src="/images/i_stop.svg">
          </button>
          <span class="switch" v-if="selected_mode === 'video'">
            <input type="checkbox" class="switch" id="recordVideoWithAudio" v-model="recordVideoWithAudio">
            <label for="recordVideoWithAudio">Enregistrer le son</label>
          </span>
        </div>
      </div>

      <div class="m_panel">
        <div class="m_panel--previewCard">
          <template v-if="justCapturedMediaData.hasOwnProperty('type')">
            <MediaContent
              :context="'edit'"
              :slugMediaName="justCapturedMediaData.slugMediaName"
              :slugFolderName="slugFolderName"
              :media="justCapturedMediaData"
              :mediaURL="mediaURL"
            >
            </MediaContent>          
          </template>
        </div>
        <div class="m_panel--buttons">
          <button type="button" @click="justCapturedMediaData = {}">
            FERMER
          </button>
        </div>        
      </div>

    </div>


    <fieldset v-show="true">
      <legend>Sources</legend>
      <div v-for="(currentId, kind) in selected_devicesId" :key="kind">
        {{ kind }}
        <select v-if="sorted_available_devices.hasOwnProperty(kind)" v-model="selected_devicesId[kind]">
          <option 
            v-for="device in sorted_available_devices[kind]" 
            :value="device.deviceId" 
            :key="device.deviceId"
          >
            {{ device.label }}
          </option>        
        </select>
      </div>
    </fieldset>


  </div>
</template>
<script>
import MediaContent from './components/subcomponents/MediaContent.vue';

import RecordRTC from 'recordrtc';
import _ from 'underscore';
import { setTimeout } from 'timers';
import 'webrtc-adapter';

export default {
  props: {
    folder: {
      type: Object,
      default: ''
    },
    slugFolderName: String
  },
  components: {
    MediaContent
  },
  data() {
    return {
      selected_mode: '',
      available_modes: [
        { 
          name: this.$t('photo'),
          picto: '/images/i_icone-dodoc_image.svg',
          key: 'photo'
        },
        {
          name: this.$t('video'),
          picto: '/images/i_icone-dodoc_video.svg',
          key: 'video'
        },
        {
          name: this.$t('stopmotion'),
          picto: '/images/i_icone-dodoc_anim.svg',
          key: 'stopmotion'
        },
        {
          name: this.$t('audio'),
          picto: '/images/i_icone-dodoc_audio.svg',
          key: 'audio'
        }
      ],

      isRecording: false,
      recordVideoFeed: undefined,
      recordVideoWithAudio: true,

      justCapturedMediaData: {},
      videoStream: null,
      audioStream: null,
      available_devices: {},
      available_camera_resolutions: [
        {
          width: 320,
          height: 240
        },
        {
          width: 640,
          height: 480
        },
        {
          width: 1280,
          height: 720
        },
        {
          width: 1920,
          height: 1080
        }
      ],
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
    this.$eventHub.$on('socketio.new_media_captured', this.newMediaCaptured);
    this.$nextTick(() => {
      this.init();
    });
  },
  beforeDestroy() {
    this.$eventHub.$off('socketio.new_media_captured', this.newMediaCaptured);
    this.stopAllFeeds();
  },

  watch: {
    'selected_devicesId.audioinput': function() {
      console.log(`WATCH • Capture: selected_devicesId.audioinput = ${this.selected_devicesId.audioinput}`);
      this.stopAllFeeds().then(() => {
        if(this.$refs.hasOwnProperty('videoElement') && this.$refs.videoElement !== undefined) {       
          this.$refs.videoElement.setSinkId(this.selected_devicesId.audioinput);      
        }
      });
    },
    'selected_devicesId.videoinput': function() {
      console.log(`WATCH • Capture: selected_devicesId.videoinput = ${this.selected_devicesId.videoinput}`);
      this.stopAllFeeds().then(() => {
        this.startCameraFeed();
      });
    },
    'selected_mode': function() {
      console.log('WATCH • Capture: selected_mode');
      this.justCapturedMediaData = {};

      if(this.selected_mode === 'photo') {
        this.stopAllFeeds().then(() => {
          this.startCameraFeed();
        });
      } else 
      if(this.selected_mode === 'video') {
        this.stopAllFeeds().then(() => {
          this.startCameraFeed();
        });
      } else 
      if(this.selected_mode === 'stopmotion') {
        this.stopAllFeeds().then(() => {
          this.startCameraFeed();
        });
      } else 
      if(this.selected_mode === 'audio') {
        this.stopAllFeeds().then(() => {
          equalizer.clearCanvas();
          this.startAudioFeed()
          .then(stream => {
            equalizer.start(this.$refs.equalizerElement, stream);
          })
          .catch(err => {
          })      
        });
      }
    },
    'isRecording': function() {
      equalizer.setSarahCouleur(this.isRecording);
    }
  },
  computed: {
    sorted_available_devices() {
      return _.groupBy(this.available_devices, 'kind');
    }
  },
  methods: {
    init() {
      console.log('METHODS • Capture: init');
      navigator.mediaDevices.enumerateDevices()
      .then((deviceInfos) => {
        this.available_devices = deviceInfos;

        // get from localstorage and put in selected_devicesId.audioinput, selected_devicesId.videoinput and selected_devicesId.audiooutput 

        // set initial value

        Object.keys(this.selected_devicesId).map((kind) => {
          if(this.selected_devicesId[kind] === '') {
            if(this.sorted_available_devices.hasOwnProperty(kind)) {

              this.selected_devicesId[kind] = this.sorted_available_devices[kind][0].deviceId;

              if(kind === 'videoinput') {
                const camera_back = this.sorted_available_devices[kind].filter(x => {
                  return x.label.includes('back')
                });              
                if(camera_back.length > 0) {
                  this.selected_devicesId[kind] = camera_back[0].deviceId;
                }

              }

            }
          }
        });

        // get last mode from localstorage

        // otherwise start first mode
        this.selected_mode = this.available_modes[0].key;
      });
    },

    previousMode() {
      console.log('METHODS • Capture: previousMode');
      let currentModeIndex = this.available_modes.findIndex((d) => {
        return d.key === this.selected_mode;
      });

      if(currentModeIndex > 0) {
        this.selected_mode = this.available_modes[currentModeIndex-1].key;
      }
    },
    nextMode() {
      console.log('METHODS • Capture: nextMode');
      let currentModeIndex = this.available_modes.findIndex((d) => {
        return d.key === this.selected_mode;
      });

      if(currentModeIndex < this.available_modes.length-1) {
        this.selected_mode = this.available_modes[currentModeIndex+1].key;
      }
      
    },

    stopAudioFeed() {
      console.log('METHODS • Capture: stopAudioFeed');
      if(this.audioStream) {
        this.audioStream.getTracks().forEach((track) => track.stop());
        this.audioStream = undefined;
      }
      equalizer.stop();
    },
    stopVideoFeed() {
      console.log('METHODS • Capture: stopVideoFeed');
      if(!!this.videoStream) {
        for (let stream of this.videoStream.getVideoTracks()) {
          stream.stop();
        }        
        this.videoStream = null;
        if(!!this.$refs.videoElement) {
          this.$refs.videoElement.srcObject = null;
        }
      }
    },
    stopAllFeeds() {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: stopAllFeeds');
        this.stopAudioFeed();
        this.stopVideoFeed();
        setTimeout(() => resolve(), 500);
      });
    },

    startCameraFeed(withAudio = false) {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: startCameraFeed');
        if(this.selected_devicesId.videoinput === '') {
          return reject(this.$t('notifications.video_source_not_set'));
        }

        this.getCameraFeed(withAudio)
          .then((stream) => {
            this.videoStream = stream;
            this.$refs.videoElement.srcObject = stream;
            this.$refs.videoElement.volume = 0;
            resolve();
          })
          .catch((err) => {
            this.$alertify.error(err);
            reject();
          });
      });
    },

    getCameraFeed(withAudio = false) {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: getCameraFeed');

        const constraints = {
          video: {
            optional: [{ sourceId: this.selected_devicesId.videoinput }],
            mandatory: {
              minWidth:"1280","maxWidth":"1280","minHeight":"720","maxHeight":"720"
            }
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
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log('METHODS • Capture: startAudioFeed');
          
        this.getAudioFeed()
          .then((stream) => {
            this.audioStream = stream;
            resolve(stream);
          })
          .catch((err) => {
            this.$alertify.error(err);
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

    getStaticImageFromVideoElement(videoElement) {
      return new Promise((resolve, reject) => {
        let invisibleCanvas = document.createElement('canvas');
        invisibleCanvas.width = videoElement.videoWidth;
        invisibleCanvas.height = videoElement.videoHeight;
        let invisibleCtx = invisibleCanvas.getContext('2d');
        invisibleCtx.drawImage( videoElement, 0, 0, invisibleCanvas.width, invisibleCanvas.height);
        var imageData = invisibleCanvas.toDataURL('image/png');
        if(imageData === "data:,") {
          reject(this.$t('notifications.video_stream_not_available'));
        }
        resolve(imageData);
      });
    },   

    startRecordCameraFeed(withAudio = false) {
      return new Promise((resolve, reject) => {
        this.startCameraFeed(withAudio).then(() => {
          let recordVideoFeed = RecordRTC(this.videoStream);

          const options = {
            recorderType: RecordRTC.MediaStreamRecorder,
            mimeType: 'video/webm\;codecs=h264',
            type: 'video'
          }
          recordVideoFeed.startRecording(options);   

          this.isRecording = true;

          this.$eventHub.$on('capture.stopRecording', () => {
            this.$eventHub.$off('capture.stopRecording');

            recordVideoFeed.stopRecording(() => {
              this.isRecording = false;
              recordVideoFeed.getDataURL(videoDataURL => {
                resolve(videoDataURL);
              })
            });
          });
        });
      });
    },
    startRecordAudioFeed() {
      return new Promise((resolve, reject) => {
        if(!!this.audioStream) {
          let recordAudioFeed = RecordRTC(this.audioStream, {
            type: 'audio'
          });
          recordAudioFeed.startRecording();

          this.isRecording = true;

          this.$eventHub.$on('capture.stopRecording', () => {
            this.$eventHub.$off('capture.stopRecording');

            recordAudioFeed.stopRecording(() => {
              this.isRecording = false;
              recordAudioFeed.getDataURL(audioDataURL => {
                resolve(audioDataURL);
              })
            });
          });
        }
      });
    },
    capture() {

      this.justCapturedMediaData = {};

      if(this.selected_mode === 'photo') {        
        this.getStaticImageFromVideoElement(this.$refs.videoElement).then(imageData => {

          const mediaMeta = {
            slugFolderName: this.slugFolderName,
            type: 'image',
            rawData: imageData
          };

          if(this.$root.settings.current_author !== false) {
            mediaMeta.authors = this.$root.settings.current_author.name;
          }

          this.$root.createMediaFromCapture(mediaMeta);
        });
      } else 
      if(this.selected_mode === 'video') {        
        this.startRecordCameraFeed(this.recordVideoWithAudio).then(videoDataURL => {
          this.$root.createMediaFromCapture({
            slugFolderName: this.slugFolderName,
            type: 'video',
            rawData: videoDataURL
          });
        });

      } else
      if(this.selected_mode === 'audio') { 
        equalizer.clearCanvas();
        this.startRecordAudioFeed().then(audioDataURL => {
          this.$root.createMediaFromCapture({
            slugFolderName: this.slugFolderName,
            type: 'audio',
            rawData: audioDataURL
          });
        });
        
      }
    },

    newMediaCaptured(mdata) {
      if (this.$root.justCreatedCapturedMediaID && this.$root.justCreatedCapturedMediaID === mdata.mediaID) {
        this.justCapturedMediaData = mdata;
      }
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
    setSarahCouleur : function(isCurrentlyRecording) {
      if(isCurrentlyRecording) {
        sarahCouleur = 'red';
      } else {
        sarahCouleur = 'gray';
      }

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
<style lang="less">
</style>
