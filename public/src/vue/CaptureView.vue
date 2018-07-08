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
      :class="{ 'stopmotion_inprogress' : $root.store.stopmotions.hasOwnProperty(current_stopmotion) }"
    >
      <div class="m_panel">

        <transition name="enableMode" :duration="400">
          <div class="m_panel--modeOverlay"
            v-if="mode_just_changed"
          >
            {{ $t(selected_mode) }}
          </div>
        </transition>
        
        <div class="m_panel--previewCard">

          <div class="m_panel--previewCard--live">
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

          <transition name="fade" :duration="600">
            <div class="m_panel--previewCard--validate" v-if="media_to_validate">
              <img 
                v-if="media_to_validate.type === 'image'" 
                :src="media_to_validate.rawData"
              />
              <video 
                v-else-if="media_to_validate.type === 'video'" 
                :src="media_to_validate.rawData"
                controls
              />
              <img 
                v-else-if="media_to_validate.type === 'audio'" 
                :src="media_to_validate.preview"
              />
              <div 
                v-else-if="media_to_validate.type === 'svg'" 
                v-html="media_to_validate.preview"
              />
            </div>
          </transition>

          <transition name="mediaCapture" :duration="400">
            <div class="m_panel--previewCard--captureOverlay"
              v-show="capture_button_pressed"
            />
          </transition>

        </div>
        <div class="m_panel--buttons">

          <div class="m_panel--buttons--row" :class="{ 'bg-orange' : is_recording }">
            <div />
  
            <button type="button" 
              class="padding-verysmall bg-transparent m_panel--buttons--row--captureButton"
              :class="{ 'is--justCaptured' : capture_button_pressed }"
              @click="captureOrStop()"
            >
              <img v-if="!this.is_recording" src="/images/i_record.svg">
              <img v-else src="/images/i_stop.svg">
            </button>

            <div class="m_panel--buttons--row--options">
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

              <span class="switch switch-xs" v-if="selected_mode === 'video' && !is_recording">
                <input type="checkbox" class="switch" id="recordVideoWithAudio" v-model="recordVideoWithAudio">
                <label for="recordVideoWithAudio">{{ $t('with_sound') }}</label>
              </span>
            </div>
          </div>
          <transition name="slideup" :duration="400">
            <div class="m_panel--buttons--row m_panel--buttons--row_validate"
              v-if="media_to_validate"
            >
              <button
                type="button"
                class="button button-bg_rounded button-outline c-blanc"
                @click="media_to_validate = false"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                  viewBox="0 0 168 168" style="enable-background:new 0 0 168 168;" xml:space="preserve">
                <polygon  points="42.6,57.2 57.5,42.4 84.1,69 110.8,42.4 125.6,57.2 99,83.9 125.6,110.5 110.8,125.4 
                84.1,98.7 57.5,125.4 42.6,110.5 69.3,83.9 			"/>

                </svg>
                <span class="text-cap font-verysmall">
                  {{ $t('cancel') }}
                </span>
              </button>

              <button
                type="button"
                :disabled="read_only"
                @click="sendMedia"
                class="button button-bg_rounded button-outline c-rouge is--selected"
              >
                <svg version="1.1" class="" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                  viewBox="0 0 168 168" style="enable-background:new 0 0 168 168;" xml:space="preserve">
                  <rect x="51.4" y="73.1" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -53.857 72.9892)" width="19.5" height="56.8"/>
                  <rect x="53.2" y="77.3" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -31.6875 97.6563)" width="97.6" height="19.5"/>
                </svg>
                <span class="text-cap font-verysmall c-rouge">
                  {{ $t('save') }}
                </span>
              </button>

              <button
                type="button"
                :disabled="read_only"
                @click="sendMedia({ fav: true })"
                class="button button-bg_rounded button-outline c-rouge"
              >
                <svg version="1.1"
                  class="padding-verysmall"
                  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
                  x="0px" y="0px" width="68.5px" height="80.4px" viewBox="0 0 78.5 106.4" style="enable-background:new 0 0 78.5 106.4;"
                  xml:space="preserve">
                  <polygon class="st0" points="60.4,29.7 78.5,7.3 78.5,7.3 12.7,7.3 12.7,52 78.5,52 78.5,52 	"/>
                  <polygon class="st0" points="9.6,106.4 0,106.4 0,2 9.6,0 "/>
                </svg>
                <span class="text-cap font-verysmall">
                  <template v-if="sending"> 
                    <span class="loader loader-xs" />
                  </template>
                  {{ $t('save') }}<br>{{ $t('as_favorite') }}
                </span>
              </button>
              <div class="m_panel--buttons--row--overlay c-orange"
                v-if="media_is_being_sent"
              >
                <span class="loader loader-xs" />
              </div>

            </div>
          </transition>
        </div>

      </div>

      <div class="m_panel"
        v-if="$root.store.stopmotions.hasOwnProperty(current_stopmotion)"        
      >
        <StopmotionPanel 
          :stopmotiondata="$root.store.stopmotions[current_stopmotion]"
          :slugProjectName="this.slugProjectName"
          @close="current_stopmotion = false"
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
import 'webrtc-adapter';
import ImageTracer from 'imagetracerjs';

export default {
  props: {
    project: {
      type: Object,
      default: ''
    },
    slugProjectName: String,
    read_only: Boolean
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

      recordVideoFeed: undefined,
      recordVideoWithAudio: true,

      capture_button_pressed: false,
      videoStream: null,
      audioStream: null,
      available_devices: {},
      mode_just_changed: false,
      is_recording: false,

      media_to_validate: false,
      media_is_being_sent: false,
      media_send_timeout: 10000,
      media_send_timeout_timer: false,

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
    // this.$refs.videoElement.srcObject = null;
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
      window.setTimeout(()=> {
        this.mode_just_changed = false;
      }, 1000);
      this.$nextTick(() => {
        this.startMode();
      });
    },
    'is_recording': function() {
      equalizer.setSarahCouleur(this.is_recording);
    },
    'current_camera_resolution': function() {
      console.log(`WATCH • Capture: current_camera_resolution = ${this.current_camera_resolution}`);
      // this.stopAllFeeds().then(() => {
      //   this.startCameraFeed();
      // });      
      this.startMode();
    },
    'media_to_validate': function() {
      console.log(`WATCH • Capture: media_to_validate = ${this.media_to_validate}`);
      if(this.media_to_validate) {
        this.$refs.videoElement.pause();
      } else {
        this.$refs.videoElement.play();
      }
    }
  },
  computed: {
    sorted_available_devices() {
      return this.$_.groupBy(this.available_devices, 'kind');
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

          this.is_recording = true;

          this.$eventHub.$on('capture.stopRecording', () => {
            this.$eventHub.$off('capture.stopRecording');
            recordVideoFeed.stopRecording(() => {
              this.is_recording = false;
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

          this.is_recording = true;

          this.$eventHub.$on('capture.stopRecording', () => {
            this.$eventHub.$off('capture.stopRecording');

            recordAudioFeed.stopRecording(() => {
              this.is_recording = false;
              recordAudioFeed.getDataURL(audioDataURL => {
                resolve(audioDataURL);
              })
            });
          });
        }
      });
    },

    captureOrStop() {
      this.capture_button_pressed = true;
      window.setTimeout(() => {
        this.capture_button_pressed = false;
      }, 400);

      if(this.is_recording) {
        this.$eventHub.$emit('capture.stopRecording');
        return;
      }

      if(this.selected_mode === 'photo') {        
        this.getStaticImageFromVideoElement().then(rawData => {
          this.media_to_validate = {
            rawData,
            type: 'image'
          };
        });
      } else 
      if(this.selected_mode === 'video') {    
        this.stopVideoFeed();   
        window.setTimeout(() => {
          this.startRecordCameraFeed(this.recordVideoWithAudio).then(rawData => {
            this.media_to_validate = {
              rawData,
              type: 'video'
            };
          });
        },500);       
      } else
      if(this.selected_mode === 'audio') { 
        equalizer.clearCanvas();
        this.startRecordAudioFeed().then(rawData => {
          const preview = this.$refs.equalizerElement.toDataURL('image/png');
          debugger;
          this.media_to_validate = {
            preview,
            rawData,
            type: 'audio'
          };
        });
      } else
      if(this.selected_mode === 'stopmotion') { 
        const smdata = {
          name: this.slugProjectName + '-' + this.$moment().format('YYYYMMDD_HHmmss'),
          authors: this.$root.settings.current_author.name
        };

        this.getStaticImageFromVideoElement().then(imageData => {
          if(!this.current_stopmotion) {
            // create stopmotion
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
            // append to stopmotion
            this.addImageToStopmotion(imageData);
          }
        });
      } else
      if(this.selected_mode === 'vecto') { 
        this.media_to_validate = {
          preview: this.vecto.svgstr,
          rawData: btoa(this.vecto.svgstr),
          type: 'svg'
        };
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
              } else if(this.media_to_validate) {
                window.setTimeout(scanToVecto, 500);
                return;
              }
              this.getStaticImageFromVideoElement().then(imageData => {
                ImageTracer.imageToSVG(
                  imageData,
                  (svgstr) => {
                    this.vecto.svgstr = svgstr;
                    window.setTimeout(scanToVecto, 500);
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
            window.setTimeout(scanToVecto, 500);

            resolve();
          })
          .catch((err) => {
            this.$alertify.error(err);
            reject();
          });

      });
    },
    sendMedia: function({ fav = false }) {
      console.log(`METHODS • ValidateMedia: sendMedia with fav=${fav}`);
      this.$eventHub.$on('socketio.media_created_or_updated', this.newMediaSent);
      this.$root.createMedia({
        slugFolderName: this.slugProjectName,
        type: 'projects',
        rawData: this.media_to_validate.rawData,
        additionalMeta: {
          type: this.media_to_validate.type,
          fav: fav
        }
      });
      this.media_is_being_sent = true;

      this.media_send_timeout_timer = window.setTimeout(() => {
        this.media_is_being_sent = false;
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(this.$t('notifications.media_couldnt_been_sent'));
      }, this.media_send_timeout);

    },
    newMediaSent(mdata) {
      console.log('METHODS • ValidateMedia: newMediaSent');
      if (this.$root.justCreatedMediaID === mdata.id) {
        this.$root.justCreatedMediaID = false;
        this.$eventHub.$off('socketio.media_created_or_updated', this.newMediaSent);

        window.clearTimeout(this.media_send_timeout_timer);
        this.media_send_timeout_timer = undefined;        

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(this.$t('notifications.media_was_sent'));
        this.media_is_being_sent = false;
        this.media_to_validate = false;
      }
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
