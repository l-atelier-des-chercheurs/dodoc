<template>
  <div class="m_captureview">
    <div class="m_captureview--modeSelector">
      <button type="button" class="bg-transparent" @click="previousMode()"
        v-show="!$root.settings.capture_mode_cant_be_changed"
      >
        ◀
      </button>
      <div 
        v-for="mode in available_modes"
        :key="mode.key"
      >
        <input type="radio" :id="mode.key" :value="mode.key" :disabled="$root.settings.capture_mode_cant_be_changed" v-model="selected_mode">
        <label :for="mode.key">
          <div class="picto">
            <img :src="mode.picto">
          </div>
          <span>{{ $t(mode.key) }}</span>
        </label>
      </div>
      <button type="button" class="bg-transparent" @click="nextMode()"
        v-show="!$root.settings.capture_mode_cant_be_changed"
      >
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
            <!-- OPTIONS -->
            <transition name="slideleft" :duration="400">
              <div class="m_panel--previewCard--live--options"
                v-if="show_capture_settings && !is_recording"
              >
                <div class="margin-bottom-small">
                  <div><label>Sources</label></div>
                  <div v-for="(currentId, kind) in selected_devicesId" :key="kind">
                    <span class="font-verysmall">
                      {{ kind }}
                    </span>
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
                </div>

                <div class="margin-bottom-small">
                  <div><label>Resolution</label></div>

                  <div v-if="actual_current_video_resolution">
                    <span class="font-verysmall">
                      {{ $t('current') }}&nbsp;: {{ actual_current_video_resolution.width }} x {{ actual_current_video_resolution.height }}
                    </span>
                  </div>
                  <div 
                    v-for="res in available_camera_resolutions"
                    :key="res.name"
                  >
                    <input type="radio" :id="res.name" :value="res" v-model="ideal_camera_resolution">
                    <label :for="res.name">
                      <span>{{ res.name }}</span>
                    </label>
                  </div>
                </div>


                <div class="margin-bottom-small">
                  <div><label>Accès à distance (experimental)</label></div>

                  <div class="margin-bottom-small">
                    <span class="switch switch-xs">
                      <input type="checkbox" class="switch" id="distantaccessswitch" v-model="$root.settings.capture_options.distant_flux.active">
                      <label for="distantaccessswitch">Activer</label>
                    </span>
                  </div>
                  
                  <template v-if="$root.settings.capture_options.distant_flux.active">
                    <div class="margin-bottom-small">
                      <span class="font-verysmall">
                        Partager les flux sous le nom&nbsp;:
                      </span>
                      <input type="text" v-model="current_username">
                    </div>

                    <div class="margin-bottom-small">
                      <span class="font-verysmall">
                        Accéder au flux qui a le nom&nbsp;:
                      </span>
                      <input type="text" v-model="callee_username">
                    </div>
                  </template>
                </div>

                <hr>

                <button
                  type="button"
                  @click="updateSettings"
                  class="button button-bg_rounded button-outline c-rouge"
                >
                  <span class="">
                    {{ $t('update') }}
                  </span>
                </button>
                
              </div>
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

            <MediaContent
              v-if="selected_mode === 'stopmotion' && stopmotion.onion_skin_img"
              class="m_panel--previewCard--live--onionskin"
              :context="'edit'"
              :slugFolderName="current_stopmotion"
              :media="stopmotion.onion_skin_img"
              :subfolder="'_stopmotions/'"
              :style="`--onionskin-opacity: ${stopmotion.onion_skin_opacity}`"
            />

            <div id="vectoContainer" v-if="selected_mode === 'vecto'" v-html="vecto.svgstr">
            </div>

          </div>

          <transition name="fade" :duration="600">
            <div class="m_panel--previewCard--validate" v-if="media_to_validate">
              <img 
                v-if="media_to_validate.type === 'image'" 
                :src="media_to_validate.objectURL"
              />
              <video 
                v-else-if="media_to_validate.type === 'video'" 
                :src="media_to_validate.objectURL"
                controls
              />
              <div 
                v-else-if="media_to_validate.type === 'audio'" 
                class="m_panel--previewCard--validate--audio"
              >
                <img 
                  :src="media_to_validate.preview"
                >
                <audio
                  :src="media_to_validate.objectURL"
                  controls
                />
              </div>
              <div 
                v-else-if="media_to_validate.type === 'svg'" 
                v-html="media_to_validate.preview"
              />
            </div>
          </transition>

          <transition name="mediaCapture" :duration="300">
            <div class="m_panel--previewCard--captureOverlay"
              v-show="capture_button_pressed"
            />
          </transition>

        </div>
        <div class="m_panel--buttons">
          <div class="m_panel--buttons--row" :class="{ 'bg-orange' : is_recording }">
            <button
              type="button"
              @click="show_capture_settings = !show_capture_settings"
              class="button c-rouge font-small bg-transparent"
              :disabled="is_recording"
            >
              <svg 
                class="inline-svg inline-svg_larger"
                version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 140 140" xml:space="preserve"
              >
                <path style="fill: currentColor" d="M122.7,88.8v-10c0-1.1,0.6-2.1,1.6-2.6l9.6-4.9l-2-5.8l-11,1.6c-1.1,0.2-2.2-0.3-2.9-1.2l-6-8.1
                  c-0.7-0.9-0.8-2.1-0.3-3l4.8-9.6l-5.2-3.6l-7.7,7.5c-0.8,0.8-2,1-3.1,0.7l-9.9-3c-1.1-0.3-1.9-1.3-2.1-2.4L86.8,34h-6.4l-1.7,10.4
                  c-0.2,1.1-0.9,2-2,2.4L66.8,50c-1.1,0.3-2.2,0.1-3.1-0.7L55.9,42l-5.1,3.7l4.9,9.4c0.5,1,0.4,2.1-0.2,3l-6,8.2
                  c-0.6,0.9-1.8,1.4-2.9,1.2L35.8,66L34,71.8l9.7,4.8c1,0.5,1.7,1.5,1.7,2.6v10c0,1.1-0.6,2.1-1.6,2.6l-9.6,4.9l2,5.9l10.9-1.6
                  c1.1-0.2,2.2,0.3,2.9,1.2l6,8.1c0.7,0.9,0.8,2.1,0.3,3l-4.8,9.6l5.1,3.6l7.7-7.5c0.8-0.8,2-1,3.1-0.7l9.9,3
                  c1.1,0.3,1.9,1.3,2.1,2.4l1.9,10.4h6.4l1.7-10.4c0.2-1.1,0.9-2,2-2.4l9.9-3.2c1.1-0.3,2.2-0.1,3.1,0.7l7.8,7.3l5.1-3.7l-4.9-9.4
                  c-0.5-1-0.4-2.1,0.2-3l6-8.1c0.7-0.9,1.8-1.4,2.9-1.2l10.8,1.5l1.8-5.9l-9.7-4.8C123.3,90.9,122.7,89.9,122.7,88.8z M84,104.5
                  c-11.7,0-21.1-9.2-21.1-20.5c0-11.3,9.5-20.5,21.1-20.5s21.1,9.2,21.1,20.5C105.1,95.3,95.7,104.5,84,104.5z"/>
              </svg>
              <span class="">
                {{ $t('settings') }}
              </span>
            </button>

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
                <label>
                  {{ $t('smoothing') }}
                </label>
                <input class="margin-none" type="range" v-model="vecto.blurradius" min="0" max="20">
              </div>

              <div
                v-if="selected_mode === 'stopmotion' && stopmotion.onion_skin_img"
              >
                <label>
                  {{ $t('onion_skin') }}
                </label>
                <input class="margin-none" type="range" v-model="stopmotion.onion_skin_opacity" min="0" max="1" step="0.01">
              </div>

              <span class="switch switch-xs" v-if="selected_mode === 'video'">
                <input 
                  class="switch" 
                  id="recordVideoWithAudio" 
                  type="checkbox" 
                  v-model="recordVideoWithAudio"
                  :disabled="is_recording"
                />
                <label for="recordVideoWithAudio">{{ $t('with_sound') }}</label>
              </span>
            </div>
          </div>
          <transition name="slideup" :duration="400">
            <MediaValidationButtons
              v-if="media_to_validate"
              :read_only="read_only"
              :media_is_being_sent="media_is_being_sent"
              :media_being_sent_percent="media_being_sent_percent"
              @cancel="cancelValidation()"
              @save="sendMedia({})"
              @save_and_fav="sendMedia({ fav: true })"
            />
          </transition>
        </div>
      </div>

      <div class="m_panel"
        v-if="$root.store.stopmotions.hasOwnProperty(current_stopmotion)"        
      >
        <StopmotionPanel 
          :stopmotiondata="$root.store.stopmotions[current_stopmotion]"
          :slugProjectName="slugProjectName"
          :read_only="read_only"
          @close="current_stopmotion = false"
          @new_single_image="updateSingleImage"
        >
        </StopmotionPanel>        
      </div>
    </div>
    <DistantFlux 
      v-if="this.$root.settings.capture_options.distant_flux.active"
      :key="this.$root.settings.capture_options.distant_flux.username = this.current_username"
      @changeStreamTo="new_stream => { changeStreamTo(new_stream) }"
    />
  </div>
</template>
<script>
import MediaContent from './components/subcomponents/MediaContent.vue';
import StopmotionPanel from './components/subcomponents/StopmotionPanel.vue';
import MediaValidationButtons from './components/subcomponents/MediaValidationButtons.vue';
import DistantFlux from './components/subcomponents/DistantFlux.vue';

import RecordRTC from 'recordrtc';
import 'webrtc-adapter';
import ImageTracer from 'imagetracerjs';
import { setTimeout } from 'timers';
import * as axios from 'axios';

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
    StopmotionPanel,
    MediaValidationButtons,
    DistantFlux
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

      show_capture_settings: false,

      capture_button_pressed: false,
      videoStream: null,
      audioStream: null,
      available_devices: {},
      mode_just_changed: false,
      is_recording: false,
      actual_current_video_resolution: false,

      media_to_validate: false,
      media_is_being_sent: false,
      media_being_sent_percent: 0,
      media_send_timeout: 10000,
      media_send_timeout_timer: false,

      current_username: this.$root.settings.capture_options.distant_flux.username,
      callee_username: this.$root.settings.capture_options.distant_flux.callee_username,
      is_calling: false,

      current_stopmotion: false,

      ideal_camera_resolution: {
        name: 'hd',
        width: 1280,
        height: 720
      },
      available_camera_resolutions: [
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
      },
      stopmotion: {
        onion_skin_img: false,
        onion_skin_opacity: 0
      }
    }
  },
  created() {
    console.log('CREATED • CaptureView');

    navigator.mediaDevices.enumerateDevices()
    .then((deviceInfos) => {
      this.available_devices = deviceInfos;

      // SOURCES (device_id)
      Object.keys(this.selected_devicesId).map((kind) => {
        // check if $root ID already exist and match ones we just got
        if(this.sorted_available_devices.hasOwnProperty(kind)) {
          const matching_id = this.sorted_available_devices[kind].filter(m => m.deviceId === this.$root.settings.capture_options.selected_devicesId[kind]);
          if(matching_id.length > 0) {
            this.selected_devicesId[kind] = matching_id[0].deviceId;
            return;
          } else {
            // override : set deviceId to back camera by default
            if(kind === 'videoinput') {
              const camera_back = this.sorted_available_devices[kind].filter(x => x.label.includes('back'));
              if(camera_back.length > 0) {
                this.selected_devicesId[kind] = camera_back[0].deviceId;
                return;
              }
            }

            this.selected_devicesId[kind] = this.sorted_available_devices[kind][0].deviceId;              
          }
        }
      });

      // MODE
      if(this.$root.settings.capture_options.selected_mode !== '') {
        this.selected_mode = this.$root.settings.capture_options.selected_mode;
      } else {
        this.selected_mode = this.available_modes[0].key;
      }

      // RESOLUTION
      if(this.$root.settings.capture_options.ideal_camera_resolution.width !== '') {
        this.ideal_camera_resolution = this.$root.settings.capture_options.ideal_camera_resolution;
      }
    });
  },
  mounted() {
    document.addEventListener('keyup', this.captureKeyListener);
    this.$root.settings.capture_mode_cant_be_changed = false;
  },
  beforeDestroy() {
    document.removeEventListener('keyup', this.captureKeyListener);
    this.stopAllFeeds();
    // this.$refs.videoElement.srcObject = null;
  },

  watch: {
    'selected_devicesId.audioinput': function() {
      console.log(`WATCH • Capture: selected_devicesId.audioinput = ${this.selected_devicesId.audioinput}`);
      // this.stopAllFeeds().then(() => {
      //   if(this.$refs.hasOwnProperty('videoElement') && this.$refs.videoElement !== undefined) {       
      //     this.$refs.videoElement.setSinkId(this.selected_devicesId.audioinput);      
      //     // this.startMode();
      //   }
      // });
      this.$root.settings.capture_options.selected_devicesId.audioinput = this.selected_devicesId.audioinput;
    },
    'selected_devicesId.audiooutput': function() {
      console.log(`WATCH • Capture: selected_devicesId.audiooutput = ${this.selected_devicesId.audiooutput}`);
      this.$root.settings.capture_options.selected_devicesId.audiooutput = this.selected_devicesId.audiooutput;
    },
    'selected_devicesId.videoinput': function() {
      console.log(`WATCH • Capture: selected_devicesId.videoinput = ${this.selected_devicesId.videoinput}`);
      this.$root.settings.capture_options.selected_devicesId.videoinput = this.selected_devicesId.videoinput;
    },
    'selected_mode': function() {
      console.log('WATCH • Capture: selected_mode');
      this.mode_just_changed = true;

      this.$root.settings.capture_options.selected_mode = this.selected_mode;
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
    'ideal_camera_resolution': function() {
      console.log(`WATCH • Capture: ideal_camera_resolution = ${Object.entries(this.ideal_camera_resolution)}`);
      this.$root.settings.capture_options.ideal_camera_resolution = this.ideal_camera_resolution;
    },
    '$root.settings.capture_options.distant_flux.active': function() {
      this.startMode();
    },
    'media_to_validate': function() {
      console.log(`WATCH • Capture: media_to_validate = ${this.media_to_validate}`);
      if(this.media_to_validate) {
        this.$refs.videoElement.pause();
      } else {
        this.$refs.videoElement.play();
      }
    },
    'current_stopmotion': function() {
      this.$root.settings.capture_mode_cant_be_changed = this.current_stopmotion ? this.current_stopmotion : false;
    }
  },
  computed: {
    sorted_available_devices() {
      return this.$_.groupBy(this.available_devices, 'kind');
    },
    uriToUploadMedia: function() {
      return this.slugProjectName + '/file-upload';
    }
  },
  methods: {
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
      if(this.$root.settings.capture_mode_cant_be_changed) {
        return;
      }

      let currentModeIndex = this.available_modes.findIndex((d) => {
        return d.key === this.selected_mode;
      });

      if(currentModeIndex > 0) {
        this.selected_mode = this.available_modes[currentModeIndex-1].key;
      }
    },
    nextMode() {
      console.log('METHODS • CaptureView: nextMode');
      if(this.$root.settings.capture_mode_cant_be_changed) {
        return;
      }

      let currentModeIndex = this.available_modes.findIndex((d) => {
        return d.key === this.selected_mode;
      });

      if(currentModeIndex < this.available_modes.length-1) {
        this.selected_mode = this.available_modes[currentModeIndex+1].key;
      }
    },

    updateSettings() {
      this.startMode();

      if(this.$root.settings.capture_options.distant_flux.active) {
        this.$root.settings.capture_options.distant_flux.username = this.current_username;
        this.$root.settings.capture_options.distant_flux.callee_username = this.callee_username;
        if(this.$root.settings.capture_options.distant_flux.callee_username !== '') {
          this.$eventHub.$emit('call_callee');
        }
      }
    },
    captureKeyListener(evt) {
      console.log('METHODS • CaptureView: captureKeyListener');

      // don’t register if validating a media
      if(this.media_to_validate) {
        return false;
      }

      if (event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'textarea') {
        return false;
      }      

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
    changeStreamTo(new_stream) {
      console.log('METHODS • CaptureView: changeStreamTo');
      this.$refs.videoElement.srcObject = new_stream;
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
        for (let stream of this.videoStream.getVideoTracks()) {
          stream.stop();
        }
        this.videoStream = null;
      }
    },
    stopAllFeeds() {
      return new Promise((resolve, reject) => {
        console.log('METHODS • CaptureView: stopAllFeeds');
        
        this.stopVideoFeed();
        this.stopAudioFeed();
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
              this.$nextTick(() => {
                setTimeout(() => {
                  if(this.$refs.videoElement.videoWidth) {
                    this.actual_current_video_resolution = {
                      width: this.$refs.videoElement.videoWidth,
                      height: this.$refs.videoElement.videoHeight
                    }
                  }
                },200);
              });
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

            /* old syntax, with webrtc-adapter */
            // optional: [{ sourceId: this.selected_devicesId.videoinput }],
            // mandatory: {
            //   // minWidth:"1280","maxWidth":"1280","minHeight":"720","maxHeight":"720"
            //   // minWidth:"640","maxWidth":"640","minHeight":"480","maxHeight":"480"
            //   minWidth: this.ideal_camera_resolution.width,
            //   maxWidth: this.ideal_camera_resolution.width,
            //   minHeight: this.ideal_camera_resolution.height,
            //   maxHeight: this.ideal_camera_resolution.height
            // }

            deviceId: this.selected_devicesId.videoinput ? {exact: this.selected_devicesId.videoinput} : undefined,
            // minHeight: this.ideal_camera_resolution.height
            width: {
              min: 640,
              ideal: this.ideal_camera_resolution.width,
              max: 1920
            },
            height: {
              min: 480,
              ideal: this.ideal_camera_resolution.height,
              max: 1080
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
        var imageData = invisibleCanvas.toBlob((imageBlob) => {
          return resolve(imageBlob);
        }, 'image/jpeg', 0.95);
        // if(imageData === "data:,") {
        //   return reject(this.$t('notifications.video_stream_not_available'));
        // }
      });
    },   

    startRecordCameraFeed(withAudio = false) {
      return new Promise((resolve, reject) => {
        this.startCameraFeed(withAudio).then(() => {
          let recordVideoFeed = RecordRTC(this.videoStream);

          const options = {
            recorderType: RecordRTC.MediaStreamRecorder,
            type: 'video',
            videoBitsPerSecond: 4112000
          };

          setTimeout(() => recordVideoFeed.startRecording(options), 500);

          this.is_recording = true;
          this.$root.settings.capture_mode_cant_be_changed = true;

          this.$eventHub.$on('capture.stopRecording', () => {
            this.$eventHub.$off('capture.stopRecording');
            recordVideoFeed.stopRecording(() => {
              this.is_recording = false;
              const videoBlob = recordVideoFeed.getBlob();
              recordVideoFeed = null;
              return resolve(videoBlob);
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
          this.$root.settings.capture_mode_cant_be_changed = true;

          this.$eventHub.$on('capture.stopRecording', () => {
            this.$eventHub.$off('capture.stopRecording');

            recordAudioFeed.stopRecording(() => {
              this.is_recording = false;
              const audioBlob = recordAudioFeed.getBlob();
              recordAudioFeed = null;
              return resolve(audioBlob);
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
            objectURL: URL.createObjectURL(rawData),
            type: 'image'
          };
        });
      } else 
      if(this.selected_mode === 'video') {    
        this.stopVideoFeed();   
        this.startRecordCameraFeed(this.recordVideoWithAudio).then(rawData => {
          this.media_to_validate = {
            rawData,
            objectURL: URL.createObjectURL(rawData),
            type: 'video'
          };
        });
      } else
      if(this.selected_mode === 'audio') { 
        equalizer.clearCanvas();
        this.startRecordAudioFeed().then(rawData => {
          const preview = this.$refs.equalizerElement.toDataURL('image/png');
          this.media_to_validate = {
            preview,
            rawData,
            objectURL: URL.createObjectURL(rawData),
            type: 'audio'
          };
        });
      } else
      if(this.selected_mode === 'stopmotion') { 
        const smdata = {
          name: this.slugProjectName + '-' + this.$moment().format('YYYYMMDD_HHmmss'),
          authors: this.$root.settings.current_author.hasOwnProperty('name') ? [{ name: this.$root.settings.current_author.name }] : '' 
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
          rawData: new Blob([this.vecto.svgstr], { type: "text/xml"}),
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

        this.ideal_camera_resolution = this.available_camera_resolutions[0];
  
        this.startCameraFeed()
          .then(() => {
            let scanToVecto = () => {
              if(this.selected_mode !== 'vecto' || !this.videoStream) {
                return;
              } else if(this.media_to_validate) {
                window.setTimeout(scanToVecto, 1000);
                return;
              }
              this.getStaticImageFromVideoElement().then(imageData => {
                ImageTracer.imageToSVG(
                  URL.createObjectURL(imageData),
                  (svgstr) => {
                    this.vecto.svgstr = svgstr;
                    window.setTimeout(scanToVecto, 1000);
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
    sendMedia({ fav = false }) {
      return new Promise((resolve, reject) => {
        console.log(`METHODS • ValidateMedia: sendMedia with fav=${fav}`);
        if (this.$root.state.dev_mode === 'debug') {
          console.log(`METHODS • CaptureView / sendMedia`);
        }

        this.$root.settings.capture_mode_cant_be_changed = false;

        const timeCreated = this.$moment().format('YYYYMMDD_HHmmss');
        const randomString = (
          Math.random().toString(36) + '00000000000000000'
        ).slice(2, 3 + 2);

        const extensions = {
          image: 'jpeg',
          video: 'webm',
          audio: 'wav',
          svg: 'svg'
        };
        const filename = `${this.media_to_validate.type}-${timeCreated}-${randomString}.${extensions[this.media_to_validate.type]}`;
        const modified = new Date();

        // this.$set(this.selected_files_meta, filename, {
        //   upload_percentages: 0,
        //   status: 'sending'
        // });

        const rawData = this.media_to_validate.rawData;

        let formData = new FormData();
        formData.append('files', rawData, filename);
        const meta = {
          fileCreationDate: modified,
          fav,
          authors: this.$root.settings.current_author.hasOwnProperty('name') ? [{ name: this.$root.settings.current_author.name }] : '' 
        }
        formData.append(filename, JSON.stringify(meta));
        
        const socketid = this.$socketio.socket.id;
        if(socketid !== undefined) {
          formData.append('socketid', socketid);
        }

        if (this.$root.state.dev_mode === 'debug') {
          console.log(`METHODS • sendThisFile: name = ${filename} / formData is ready`);
        }

        this.media_is_being_sent = true;
        this.media_being_sent_percent = 0;

        // TODO : possibilité de cancel
        axios.post(this.uriToUploadMedia, formData,{
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: function( progressEvent ) {
              console.log(`METHODS • CaptureView: onUploadProgress for name = ${filename} / ${parseInt(Math.round((progressEvent.loaded * 100 ) / progressEvent.total ) )}% `);
              this.media_being_sent_percent = parseInt(Math.round((progressEvent.loaded * 100 ) / progressEvent.total ) );
              // this.selected_files_meta[filename].upload_percentages = parseInt(Math.round((progressEvent.loaded * 100 ) / progressEvent.total ) );
            }.bind(this)            
          })
          .then(x => x.data)
          .then(x => {
            if (this.$root.state.dev_mode === 'debug') {
              console.log(`METHODS • CaptureView: name = ${filename} / success uploading`);
            }

            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .success(this.$t('notifications.media_was_sent'));
            this.media_is_being_sent = false;
            this.media_to_validate = false;

            // this.selected_files_meta[filename].status = 'success';
            // this.selected_files_meta[filename].upload_percentages = 100;     
            resolve();    
          })
          .catch(err => {
            if (this.$root.state.dev_mode === 'debug') {
              console.log(`METHODS • sendThisFile: name = ${filename} / failed uploading`);
            }

            this.media_is_being_sent = false;
            this.media_being_sent_percent = 0;
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t('notifications.media_couldnt_been_sent'));

            // this.selected_files_meta[filename].status = 'failed'; 
            // this.selected_files_meta[filename].upload_percentages = 0;   
            reject();      
          });
      });
    },
    cancelValidation() {
      this.media_to_validate = false;
      this.$root.settings.capture_mode_cant_be_changed = false;
    },
    updateSingleImage($event) {
      this.stopmotion.onion_skin_img = $event;
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
