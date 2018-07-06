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
          <div class="picto">
            <img :src="mode.picto">
          </div>
          <span>{{ $t(mode.key) }}</span>
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

        <!-- <transition name="enableMode" :duration="100"> -->
          <div class="m_panel--modeOverlay"
            v-if="mode_just_changed"
          >
            {{ selected_mode }}
          </div>
        <!-- </transition> -->
        
        <div class="m_panel--previewCard">
          <transition name="mediaCapture" :duration="100">
            <div class="m_panel--previewCard--captureOverlay"
              v-if="capture_button_pressed"
            />
          </transition>
          <video 
            v-show="['photo', 'video', 'stopmotion'].includes(selected_mode)"
            ref="videoElement" 
            autoplay 
          /> 
          <canvas 
            v-if="selected_mode === 'audio'"
            ref="equalizerElement" width="720" height="360" 
          />
          <div id="vectoContainer" v-if="selected_mode === 'vecto'" v-html="vecto.svgstr">
          </div>
        </div>
        <div class="m_panel--buttons" :class="{ 'bg-rouge' : isRecording }">
          <button type="button" 
            class="padding-verysmall bg-blanc"
            @click="captureOrStop()"
          >
            <img 
              :src="recordButtonSrc"
            />
          </button>

          <div v-if="selected_mode === 'vecto'">
            <div class="m_metaField">
              <div>
                Lissage
              </div>
              <div>
                <input type="range" v-model="vecto.blurradius" min="0" max="20">
              </div>
            </div>
          </div>

          <span class="switch" v-if="selected_mode === 'video'">
            <input type="checkbox" class="switch" id="recordVideoWithAudio" v-model="recordVideoWithAudio">
            <label for="recordVideoWithAudio">Enregistrer le son</label>
          </span>
        </div>
      </div>

      <div class="m_panel">
        <div class="m_panel--previewCard"
          v-if="justCapturedMediaData.hasOwnProperty('type') && selected_mode !== 'stopmotion'"
        >
          <MediaContent
            :context="'edit'"
            :slugFolderName="justCapturedMediaData.slugFolderName"
            :media="justCapturedMediaData"
            :mediaURL="mediaURL"
          >
          </MediaContent>  
        </div>
        <StopmotionPanel 
          v-else-if="$root.store.stopmotions.hasOwnProperty(current_stopmotion)"        
          :stopmotiondata="$root.store.stopmotions[current_stopmotion]"
          :slugProjectName="this.slugProjectName"
        >
        </StopmotionPanel>        
      </div>

    </div>

    <div class="m_captureview--options">
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

      <fieldset v-show="true">
        <legend>Resolution</legend>
        <div 
          v-for="res in available_camera_resolutions"
          :key="res.name"
        >
          <input type="radio" :id="res.name" :value="res" v-model="current_camera_resolution">
          <label :for="res.name">
            <span>{{ res.name }}</span>
          </label>
        </div>
      </fieldset>
    </div>
  </div>
</template>
<script>
import MediaContent from './components/subcomponents/MediaContent.vue';
import StopmotionPanel from './components/subcomponents/StopmotionPanel.vue';

import RecordRTC from 'recordrtc';
import { setTimeout, setInterval } from 'timers';
import 'webrtc-adapter';
import ImageTracer from 'imagetracerjs';

export default {
  props: {
    project: {
      type: Object,
      default: ''
    },
    slugProjectName: String
  },
  components: {
    MediaContent,
    StopmotionPanel
  },
  data() {
    return {
      selected_mode: '',
      available_modes: [
        { 
          picto: '/images/i_icone-dodoc_image.svg',
          key: 'photo'
        },
        {
          picto: '/images/i_icone-dodoc_video.svg',
          key: 'video'
        },
        {
          picto: '/images/i_icone-dodoc_anim.svg',
          key: 'stopmotion'
        },
        {
          picto: '/images/i_icone-dodoc_audio.svg',
          key: 'audio'
        },
        {
          picto: '/images/i_icone-dodoc_vecto.svg',
          key: 'vecto'
        }
      ],

      isRecording: false,
      recordVideoFeed: undefined,
      recordVideoWithAudio: true,

      capture_button_pressed: false,

      justCapturedMediaData: {},
      videoStream: null,
      audioStream: null,
      available_devices: {},
      mode_just_changed: false,

      current_stopmotion: false,

      current_camera_resolution: {
        name: 'vga',
        width: 640,
        height: 480
      },
      available_camera_resolutions: [
        {
          name: 'qvga',
          width: 320,
          height: 240
        },
        {
          name: 'vga',
          width: 640,
          height: 480
        },
        {
          name: 'hd',
          width: 1280,
          height: 720
        },
        {
          name: 'full hd',
          width: 1920,
          height: 1080
        }
      ],
      selected_devicesId: {
        audioinput: '',
        videoinput: '',
        audiooutput: ''
      },
      vecto: {
        svgstr: '',
        blurradius: 0
      }
    }
  },
  created() {
    this.init();
  },
  mounted() {
    document.addEventListener('keyup', this.captureKeyListener);
  },
  beforeDestroy() {
    document.removeEventListener('keyup', this.captureKeyListener);
    this.stopAllFeeds();
  },

  watch: {
    'selected_devicesId.audioinput': function() {
      console.log(`WATCH • Capture: selected_devicesId.audioinput = ${this.selected_devicesId.audioinput}`);
      this.stopAllFeeds().then(() => {
        if(this.$refs.hasOwnProperty('videoElement') && this.$refs.videoElement !== undefined) {       
          this.$refs.videoElement.setSinkId(this.selected_devicesId.audioinput);      
          this.startMode();
        }
      });
    },
    'selected_devicesId.videoinput': function() {
      console.log(`WATCH • Capture: selected_devicesId.videoinput = ${this.selected_devicesId.videoinput}`);
      this.startMode();
    },
    'selected_mode': function() {
      console.log('WATCH • Capture: selected_mode');

      this.mode_just_changed = true;
      setTimeout(()=> {
        this.mode_just_changed = false;
      }, 1000);
      this.$nextTick(() => {
        this.startMode();
      });
      this.justCapturedMediaData = {};
    },
    'isRecording': function() {
      equalizer.setSarahCouleur(this.isRecording);
    },
    'current_camera_resolution': function() {
      console.log(`WATCH • Capture: current_camera_resolution = ${this.current_camera_resolution}`);
      // this.stopAllFeeds().then(() => {
      //   this.startCameraFeed();
      // });      
      this.startMode();
    }
  },
  computed: {
    sorted_available_devices() {
      return this.$_.groupBy(this.available_devices, 'kind');
    },
    recordButtonSrc() {
      return !this.isRecording ? '/images/i_record.svg':'/images/i_stop.svg';
    }
  },
  methods: {
    init() {
      console.log('METHODS • CaptureView: init');
      navigator.mediaDevices.enumerateDevices()
      .then((deviceInfos) => {
        this.available_devices = deviceInfos;

        // get from localstorage and put in selected_devicesId.audioinput, selected_devicesId.videoinput and selected_devicesId.audiooutput 
        // set initial value

        Object.keys(this.selected_devicesId).map((kind) => {
          if(this.selected_devicesId[kind] === '') {
            if(this.sorted_available_devices.hasOwnProperty(kind)) {
              let selected_devicesId = this.sorted_available_devices[kind][0].deviceId;
              if(kind === 'videoinput') {
                const camera_back = this.sorted_available_devices[kind].filter(x => {
                  return x.label.includes('back')
                });              
                if(camera_back.length > 0) {
                  selected_devicesId = this.selected_devicesId[kind] = camera_back[0].deviceId;
                }
              }
              this.selected_devicesId[kind] = selected_devicesId;              
            }
          }
        });

        // get last mode from localstorage
        // otherwise start first mode
        this.selected_mode = this.available_modes[0].key;
      });
    },
    startMode() {
      console.log('METHODS • CaptureView: startMode');

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
      } else 
      if(this.selected_mode === 'vecto') {
        this.stopAllFeeds().then(() => {
          this.startVectoFeed();
        });
      }      
    },
    previousMode() {
      console.log('METHODS • CaptureView: previousMode');
      let currentModeIndex = this.available_modes.findIndex((d) => {
        return d.key === this.selected_mode;
      });

      if(currentModeIndex > 0) {
        this.selected_mode = this.available_modes[currentModeIndex-1].key;
      }
    },
    nextMode() {
      console.log('METHODS • CaptureView: nextMode');
      let currentModeIndex = this.available_modes.findIndex((d) => {
        return d.key === this.selected_mode;
      });

      if(currentModeIndex < this.available_modes.length-1) {
        this.selected_mode = this.available_modes[currentModeIndex+1].key;
      }
    },
    captureKeyListener(evt) {
      console.log('METHODS • CaptureView: captureKeyListener');
      switch(evt.key) {
        case 'w':
        case 'z':
        case 'ArrowLeft':
          this.previousMode();
          break;
        case 's':
        case 'ArrowRight':
          this.nextMode();
          break;
        case 'a':
        case 'q':
        case ' ':
          this.captureOrStop();
          break;
      }

    },
    stopAudioFeed() {
      console.log('METHODS • CaptureView: stopAudioFeed');
      if(this.audioStream) {
        this.audioStream.getAudioTracks().forEach(function(track) {
          track.stop();
        });
        this.audioStream = null;
      }
      equalizer.stop();
    },
    stopVideoFeed() {
      console.log('METHODS • CaptureView: stopVideoFeed');        
      if(this.videoStream) {
        this.videoStream.getVideoTracks().forEach(function(track) {
          track.stop();
        });
        this.$refs.videoElement.srcObject = null;
        this.videoStream = null;
      }
    },
    stopAllFeeds() {
      return new Promise((resolve, reject) => {
        console.log('METHODS • CaptureView: stopAllFeeds');
        
        this.stopAudioFeed();
        this.stopVideoFeed();
        resolve();
      });
    },

    startCameraFeed(withAudio = false) {
      return new Promise((resolve, reject) => {
        console.log('METHODS • CaptureView: startCameraFeed');
        if(this.selected_devicesId.videoinput === '') {
          return reject(this.$t('notifications.video_source_not_set'));
        }

        this.getCameraFeed(withAudio)
          .then((stream) => {
            console.log('METHODS • CaptureView: startCameraFeed / got camera stream');
            if(this.videoStream !== stream) {
              this.videoStream = stream;
              this.$refs.videoElement.srcObject = stream;
              this.$refs.videoElement.volume = 0;
            }
            return resolve();
          })
          .catch((err) => {
            this.$alertify.error(err);
            reject();
          });
      });
    },

    getCameraFeed(withAudio = false) {
      return new Promise((resolve, reject) => {
        console.log('METHODS • CaptureView: getCameraFeed');

        const constraints = {
          video: {
            optional: [{ sourceId: this.selected_devicesId.videoinput }],
            mandatory: {
              // minWidth:"1280","maxWidth":"1280","minHeight":"720","maxHeight":"720"
              // minWidth:"640","maxWidth":"640","minHeight":"480","maxHeight":"480"
              minWidth: this.current_camera_resolution.width,
              maxWidth: this.current_camera_resolution.width,
              minHeight: this.current_camera_resolution.height,
              maxHeight: this.current_camera_resolution.height
            }
          },
          audio: withAudio
        };
        navigator.getUserMedia(constraints,
          (stream) => {
            resolve(stream);
          },
          (err) => {
            return reject(this.$t('notifications.failed_to_start_video_change_source_or_res'));
          }
        );
      });
    },

    startAudioFeed() {
      return new Promise((resolve, reject) => {
        console.log('METHODS • CaptureView: startAudioFeed');
        // this.$alertify
        //   .closeLogOnClick(true)
        //   .delay(4000)
        //   .log('METHODS • CaptureView: startAudioFeed');
          
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
        console.log('METHODS • CaptureView: getAudioFeed');

        if(this.selected_devicesId.audioinput === '') {
          reject(this.$t('notifications.audio_source_not_set'));
        }
        const constraints = {
          video: false,
          audio: {
            optional: [{ sourceId: this.selected_devicesId.audioinput }]
          }
        };
        navigator.getUserMedia(constraints,
          (stream) => {
            return resolve(stream);
          },
          (err) => {
            return reject(this.$t('notifications.failed_to_start_video_change_source_or_res'));
          });
      });
    },

    getStaticImageFromVideoElement() {
      return new Promise((resolve, reject) => {
        let invisibleCanvas = document.createElement('canvas');
        invisibleCanvas.width = this.$refs.videoElement.videoWidth;
        invisibleCanvas.height = this.$refs.videoElement.videoHeight;
        let invisibleCtx = invisibleCanvas.getContext('2d');
        invisibleCtx.drawImage( this.$refs.videoElement, 0, 0, invisibleCanvas.width, invisibleCanvas.height);
        var imageData = invisibleCanvas.toDataURL('image/png');
        if(imageData === "data:,") {
          return reject(this.$t('notifications.video_stream_not_available'));
        }
        return resolve(imageData);
      });
    },   

    startRecordCameraFeed(withAudio = false) {
      return new Promise((resolve, reject) => {
        this.startCameraFeed(withAudio).then(() => {
          let recordVideoFeed = RecordRTC(this.videoStream);

          const options = {
            recorderType: RecordRTC.MediaStreamRecorder,
            type: 'video'
          }
          recordVideoFeed.startRecording(options);   

          this.isRecording = true;

          this.$eventHub.$on('capture.stopRecording', () => {
            this.$eventHub.$off('capture.stopRecording');
            recordVideoFeed.stopRecording(() => {
              this.isRecording = false;
              recordVideoFeed.getDataURL(videoDataURL => {
                recordVideoFeed = null;
                return resolve(videoDataURL);
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

    captureOrStop() {
      // this.justCapturedMediaData = {};

      this.capture_button_pressed = true;
      setTimeout(() => {
        this.capture_button_pressed = false;
      }, 400);

      if(this.isRecording) {
        this.$eventHub.$emit('capture.stopRecording');
        return;
      }

      if(this.selected_mode === 'photo') {        
        this.getStaticImageFromVideoElement().then(imageData => {
          this.$eventHub.$on('socketio.media_created_or_updated', this.newMediaCaptured);
          this.$root.createMedia({
            slugFolderName: this.slugProjectName,
            type: 'projects',
            rawData: imageData,
            additionalMeta: {
              type: 'image'          
            }
          });
        });
      } else 
      if(this.selected_mode === 'video') {        
        this.startRecordCameraFeed(this.recordVideoWithAudio).then(videoDataURL => {
          this.$eventHub.$on('socketio.media_created_or_updated', this.newMediaCaptured);
          this.$root.createMedia({
            slugFolderName: this.slugProjectName,
            type: 'projects',
            rawData: videoDataURL,
            additionalMeta: {
              type: 'video'          
            }
          });
        });

      } else
      if(this.selected_mode === 'audio') { 
        equalizer.clearCanvas();
        this.startRecordAudioFeed().then(audioDataURL => {
          this.$eventHub.$on('socketio.media_created_or_updated', this.newMediaCaptured);
          this.$root.createMedia({
            slugFolderName: this.slugProjectName,
            type: 'projects',
            rawData: audioDataURL,
            additionalMeta: {
              type: 'audio'          
            }
          });
        });
      } else
      if(this.selected_mode === 'stopmotion') { 
        const smdata = {
          name: this.slugProjectName + '-' + this.$moment().format('YYYYMMDD_HHmmss'),
          authors: this.$root.settings.current_author.name
        };

        this.$eventHub.$on('socketio.media_created_or_updated', this.newStopmotionImageCaptured);
        this.getStaticImageFromVideoElement().then(imageData => {
          if(!this.current_stopmotion) {
            this.$eventHub.$on('socketio.folder_created_or_updated', (fdata) => {
              if(fdata.id === this.$root.justCreatedFolderID) {
                this.$eventHub.$off('socketio.folder_created_or_updated');
                this.current_stopmotion = fdata.slugFolderName;
                this.addImageToStopmotion(imageData);
              }
            });
            this.$root.createFolder({ 
              type: 'stopmotions', 
              data: smdata 
            });      
          } else {
            this.addImageToStopmotion(imageData);
          }
        });
      } else
      if(this.selected_mode === 'vecto') { 
        this.$eventHub.$on('socketio.media_created_or_updated', this.newMediaCaptured);
        this.$root.createMedia({
          slugFolderName: this.slugProjectName,
          type: 'projects',
          rawData: btoa(this.vecto.svgstr),
          additionalMeta: {
            type: 'svg'          
          }
        });
      }
    },

    newMediaCaptured(mdata) {
      console.log('METHODS • CaptureView: newMediaCaptured');
      if (this.$root.justCreatedMediaID === mdata.id) {
        this.justCapturedMediaData = mdata;
        this.$root.justCreatedMediaID = false;
        this.$eventHub.$off('socketio.media_created_or_updated', this.newMediaCaptured);
      }
    },

    addImageToStopmotion(imageData) {
      console.log('METHODS • CaptureView: addImageToStopmotion');
      this.$root.createMedia({
        slugFolderName: this.current_stopmotion,
        type: 'stopmotions',
        rawData: imageData,
        additionalMeta: {
          type: 'image'          
        }
      });
    },
    newStopmotionImageCaptured(mdata) {
      console.log('METHODS • CaptureView: newStopmotionImageCaptured');
      if (this.$root.justCreatedMediaID === mdata.id) {
        this.justCapturedMediaData = mdata;
        this.$root.justCreatedMediaID = false;
        this.$eventHub.$off('socketio.media_created_or_updated', this.newStopmotionImageCaptured);
      }
    },
    startVectoFeed() {
      return new Promise((resolve, reject) => {
        console.log('METHODS • CaptureView: startVectoFeed');
        if(this.selected_devicesId.videoinput === '') {
          return reject(this.$t('notifications.video_source_not_set'));
        }

        this.current_camera_resolution = this.available_camera_resolutions[1];
  
        this.startCameraFeed()
          .then(() => {
            let scanToVecto = () => {
              if(this.selected_mode !== 'vecto' || !this.videoStream) {
                return;
              }
              this.getStaticImageFromVideoElement().then(imageData => {
                ImageTracer.imageToSVG(
                  imageData,
                  (svgstr) => {
                    this.vecto.svgstr = svgstr;
                    setTimeout(scanToVecto, 500);
                  },
                  { 
                    colorsampling: false,
                    numberofcolors: 2, 
                    colorquantcycles: 1,
                    scale: 1,
                    strokewidth: 1,
                    blurradius: this.vecto.blurradius,
                    pal : [{r:255,g:255,b:255,a:255}, {r:0,g:0,b:0,a:255}]
                    // pal : [{r:255,g:255,b:255,a:255}, {r:214,g:0,b:103,a:255}]
                  }
                );
              });
            };
            setTimeout(scanToVecto, 500);

            resolve();
          })
          .catch((err) => {
            this.$alertify.error(err);
            reject();
          });

      });
    }

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
