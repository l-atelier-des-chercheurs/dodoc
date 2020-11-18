<template>
  <div class="m_captureview2">
    <CaptureSettings
      v-show="show_capture_settings"
      :stream.sync="stream"
      :enable_audio_in_video="enable_audio_in_video"
      :actual_camera_resolution.sync="actual_camera_resolution"
      @close="show_capture_settings = false"
    />

    <!-- <div class="m_captureview2--settingsPaneButton">
    </div> -->

    <div class="m_captureview2--videoPane">
      <transition name="slidedown" :duration="500">
        <div
          class="_modeSelector"
          v-if="
            !show_capture_settings &&
            !media_to_validate &&
            !is_recording &&
            !is_making_stopmotion
          "
        >
          <button
            type="button"
            class="bg-transparent"
            @mousedown.stop.prevent="previousMode()"
            @touchstart.stop.prevent="previousMode()"
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="169px"
              height="169px"
              viewBox="0 0 169 169"
              style="enable-background: new 0 0 169 169"
              xml:space="preserve"
            >
              <path
                fill="currentColor"
                stroke="currentColor"
                stroke-width="10"
                stroke-linejoin="round"
                d="M60.2,84.5l48.6-24.3l0,48.6L60.2,84.5z"
              />
            </svg>
          </button>

          <div v-for="mode in available_modes" :key="mode">
            <input
              type="radio"
              :id="id + '_' + mode"
              :value="mode"
              v-model="selected_mode"
            />
            <label :for="id + '_' + mode">
              <div class="_picto">
                <img :src="available_mode_picto[mode]" />
              </div>
              <span v-if="!collapse_capture_pane">{{ $t(mode) }}</span>
            </label>
          </div>
          <button
            type="button"
            class="bg-transparent"
            @mousedown.stop.prevent="nextMode()"
            @touchstart.stop.prevent="nextMode()"
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="169px"
              height="169px"
              viewBox="0 0 169 169"
              style="enable-background: new 0 0 169 169"
              xml:space="preserve"
            >
              <path
                fill="currentColor"
                stroke="currentColor"
                stroke-width="10"
                stroke-linejoin="round"
                d="M108.8,84.5l-48.6,24.3V60.2L108.8,84.5z"
              />
            </svg>
          </button>
        </div>
      </transition>
      <div
        class="m_captureview2--videoPane--top"
        v-show="!is_validating_stopmotion_video"
      >
        <div
          class="m_captureview2--videoPane--top--videoContainer"
          :style="video_styles"
        >
          <transition-group
            tag="div"
            class="_recording_timer"
            name="slideFromTop"
          >
            <label
              v-if="
                selected_mode !== 'stopmotion' &&
                is_recording &&
                recording_duration
              "
              :key="'duration'"
              v-html="recording_duration"
            />

            <label
              v-if="
                selected_mode === 'stopmotion' &&
                is_recording &&
                recording_duration
              "
              :key="'time_before'"
              v-html="time_before_next_picture"
            />

            <div
              v-if="selected_mode === 'stopmotion' && timelapse_mode"
              :key="'timelapse_interval'"
              class="_recording_timer--timelapse"
            >
              <div>
                <span>{{ $t("interval_between_pictures") }}</span>
                <input type="number" v-model.number="timelapse_interval" />
                <span>{{ $t("seconds") }}</span>
              </div>
            </div>
            <!-- <label 
                v-if="selected_mode === 'stopmotion' && timelapse_mode"
                :key="'disable_interval'"  
              >
                <button 
                  type="button" 
                  class="button-nostyle text-uc padding-none margin-none c-blanc bg-rouge button-inline"
                  @click="timelapse_mode = false"
                >
                  <svg class="inline-svg margin-right-verysmall" viewBox="0 0 20 20">
                    <path stroke="" fill="white" d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"></path>
                  </svg>                    
                  {{ $t('disable') }}
                </button>                
              </label>-->
          </transition-group>

          <video
            ref="videoElement"
            autoplay
            playsinline
            :srcObject.prop="stream"
            muted
            v-show="
              ['photo', 'video', 'stopmotion'].includes(selected_mode) &&
              show_live_feed &&
              !(must_validate_media && media_to_validate)
            "
          />

          <transition name="scaleInFade" mode="in-out" duration="100">
            <MediaContent
              v-if="
                selected_mode === 'stopmotion' &&
                stopmotion.onion_skin_img &&
                current_stopmotion &&
                !is_validating_stopmotion_video
              "
              :key="
                show_live_feed ? false : stopmotion.onion_skin_img.metaFileName
              "
              class="_onion_skin"
              :class="{ 'is--onionskin': show_live_feed }"
              :context="'edit'"
              :slugFolderName="current_stopmotion"
              :media="stopmotion.onion_skin_img"
              :folderType="'stopmotions'"
              :style="
                show_live_feed
                  ? `--onionskin-opacity: ${stopmotion.onion_skin_opacity}`
                  : ''
              "
            />
          </transition>
          <transition name="fade_fast">
            <div
              class="_settingsTag"
              v-if="!(must_validate_media && media_to_validate)"
              @click="show_capture_settings = !show_capture_settings"
            >
              <div>
                {{ actual_camera_resolution.width }}×{{
                  actual_camera_resolution.height
                }}
              </div>
              <!-- <div v-if="selected_devices.video_input_device">
                {{ selected_devices.video_input_device.label }}
              </div>
              <div v-if="selected_devices.audio_input_device">
                {{ selected_devices.audio_input_device.label }}
              </div> -->
            </div>
          </transition>

          <transition name="enableMode" :duration="400">
            <div
              v-if="mode_just_changed"
              class="_mode_indicator"
              v-html="$t(selected_mode)"
            />
          </transition>

          <transition name="fade_fast" :duration="150">
            <MediaPreviewBeforeValidation
              v-if="media_to_validate"
              :media_to_validate="media_to_validate"
            />
          </transition>
        </div>
      </div>
      <transition name="slideup" :duration="150" mode="out-in">
        <StopmotionPanel
          v-if="$root.store.stopmotions.hasOwnProperty(current_stopmotion)"
          :stopmotiondata="$root.store.stopmotions[current_stopmotion]"
          :type="type"
          :slugFolderName="slugFolderName"
          :read_only="read_only"
          :stream="stream"
          :can_add_to_fav="can_add_to_fav"
          :show_live_feed.sync="show_live_feed"
          :is_validating_stopmotion_video.sync="is_validating_stopmotion_video"
          @saveMedia="(metaFileName) => $emit('insertMedias', [metaFileName])"
          @close="
            current_stopmotion = false;
            is_recording = false;
          "
          @new_single_image="updateSingleImage"
        />
      </transition>

      <transition name="slideup" :duration="150" mode="out-in">
        <div
          class="m_captureview2--videoPane--bottom"
          v-if="!show_capture_settings"
        >
          <transition name="slideup" :duration="150" mode="out-in">
            <div
              class="m_captureview2--videoPane--bottom--buttons"
              :class="{ 'is--recording': is_recording }"
              v-if="!(media_to_validate && must_validate_media)"
            >
              <div>
                <button
                  v-if="!is_recording"
                  type="button"
                  class="bg-rouge"
                  @click="show_capture_settings = !show_capture_settings"
                >
                  <svg
                    class="inline-svg inline-svg_larger"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 140 140"
                    xml:space="preserve"
                  >
                    <path
                      style="fill: currentColor"
                      d="M122.7,88.8v-10c0-1.1,0.6-2.1,1.6-2.6l9.6-4.9l-2-5.8l-11,1.6c-1.1,0.2-2.2-0.3-2.9-1.2l-6-8.1
                  c-0.7-0.9-0.8-2.1-0.3-3l4.8-9.6l-5.2-3.6l-7.7,7.5c-0.8,0.8-2,1-3.1,0.7l-9.9-3c-1.1-0.3-1.9-1.3-2.1-2.4L86.8,34h-6.4l-1.7,10.4
                  c-0.2,1.1-0.9,2-2,2.4L66.8,50c-1.1,0.3-2.2,0.1-3.1-0.7L55.9,42l-5.1,3.7l4.9,9.4c0.5,1,0.4,2.1-0.2,3l-6,8.2
                  c-0.6,0.9-1.8,1.4-2.9,1.2L35.8,66L34,71.8l9.7,4.8c1,0.5,1.7,1.5,1.7,2.6v10c0,1.1-0.6,2.1-1.6,2.6l-9.6,4.9l2,5.9l10.9-1.6
                  c1.1-0.2,2.2,0.3,2.9,1.2l6,8.1c0.7,0.9,0.8,2.1,0.3,3l-4.8,9.6l5.1,3.6l7.7-7.5c0.8-0.8,2-1,3.1-0.7l9.9,3
                  c1.1,0.3,1.9,1.3,2.1,2.4l1.9,10.4h6.4l1.7-10.4c0.2-1.1,0.9-2,2-2.4l9.9-3.2c1.1-0.3,2.2-0.1,3.1,0.7l7.8,7.3l5.1-3.7l-4.9-9.4
                  c-0.5-1-0.4-2.1,0.2-3l6-8.1c0.7-0.9,1.8-1.4,2.9-1.2l10.8,1.5l1.8-5.9l-9.7-4.8C123.3,90.9,122.7,89.9,122.7,88.8z M84,104.5
                  c-11.7,0-21.1-9.2-21.1-20.5c0-11.3,9.5-20.5,21.1-20.5s21.1,9.2,21.1,20.5C105.1,95.3,95.7,104.5,84,104.5z"
                    />
                  </svg>
                  <span v-if="!collapse_capture_pane" class>{{
                    $t("settings")
                  }}</span>
                </button>
              </div>
              <div>
                <transition name="fade_fast" mode="out-in">
                  <button
                    type="button"
                    class="bg-orange button-inline _captureButton"
                    :class="{ 'is--justCaptured': capture_button_pressed }"
                    :disabled="is_saving"
                    :key="selected_mode + is_recording"
                    @mousedown.stop.prevent="captureOrStop()"
                    @touchstart.stop.prevent="captureOrStop()"
                  >
                    <img
                      v-if="!is_recording"
                      class="inline-svg inline-svg_larger"
                      src="/images/i_record.svg"
                    />
                    <img
                      v-else
                      class="inline-svg inline-svg_larger"
                      src="/images/i_stop.svg"
                    />

                    &nbsp;

                    <span v-if="selected_mode === 'photo'">
                      {{ $t("take_picture") }}</span
                    >
                    <span v-else-if="selected_mode === 'video'">
                      <template v-if="!is_recording">
                        {{ $t("record_video") }}
                      </template>
                      <template v-else>
                        {{ $t("stop_recording") }}
                      </template>
                    </span>
                    <span v-else-if="selected_mode === 'stopmotion'">
                      {{ $t("take_picture") }}
                    </span>
                  </button>
                </transition>
              </div>
              <div>
                <span class="switch switch-xs" v-if="selected_mode === 'video'">
                  <input
                    class="switch"
                    id="recordVideoWithAudio"
                    type="checkbox"
                    v-model="enable_audio_in_video"
                    :disabled="is_recording"
                  />
                  <label for="recordVideoWithAudio">{{
                    $t("with_sound")
                  }}</label>
                </span>

                <div
                  v-if="
                    selected_mode === 'stopmotion' &&
                    stopmotion.onion_skin_img &&
                    show_live_feed
                  "
                >
                  <label>{{ $t("onion_skin") }}</label>
                  <input
                    class="margin-none"
                    type="range"
                    v-model="stopmotion.onion_skin_opacity"
                    min="0"
                    max=".9"
                    step="0.01"
                  />
                </div>

                <button
                  type="button"
                  v-if="selected_mode === 'stopmotion' && !is_making_stopmotion"
                  @click="show_stopmotion_list = !show_stopmotion_list"
                  class="button c-bleumarine font-small bg-transparent"
                >
                  <span class>{{ $t("stopmotion_list") }}</span>
                </button>
              </div>
            </div>
            <MediaValidationButtons
              v-else
              :read_only="read_only"
              :can_add_to_fav="can_add_to_fav"
              :media_is_being_sent="media_is_being_sent"
              :media_being_sent_percent="media_being_sent_percent"
              @cancel="cancelValidation()"
              @save="sendMedia({})"
              @save_and_fav="sendMedia({ fav: true })"
            />
          </transition>
        </div>
      </transition>
    </div>
  </div>
</template>
<script>
import MediaPreviewBeforeValidation from "./components/subcomponents/MediaPreviewBeforeValidation.vue";
import MediaValidationButtons from "./components/subcomponents/MediaValidationButtons.vue";
import StopmotionPanel from "./components/subcomponents/StopmotionPanel.vue";
import MediaContent from "./components/subcomponents/MediaContent.vue";

import CaptureSettings from "./components/capture/CaptureSettings.vue";

import adapter from "webrtc-adapter";

import * as axios from "axios";
import RecordRTC from "recordrtc";
import { setTimeout } from "timers";

export default {
  props: {
    slugFolderName: String,
    type: String,
    read_only: Boolean,
    available_modes: {
      type: Array,
      default: () => ["photo", "video", "stopmotion", "audio", "vecto"],
    },
    can_add_to_fav: {
      type: Boolean,
      default: true,
    },
    must_validate_media: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    MediaPreviewBeforeValidation,
    MediaValidationButtons,
    StopmotionPanel,
    MediaContent,
    CaptureSettings,
  },
  data() {
    return {
      selected_mode: "",
      is_saving: false,

      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),

      available_mode_picto: {
        photo: "/images/i_icone-dodoc_image.svg",
        video: "/images/i_icone-dodoc_video.svg",
        stopmotion: "/images/i_icone-dodoc_anim.svg",
        audio: "/images/i_icone-dodoc_audio.svg",
        vecto: "/images/i_icone-dodoc_vecto.svg",
      },

      media_to_validate: false,
      media_is_being_sent: false,
      media_being_sent_percent: 0,
      capture_button_pressed: false,
      mode_just_changed: false,
      is_validating_stopmotion_video: false,

      current_stopmotion: false,

      collapse_capture_pane: false,

      // selected_devices: {
      //   video_input_device: undefined,
      //   audio_input_device: undefined,
      //   audio_output_device: undefined,
      // },

      stream: undefined,
      show_capture_settings: true,
      enable_audio_in_video: true,

      is_recording: false,
      timer_recording: false,

      timelapse_mode: false,
      timelapse_interval: 2,
      timelapse_event: false,

      actual_camera_resolution: {
        width: undefined,
        height: undefined,
      },

      show_live_feed: true,
      show_stopmotion_list: false,
      stopmotion: {
        onion_skin_img: false,
        onion_skin_opacity: 0,
      },
    };
  },
  created() {},
  mounted() {
    if (
      this.$root.settings.capture_options.selected_mode !== "" &&
      this.available_modes.includes(
        this.$root.settings.capture_options.selected_mode
      )
    ) {
      this.selected_mode = this.$root.settings.capture_options.selected_mode;
    } else {
      this.selected_mode = this.available_modes[0];
    }

    this.checkCapturePanelSize();
    this.$eventHub.$on(`activity_panels_resized`, this.checkCapturePanelSize);
  },
  beforeDestroy() {},
  watch: {
    selected_mode: function () {
      this.mode_just_changed = true;
      setTimeout(() => {
        this.mode_just_changed = false;
      }, 300);
    },
    is_validating_stopmotion_video: function () {
      if (this.is_validating_stopmotion_video) {
        this.$refs.videoElement.pause();
      } else {
        this.$refs.videoElement.play();
        this.show_live_feed = true;
      }
    },
    media_to_validate: function () {
      console.log(
        `WATCH • Capture: media_to_validate = ${this.media_to_validate}`
      );
      if (this.media_to_validate) {
        this.$refs.videoElement.pause();
      } else {
        this.$refs.videoElement.play();
      }

      if (this.must_validate_media === false) {
      }
    },
    is_recording: function () {
      // equalizer.setSarahCouleur(this.is_recording);
      if (this.is_recording) {
        this.timer_recording = this.$root.currentTime;
      } else {
        this.timer_recording = false;
      }
    },
  },
  computed: {
    is_making_stopmotion() {
      const is_making_stopmotion = this.current_stopmotion ? true : false;
      if (is_making_stopmotion) {
        this.show_capture_settings = false;
      }
      return is_making_stopmotion;
    },
    video_styles() {
      if (
        !this.actual_camera_resolution.width ||
        !this.actual_camera_resolution.height
      )
        return "";
      return {
        // maxWidth: this.actual_camera_resolution.width + "px",
        // maxHeight: this.actual_camera_resolution.height + "px",
      };
    },
    uri_to_upload_media: function () {
      return (
        window.location.origin +
        `/_file-upload/${this.type}/${this.slugFolderName}/?socketid=${this.$root.$socketio.socket.id}`
      );
    },
    recording_duration: function () {
      if (this.timer_recording) {
        return this.$moment(this.$root.currentTime - this.timer_recording)
          .startOf("second")
          .format("mm:ss");
      }
      return false;
    },
    time_before_next_picture: function () {
      const seconds_ellapsed_since_beginning = this.$moment(
        this.$root.currentTime - this.timer_recording
      ).seconds();
      const time_ellapsed_since_last_capture =
        seconds_ellapsed_since_beginning % this.timelapse_interval;
      if (time_ellapsed_since_last_capture === 0) {
        return 0;
      }
      return this.timelapse_interval - time_ellapsed_since_last_capture;
    },
  },
  methods: {
    previousMode() {
      console.log("METHODS • CaptureView: previousMode");
      if (
        this.is_recording ||
        this.media_to_validate ||
        this.mode_just_changed ||
        this.is_making_stopmotion
      )
        return;

      let currentModeIndex = this.available_modes.indexOf(this.selected_mode);

      if (currentModeIndex > 0) {
        this.selected_mode = this.available_modes[currentModeIndex - 1];
      }
    },
    nextMode() {
      console.log("METHODS • CaptureView: nextMode");
      if (
        this.is_recording ||
        this.media_to_validate ||
        this.mode_just_changed ||
        this.is_making_stopmotion
      )
        return;

      let currentModeIndex = this.available_modes.indexOf(this.selected_mode);

      if (currentModeIndex < this.available_modes.length - 1) {
        this.selected_mode = this.available_modes[currentModeIndex + 1];
      }
    },
    checkCapturePanelSize() {
      if (this.$el && this.$el.offsetWidth && this.$el.offsetWidth <= 600)
        this.collapse_capture_pane = true;
      else this.collapse_capture_pane = false;
    },
    addStopmotionImage() {
      const smdata = {
        name:
          this.slugFolderName + "-" + this.$moment().format("YYYYMMDD_HHmmss"),
        linked_project: this.slugFolderName,
        linked_type: this.type,
        authors: this.$root.current_author
          ? [{ slugFolderName: this.$root.current_author.slugFolderName }]
          : "",
      };

      this.getStaticImageFromVideoElement().then((imageData) => {
        if (!this.current_stopmotion) {
          // create stopmotion
          this.$root
            .createFolder({
              type: "stopmotions",
              data: smdata,
            })
            .then((fdata) => {
              this.current_stopmotion = fdata.slugFolderName;
              this.addImageToStopmotion(imageData);
            });
        } else {
          // append to stopmotion
          this.addImageToStopmotion(imageData);
        }
      });
    },
    addImageToStopmotion(imageData) {
      console.log("METHODS • CaptureView: addImageToStopmotion");
      this.is_saving = true;

      // const media_editing_timeout = setTimeout(() => {
      //   if (this.is_saving) {
      //     this.is_saving = false;
      //     this.$alertify
      //       .closeLogOnClick(true)
      //       .delay(4000)
      //       .error(this.$t("notifications.failed_to_save_media"));
      //   }
      // }, 5000);

      this.$root
        .createMedia({
          slugFolderName: this.current_stopmotion,
          type: "stopmotions",
          rawData: imageData,
          additionalMeta: {
            type: "image",
          },
        })
        .then((mdata) => {
          this.is_saving = false;
          clearTimeout(media_editing_timeout);
        });
    },

    captureKeyListener(event) {
      console.log("METHODS • CaptureView: captureKeyListener");

      // don’t register if validating a media
      if (this.media_to_validate || this.is_validating_stopmotion_video) {
        return false;
      }

      // disabled because it clashes with the input type range from stopmotion panel
      // if (event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'textarea') {
      //   return false;
      // }

      switch (event.key) {
        case "w":
        case "z":
        case "ArrowLeft":
          this.previousMode();
          break;
        case "s":
        case "ArrowRight":
          this.nextMode();
          break;
        case "a":
        case "q":
        case " ":
          this.captureOrStop();
          break;
      }
    },
    captureOrStop() {
      this.capture_button_pressed = true;
      window.setTimeout(() => {
        this.capture_button_pressed = false;
      }, 400);

      if (this.selected_mode === "stopmotion" && this.timelapse_mode) {
        if (!this.is_recording) {
          this.is_recording = true;
          this.timelapse_event = window.setInterval(() => {
            this.capture_button_pressed = true;
            window.setTimeout(() => {
              this.capture_button_pressed = false;
            }, 400);
            this.addStopmotionImage();
          }, this.timelapse_interval * 1000);
        } else {
          this.is_recording = false;
          clearInterval(this.timelapse_event);
          return;
        }
      }
      if (this.is_recording && this.selected_mode !== "stopmotion") {
        this.$eventHub.$emit("capture.stopRecording");
        return;
      }

      if (this.selected_mode === "photo") {
        this.getStaticImageFromVideoElement().then((rawData) => {
          this.media_to_validate = {
            rawData,
            objectURL: URL.createObjectURL(rawData),
            type: "image",
          };
        });
      } else if (this.selected_mode === "video") {
        this.startRecordCameraFeed().then((rawData) => {
          this.media_to_validate = {
            rawData,
            objectURL: URL.createObjectURL(rawData),
            type: "video",
          };
        });
      } else if (this.selected_mode === "audio") {
        equalizer.clearCanvas();
        this.startRecordAudioFeed().then((rawData) => {
          const preview = this.$refs.equalizerElement.toDataURL("image/png");
          this.media_to_validate = {
            preview,
            rawData,
            objectURL: URL.createObjectURL(rawData),
            type: "audio",
          };
        });
      } else if (this.selected_mode === "stopmotion") {
        this.addStopmotionImage();
      } else if (this.selected_mode === "vecto") {
        this.media_to_validate = {
          preview: this.vecto.svgstr,
          rawData: new Blob([this.vecto.svgstr], { type: "text/xml" }),
          type: "svg",
        };
      }
    },
    getStaticImageFromVideoElement() {
      return new Promise((resolve, reject) => {
        let invisible_canvas = document.createElement("canvas");
        invisible_canvas.width = this.$refs.videoElement.videoWidth;
        invisible_canvas.height = this.$refs.videoElement.videoHeight;
        let invisible_ctx = invisible_canvas.getContext("2d");
        invisible_ctx.drawImage(
          this.$refs.videoElement,
          0,
          0,
          invisible_canvas.width,
          invisible_canvas.height
        );
        var imageData = invisible_canvas.toBlob(
          (imageBlob) => {
            invisible_canvas.remove();
            return resolve(imageBlob);
          },
          "image/jpeg",
          0.95
        );
        // if(imageData === "data:,") {
        //   return reject(this.$t('notifications.video_stream_not_available'));
        // }
      });
    },

    startRecordCameraFeed() {
      return new Promise((resolve, reject) => {
        let recorder = RecordRTC(this.stream, {
          type: "video",
        });
        recorder.startRecording({
          type: "video",
          videoBitsPerSecond: 4112000,
        });
        // recorder.camera = this.stream;

        this.is_recording = true;

        this.$eventHub.$once("capture.stopRecording", () => {
          recorder.stopRecording(() => {
            this.is_recording = false;
            let video_blob = recorder.getBlob();

            // recorder.camera.stop();
            recorder.destroy();
            recorder = null;

            return resolve(video_blob);
          });
        });
      });
    },

    sendMedia({ fav = false }) {
      return new Promise((resolve, reject) => {
        console.log(`METHODS • CaptureView: sendMedia with fav=${fav}`);
        if (this.$root.state.dev_mode === "debug") {
          console.log(`METHODS • CaptureView / sendMedia`);
        }

        const timeCreated = this.$moment().format("YYYYMMDD_HHmmss");
        const randomString = (
          Math.random().toString(36) + "00000000000000000"
        ).slice(2, 3 + 2);

        const extensions = {
          image: "jpeg",
          video: "webm",
          audio: "wav",
          svg: "svg",
        };
        const filename = `${
          this.media_to_validate.type
        }-${timeCreated}-${randomString}.${
          extensions[this.media_to_validate.type]
        }`;
        const modified = new Date();

        // this.$set(this.selected_files_meta, filename, {
        //   upload_percentages: 0,
        //   status: 'sending'
        // });

        const rawData = this.media_to_validate.rawData;

        let formData = new FormData();
        formData.append("files", rawData, filename);
        const meta = {
          fileCreationDate: modified,
          fav,
          authors: this.$root.current_author
            ? [{ slugFolderName: this.$root.current_author.slugFolderName }]
            : "",
        };
        formData.append(filename, JSON.stringify(meta));

        const socketid = this.$socketio.socket.id;
        if (socketid !== undefined) {
          formData.append("socketid", socketid);
        }

        if (this.$root.state.dev_mode === "debug") {
          console.log(
            `METHODS • sendThisFile: name = ${filename} / formData is ready`
          );
        }

        this.media_is_being_sent = true;
        this.media_being_sent_percent = 0;

        // TODO : possibilité de cancel
        axios
          .post(this.uri_to_upload_media, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: function (progressEvent) {
              console.log(
                `METHODS • CaptureView: onUploadProgress for name = ${filename} / ${parseInt(
                  Math.round((progressEvent.loaded * 100) / progressEvent.total)
                )}% `
              );
              this.media_being_sent_percent = parseInt(
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              );
              // this.selected_files_meta[filename].upload_percentages = parseInt(Math.round((progressEvent.loaded * 100 ) / progressEvent.total ) );
            }.bind(this),
          })
          .then((x) => x.data)
          .then((x) => {
            if (this.$root.state.dev_mode === "debug") {
              console.log(
                `METHODS • CaptureView: name = ${filename} / success uploading`
              );
            }

            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .success(this.$t("notifications.media_was_sent"));
            this.media_is_being_sent = false;
            this.media_to_validate = false;

            this.$emit("insertMedias", [x.metaFileNames[0]]);

            // this.selected_files_meta[filename].status = 'success';
            // this.selected_files_meta[filename].upload_percentages = 100;
            resolve();
          })
          .catch((err) => {
            if (this.$root.state.dev_mode === "debug") {
              console.log(
                `METHODS • sendThisFile: name = ${filename} / failed uploading`
              );
            }

            this.media_is_being_sent = false;
            this.media_being_sent_percent = 0;
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("notifications.media_couldnt_be_sent"));

            // this.selected_files_meta[filename].status = 'failed';
            // this.selected_files_meta[filename].upload_percentages = 0;
            reject();
          });
      });
    },
    cancelValidation() {
      this.media_to_validate = false;
    },
    updateSingleImage($event) {
      this.stopmotion.onion_skin_img = $event;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_captureview2 {
  display: flex;
  flex-flow: row nowrap;

  .m_captureview2--settingsPaneButton {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 0;
    background-color: var(--c-rouge);

    > button {
      transform: rotate(-90deg);
      transform-origin: center top;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      margin-left: -1px;
    }
  }

  .m_captureview2--videoPane {
    overflow-y: auto;
    flex: 1 1 auto;

    display: flex;
    flex-flow: column nowrap;
  }

  .m_captureview2--videoPane--top {
    position: relative;
    margin: 0 auto;

    flex: 1 1 auto;
    overflow: hidden;

    width: 100%;
    height: 100%;
    background-color: var(--c-noir);

    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
  }

  .m_captureview2--videoPane--bottom {
    position: relative;
    flex: 0 0 auto;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);

    .m_captureview2--videoPane--bottom--buttons {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      align-items: center;

      > * {
        flex: 1 1 100px;
        padding: calc(var(--spacing) / 2);

        &:nth-child(2) {
          text-align: center;
        }
        &:last-child {
          text-align: right;
        }
      }

      &.is--recording {
        background-color: var(--c-orange);
      }
    }
  }

  ._settingsTag {
    position: absolute;
    bottom: 0;
    right: 0;
    color: var(--c-noir);
    font-size: var(--font-verysmall);
    margin: 15px;
    pointer-events: none;

    > * {
      display: inline-block;
      background-color: white;
      border-radius: 4px;
      line-height: 1;
      margin: 2px;
      padding: 2px 4px;
      pointer-events: auto;
      cursor: pointer;
    }
  }

  .m_captureview2--videoPane--top--videoContainer {
    position: relative;
    width: 100%;
    height: 100%;

    video,
    .mediaContainer img {
      position: absolute;
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

._captureButton {
  margin: 0 auto;
}

._modeSelector {
  position: absolute;
  z-index: 1;
  display: flex;
  left: 0;
  right: 0;
  // width: 100%;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  padding: calc(var(--spacing) / 2) 0 0;
  user-select: none;

  font-family: "Fira Code";
  color: var(--c-orange);

  input[disabled] + label {
    filter: grayscale(100%);
    // opacity: 0.3;
    cursor: not-allowed;
  }

  > * {
    flex: 0 0 auto;
    display: flex;
    flex-flow: row wrap;
    font-family: inherit;
    // background-color: white;
  }
  > button {
    padding-left: 0;
    padding-right: 0;
  }

  input {
    width: 0px;
    height: 0;
    visibility: hidden;

    &:not(:checked) + label:not(:hover) {
      opacity: 0.3;
    }
  }

  input:checked + label {
    background-color: var(--c-orange);
    span {
      color: white;
    }
  }

  input[disabled] + label {
    filter: grayscale(100%);
    opacity: 0.3;
    cursor: not-allowed;
  }

  label {
    font-size: inherit;
    font-family: inherit;
    display: inline-block;
    text-decoration: none;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 0.06em;
    flex-shrink: 0;
    margin: 0;
    cursor: pointer;
    // min-height: 2.43rem;
    border-radius: 6px;
    transition: color 0.25s ease-out, opacity 0.5s;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    letter-spacing: 0;
    // padding: 0 0.405rem;
    margin: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    text-align: center;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }

  ._picto {
    border-radius: 50%;
    overflow: hidden;
    display: block;
    width: 36px;
    height: 36px;

    margin: calc(var(--spacing) / 8);

    padding: 4px;
    color: #fff;

    margin-right: 0;
  }

  span {
    display: block;
    font-weight: 400;
    text-transform: lowercase;
    margin: 0.405rem;
    font-size: 0.8rem;
    font-family: Fira Mono;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: #666;
    font-weight: 600;
  }
}

._mode_indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--c-orange);
  font-weight: 700;
  font-family: "Fira Code";
  font-size: var(--font-large);
  text-transform: uppercase;

  letter-spacing: 0.06em;

  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

._recording_timer {
  position: absolute;
  bottom: 0;
  width: 100%;
  z-index: 100;
  text-align: center;
  pointer-events: none;
  padding: calc(var(--spacing) / 8);

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;

  label {
    display: inline-block;
    margin: 0 auto;
    background-color: var(--c-rouge);
    padding: 0 calc(var(--spacing) / 8);

    margin-bottom: calc(var(--spacing) / 8);
    color: white;
    border-radius: 4px;
    pointer-events: auto;
  }

  .recording_timer--timelapse {
    max-width: 450px;
    margin: calc(var(--spacing) / 2) auto;
    // .padding-verysmall;
    pointer-events: auto;
    // .font-small;

    > * {
      background-color: var(--c-rouge);

      color: white;
      padding: 0 calc(var(--spacing) / 8);
      border-radius: 4px;
      width: auto;
    }

    input {
      display: inline-block;
      min-width: 2em;
      max-width: 3em;
      height: 1.2em;
      margin: 2px;
      padding: 0 2px;
      width: auto;
      width: auto;
      text-align: center;
      color: white;

      background-color: var(--c-rouge_clair);

      border-bottom: 0px;

      &:active,
      &:focus {
        border-bottom-color: var(--c-rouge_fonce);
      }
    }
  }
}

._onion_skin {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  &.is--onionskin {
    opacity: 0.2;
    opacity: var(--onionskin-opacity);
  }
}
</style>
<style lang="scss">
._onion_skin img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
