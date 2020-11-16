<template>
  <div class="m_captureview2">
    <div class="m_captureview2--settingsPane" v-if="show_capture_settings">
      <transition name="fade_fast" :duration="400">
        <Loader
          v-if="is_loading_available_devices || is_scanning_resolutions"
        />
      </transition>

      <div class="m_captureview2--settingsPane--topbar">
        <div>
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
          <span class>{{ $t("settings") }}</span>
        </div>
        <button
          type="button"
          class="bg-rouge buttonLink"
          @click="show_capture_settings = !show_capture_settings"
        >
          <span class>{{ $t("close") }}</span>
        </button>
      </div>

      <div class="m_captureview2--settingsPane--settings">
        <label>Devices available</label>
        <button
          type="button"
          class="buttonLink"
          @click="refreshAvailableDevices"
        >
          Refresh devices
        </button>

        <div>
          <div class="">
            <label>Camera</label>
            <small v-if="!all_video_input_devices.length === 0">
              No video input devices available
            </small>
            <select
              v-else
              id="devices"
              name="Video devices"
              title="devices"
              v-model="selected_devices_id.video_input_device"
            >
              <option
                v-for="d in all_video_input_devices"
                :key="d.deviceId"
                :value="d"
              >
                {{ $t(d.label) }}
              </option>
            </select>
          </div>
          <div>
            <label>Audio input</label>
            <small v-if="!all_audio_input_devices.length === 0">
              No audio input devices available
            </small>
            <select
              v-else
              id="devices"
              name="Video devices"
              title="devices"
              v-model="selected_devices_id.audio_input_device"
            >
              <option
                v-for="d in all_audio_input_devices"
                :key="d.deviceId"
                :value="d"
              >
                {{ d.label }}
              </option>
            </select>
          </div>
          <div>
            <label>select audio output</label>
            <small v-if="!all_audio_output_devices.length === 0">
              No audio output devices available
            </small>
            <select
              v-else
              id="devices"
              name="Video devices"
              title="devices"
              v-model="selected_devices_id.audio_output_device"
            >
              <option
                v-for="d in all_audio_output_devices"
                :key="d.deviceId"
                :value="d"
              >
                {{ d.label }}
              </option>
            </select>
          </div>

          <div class="margin-vert-small">
            <label>Resolutions</label>
            <template
              v-if="
                !selected_devices_id.video_input_device ||
                !selected_devices_id.video_input_device.deviceId
              "
            >
              select camera first
            </template>
            <template v-else>
              <button
                type="button"
                class="buttonLink"
                @click="getAllAvailableResolutions"
                :disabled="is_scanning_resolutions"
              >
                get all input resolutions for
                {{ selected_devices_id.video_input_device.label }}
              </button>
            </template>
          </div>
          <div>
            <div
              v-for="res in available_camera_resolutions.concat(
                custom_camera_resolution
              )"
              :key="res.name"
            >
              <input
                type="radio"
                :id="res.label"
                :value="res"
                v-model="desired_camera_resolution"
              />
              <label :for="res.label">
                <span
                  >{{ res.label }}
                  <template v-if="res.type !== 'custom'">
                    •
                    <template v-if="res.ratio">{{ res.ratio }}</template>
                    • {{ res.width }}/{{ res.height }})
                  </template>
                </span>
              </label>
            </div>

            <div
              v-if="
                desired_camera_resolution &&
                desired_camera_resolution.type === 'custom'
              "
              class="margin-bottom-small input-group"
            >
              <input
                type="number"
                min="2"
                max="4096"
                step="2"
                v-model.number="desired_camera_resolution.width"
              />
              <span class="font-large padding-verysmall">×</span>
              <input
                type="number"
                min="2"
                max="2160"
                step="2"
                v-model.number="desired_camera_resolution.height"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            class="buttonLink"
            @click="show_debug = !show_debug"
          >
            debug: show all devices available
          </button>
          <div v-if="show_debug">
            <pre>{{ connected_devices }}</pre>
          </div>
        </div>
      </div>
      <div class="m_captureview2--settingsPane--updateButton">
        <small v-if="!desired_camera_resolution">
          Select a camera resolution first
        </small>
        <button
          type="button"
          class="bg-rouge button-wide"
          @click="setCameraStreamFromDefaults"
          :disabled="
            !desired_camera_resolution ||
            !selected_devices_id.video_input_device ||
            current_settings === stream_current_settings
          "
        >
          {{ $t("update") }}
        </button>
        <!-- <small>
          <span
            v-if="desired_camera_resolution && desired_camera_resolution.label"
          >
            {{ desired_camera_resolution.label }}</span
          >
          <span
            v-if="
              selected_devices_id &&
              selected_devices_id.video_input_device &&
              selected_devices_id.video_input_device.label
            "
          >
            {{ selected_devices_id.video_input_device.label }}
          </span>
        </small> -->
      </div>
    </div>

    <!-- <div class="m_captureview2--settingsPaneButton">
    </div> -->

    <div class="m_captureview2--videoPane">
      <div class="m_captureview2--videoPane--top">
        <div
          class="m_captureview2--videoPane--top--videoContainer"
          :style="video_styles"
        >
          <video ref="videoElement" autoplay playsinline />
          <div class="m_captureview2--videoPane--top--resolutionTag">
            {{ actual_camera_resolution.width }}×{{
              actual_camera_resolution.height
            }}
          </div>
        </div>
      </div>
      <div class="m_captureview2--videoPane--bottom">
        <button
          type="button"
          class="bg-rouge"
          v-if="!show_capture_settings"
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
          <span class>{{ $t("settings") }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import adapter from "webrtc-adapter";

export default {
  props: {},
  components: {},
  data() {
    return {
      connected_devices: [],
      ideal_resolution: undefined,

      selected_devices_id: {
        video_input_device: undefined,
        audio_input_device: undefined,
        audio_output_device: undefined,
      },

      stream: undefined,
      show_debug: false,
      show_capture_settings: false,

      quickScan_resolutions: [
        {
          label: "4K(UHD)",
          width: 3840,
          height: 2160,
          ratio: "16:9",
        },
        {
          label: "1080p(FHD)",
          width: 1920,
          height: 1080,
          ratio: "16:9",
        },
        // {
        //   label: "UXGA",
        //   width: 1600,
        //   height: 1200,
        //   ratio: "4:3",
        // },
        {
          label: "720p(HD)",
          width: 1280,
          height: 720,
          ratio: "16:9",
        },
        // {
        //   label: "SVGA",
        //   width: 800,
        //   height: 600,
        //   ratio: "4:3",
        // },
        {
          label: "VGA",
          width: 640,
          height: 480,
          ratio: "4:3",
        },
        // {
        //   label: "360p(nHD)",
        //   width: 640,
        //   height: 360,
        //   ratio: "16:9",
        // },
        // {
        //   label: "CIF",
        //   width: 352,
        //   height: 288,
        //   ratio: "4:3",
        // },
        {
          label: "QVGA",
          width: 320,
          height: 240,
          ratio: "4:3",
        },
        // {
        //   label: "QCIF",
        //   width: 176,
        //   height: 144,
        //   ratio: "4:3",
        // },
        // {
        //   label: "QQVGA",
        //   width: 160,
        //   height: 120,
        //   ratio: "4:3",
        // },
      ],

      available_camera_resolutions: [],
      custom_camera_resolution: {
        label: this.$t("custom"),
        type: "custom",
        width: 1280,
        height: 720,
      },

      is_loading_available_devices: false,
      is_scanning_resolutions: false,

      desired_camera_resolution: undefined,
      actual_camera_resolution: {
        width: undefined,
        height: undefined,
      },

      stream_current_settings: undefined,
    };
  },
  created() {},
  mounted() {
    this.desired_camera_resolution = this.custom_camera_resolution;

    this.$refs.videoElement.addEventListener(
      "loadedmetadata",
      this.refreshVideoActualSize
    );
    if (!navigator.getUserMedia) {
      alert("You need a browser that supports WebRTC");
      return;
    }

    this.is_loading_available_devices = true;

    //Call gUM early to force user gesture and allow device enumeration
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then((stream) => {
        this.stream = stream; // make globally available

        if ("srcObject" in this.$refs.videoElement) {
          this.$refs.videoElement.srcObject = stream;
        } else {
          // Avoid using this in new browsers, as it is going away.
          this.$refs.videoElement.src = window.URL.createObjectURL(stream);
        }
      })
      .catch((error) => {
        console.error("getUserMedia error!", error);
        this.is_loading_available_devices = false;
        return;
      })
      .then(this.refreshAvailableDevices)
      .then(() => {
        this.setDefaultInputsAndOutputs();
        this.is_loading_available_devices = false;
      })
      .catch((err) => {
        this.is_loading_available_devices = false;
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t("notifications.failed_listing_devices") +
              "<br>" +
              err.name +
              ": " +
              err.message
          );
      });
  },
  beforeDestroy() {
    this.$refs.videoElement.removeEventListener(
      "loadedmetadata",
      this.refreshVideoActualSize
    ); //turn off the event handler

    if (this.stream)
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
  },
  watch: {
    "selected_devices_id.video_input_device": function () {
      this.available_camera_resolutions = [];
    },
  },
  computed: {
    all_video_input_devices() {
      return this.connected_devices.filter((d) => d.kind === "videoinput");
    },
    all_audio_input_devices() {
      return this.connected_devices.filter((d) => d.kind === "audioinput");
    },
    all_audio_output_devices() {
      return this.connected_devices.filter((d) => d.kind === "audiooutput");
    },
    current_settings() {
      if (
        !this.selected_devices_id.video_input_device ||
        !this.desired_camera_resolution ||
        !this.desired_camera_resolution.width ||
        !this.desired_camera_resolution.height
      )
        return false;

      return (
        this.selected_devices_id.video_input_device.deviceId +
        "_" +
        this.desired_camera_resolution.width +
        "x" +
        this.desired_camera_resolution.height
      );
    },
    video_styles() {
      if (
        !this.actual_camera_resolution.width ||
        !this.actual_camera_resolution.height
      )
        return "";
      return {
        width: this.actual_camera_resolution.width + "px",
        height: this.actual_camera_resolution.height + "px",
      };
    },
  },
  methods: {
    listDevices() {
      return new Promise((resolve, reject) => {
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            if (!this.$root.state.is_electron) {
              return resolve(devices);
            } else return devices;
          })
          .then((devices) => {
            this.getDesktopCapturer()
              .then((sources) => {
                devices = devices.concat(sources);
              })
              .catch((err) => {})
              .then(() => {
                return resolve(devices);
              });
            // const screen_infos = sources.reduce((acc, source) => {
            //                     acc.push(source);
            //                     return acc;
            //                   }, []);
            //                   return resolve(screen_infos);
            // })
          })
          .catch((err) => {
            return reject(err);
          });
      });
    },
    setDefaultInputsAndOutputs() {
      if (this.connected_devices.length === 0) return;

      if (this.all_video_input_devices.length > 0)
        this.selected_devices_id.video_input_device = this.all_video_input_devices[0];
      if (this.all_audio_input_devices.length > 0)
        this.selected_devices_id.audio_input_device = this.all_audio_input_devices[0];
      if (this.all_video_input_devices.length > 0)
        this.selected_devices_id.audio_output_device = this.all_audio_output_devices[0];
    },
    getAllAvailableResolutions() {
      const all_resolutions = [];

      this.is_scanning_resolutions = true;
      this.$refs.videoElement.pause();

      let tasks = this.quickScan_resolutions.map((resolution) => () =>
        this.setCameraStream(
          resolution,
          this.selected_devices_id.video_input_device
        )
      );

      const serial = (funcs) =>
        funcs.reduce(
          (promise, func) =>
            promise.then((result) =>
              func().then(Array.prototype.concat.bind(result))
            ),
          Promise.resolve([])
        );
      serial(tasks).then((res) => {
        res = res.filter((r) => !r.status && r.status !== "error");
        this.available_camera_resolutions = res;
        this.is_scanning_resolutions = false;
        this.$refs.videoElement.play();
      });
    },
    refreshAvailableDevices() {
      return new Promise((resolve, reject) => {
        this.connected_devices = [];
        this.is_loading_available_devices = true;
        this.listDevices().then((devices) => {
          this.connected_devices = devices.map((d) => {
            return {
              label: d.label,
              kind: d.kind,
              deviceId: d.deviceId,
              chromeMediaSource: d.chromeMediaSource
                ? d.chromeMediaSource
                : false,
            };
          });

          this.is_loading_available_devices = false;
          return resolve();
        });
      });
    },
    setCameraStream(candidate, device) {
      return new Promise((resolve, reject) => {
        console.log("trying " + candidate.label + " on " + device.label);

        //Kill any running streams;
        if (this.stream)
          this.stream.getTracks().forEach((track) => {
            track.stop();
          });

        let constraints = undefined;
        if (
          !device.hasOwnProperty("chromeMediaSource") ||
          !device.chromeMediaSource
        ) {
          // non screen capture devices
          constraints = {
            audio: false,
            video: {
              deviceId: device.deviceId
                ? { exact: device.deviceId }
                : undefined,
              width: { exact: candidate.width }, //new syntax
              height: { exact: candidate.height }, //new syntax
            },
          };
        } else {
          // screen capture devices
          constraints = {
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: device.chromeMediaSource,
                chromeMediaSourceId: device.deviceId,
                minWidth: candidate.width,
                maxWidth: candidate.width,
                minHeight: candidate.height,
                maxHeight: candidate.height,
              },
            },
          };
        }

        console.log("Constraints = " + JSON.stringify(constraints, null, 4));

        setTimeout(
          () => {
            navigator.mediaDevices
              .getUserMedia(constraints)
              .then(gotStream)
              .then(() => {
                // this.$alertify
                //   .closeLogOnClick(true)
                //   .delay(4000)
                //   .success(this.$t("notifications.successfully_loaded_res"));

                this.$refs.videoElement.onloadedmetadata = (e) => {
                  // check if candidate settings fit actual settings
                  this.getVideoActualSize().then((video_size) => {
                    if (
                      video_size.width === candidate.width &&
                      video_size.height === candidate.height
                    ) {
                      return resolve(candidate);
                    } else {
                      console.log(
                        "getUserMedia error! Mismatch between expected and actual camera stream resolution"
                      );
                      return resolve(`Resolution mismatch.`);
                    }
                  });
                };
              })
              .catch((error) => {
                console.log("getUserMedia error : ", error);
                // captureResults("fail: " + error.name);
                // this.$alertify
                //   .closeLogOnClick(true)
                //   .delay(4000)
                //   .error(this.$t("notifications.failed_loading_res"));
                return resolve({
                  status: error,
                  msg: `Failed to getUserMedia : ` + error.name,
                });
              });
          },
          this.stream ? 200 : 0
        ); //official examples had this at 200

        const gotStream = (stream) => {
          //change the video dimensions
          // console.log(
          //   "Display size for " +
          //     candidate.label +
          //     ": " +
          //     candidate.width +
          //     "x" +
          //     candidate.height
          // );

          this.$refs.videoElement.width = candidate.width;
          this.$refs.videoElement.height = candidate.height;
          this.stream = stream; // make globally available

          if ("srcObject" in this.$refs.videoElement) {
            this.$refs.videoElement.srcObject = stream;
          } else {
            // Avoid using this in new browsers, as it is going away.
            this.$refs.videoElement.src = window.URL.createObjectURL(stream);
          }

          this.$refs.videoElement.onloadedmetadata = (e) => {
            this.$refs.videoElement.play();
          };
        };
      });
    },
    getDesktopCapturer() {
      return new Promise((resolve, reject) => {
        const { desktopCapturer } = window.require("electron");
        desktopCapturer.getSources(
          { types: ["window", "screen"] },
          (err, sources) => {
            if (err) return reject(err);
            // sources = sources.filter((s) => s.name === "Entire screen");
            sources = sources.map((s) => {
              return {
                chromeMediaSource: "desktop",
                deviceId: s.id,
                kind: "videoinput",
                label: "🖥️ " + s.name,
              };
            });

            return resolve(sources);
          }
        );
        // .catch((err) => reject(err));
      });
    },
    setCameraStreamFromDefaults() {
      this.stream_current_settings = this.current_settings;

      this.setCameraStream(
        this.desired_camera_resolution,
        this.selected_devices_id.video_input_device
      ).catch(() => {
        this.stream_current_settings = false;
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.failed_to_use_selected_resolution"));
      });
    },
    refreshVideoActualSize() {
      this.getVideoActualSize()
        .then(({ width, height }) => {
          this.actual_camera_resolution.width = width;
          this.actual_camera_resolution.height = height;
        })
        .catch((err) => {
          if (this.$root.state.dev_mode === "debug")
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error("DEBUG error : failed to get video actual size");
        });
    },
    getVideoActualSize() {
      return new Promise((resolve, reject) => {
        //Wait for dimensions if they don't show right away
        let wait_period_if_necessary = 0;
        if (!this.$refs.videoElement.videoWidth) {
          wait_period_if_necessary = 500; //was 500
        }

        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        wait(wait_period_if_necessary).then(() => {
          if (
            this.$refs.videoElement.videoWidth *
              this.$refs.videoElement.videoHeight >
            0
          ) {
            return resolve({
              width: this.$refs.videoElement.videoWidth,
              height: this.$refs.videoElement.videoHeight,
            });
          } else {
            return reject("couldn’t get video dimensions");
          }
        });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.m_captureview2 {
  display: flex;
  flex-flow: row nowrap;

  .m_captureview2--settingsPane {
    position: relative;
    flex: 0 0 240px;
    max-width: 320px;
    background-color: var(--c-rouge);
    color: white;

    display: flex;
    flex-flow: column nowrap;

    label,
    .buttonLink {
      color: inherit;
    }
  }

  .m_captureview2--settingsPane--topbar {
    flex: 0 0 auto;
    border-bottom: 2px solid var(--c-rouge_fonce);
    padding: calc(var(--spacing) / 2);
    color: white;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .m_captureview2--settingsPane--settings {
    overflow-y: auto;
    flex: 1 1 auto;
    padding: calc(var(--spacing) / 2);
    // padding-bottom: var(--spacing);
  }
  .m_captureview2--settingsPane--updateButton {
    flex: 0 0 auto;
    border-top: 2px solid var(--c-rouge_fonce);
    padding: calc(var(--spacing) / 2);
    color: black;

    display: flex;
    align-items: center;
    justify-content: center;
  }

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

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .m_captureview2--videoPane--bottom {
    flex: 0 0 auto;

    background-color: blue;
  }

  .m_captureview2--videoPane--top--resolutionTag {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: var(--c-noir);
    color: white;
    font-size: var(--font-verysmall);
    padding: 2px 4px;
    margin: 5px;
    border-radius: 4px;
    line-height: 1;
  }
}
</style>
