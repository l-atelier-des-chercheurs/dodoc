<template>
  <div class="m_captureSettings">
    <transition name="fade_fast" :duration="400">
      <Loader v-if="is_loading_available_devices || is_loading_feed" />
    </transition>

    <!-- <video ref="videoElement" autoplay playsinline muted v-show="false" /> -->

    <div class="m_captureSettings--topbar">
      <div class="m_captureSettings--topbar--title">
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
    </div>

    <div class="m_captureSettings--settings">
      <label>{{ $t("sources") }}</label>
      <div class="">
        <div class="">
          <label>{{ $t("camera") }}</label>
          <small v-if="!all_video_input_devices.length === 0">
            {{ $t("no_video_input_available") }}
          </small>
          <select
            v-else
            id="devices"
            name="Video devices"
            title="devices"
            v-model="selected_devices.video_input_device"
          >
            <option
              v-for="d in all_video_input_devices"
              :key="d.deviceId"
              :value="d"
            >
              {{ d.label }}
            </option>
          </select>
        </div>
        <div>
          <label>{{ $t("audioinput") }}</label>
          <small v-if="!all_audio_input_devices.length === 0">
            {{ $t("no_audio_input_available") }}
          </small>
          <select
            v-else
            id="devices"
            name="Video devices"
            :disabled="
              selected_devices.video_input_device &&
              selected_devices.video_input_device.chromeMediaSource &&
              selected_devices.video_input_device.chromeMediaSource ===
                'desktop'
            "
            title="devices"
            v-model="selected_devices.audio_input_device"
          >
            <option
              v-for="d in all_audio_input_devices"
              :key="d.deviceId"
              :value="d"
            >
              {{ d.label }}
            </option>
          </select>
          <small
            v-if="
              selected_devices.video_input_device &&
              selected_devices.video_input_device.chromeMediaSource &&
              selected_devices.video_input_device.chromeMediaSource ===
                'desktop'
            "
          >
            audio source unavailable for screen capture
          </small>
        </div>
        <div>
          <label>{{ $t("audiooutput") }}</label>
          <small v-if="!all_audio_output_devices.length === 0">
            {{ $t("no_audio_output_available") }}
          </small>
          <select
            v-else
            id="devices"
            name="Video devices"
            title="devices"
            v-model="selected_devices.audio_output_device"
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
      </div>
      <label>{{ $t("resolutions") }}</label>
      <div>
        <small
          v-if="
            !selected_devices.video_input_device ||
            !selected_devices.video_input_device.deviceId
          "
        >
          {{ $t("pick_a_camera") }}
        </small>
        <template v-else>
          <!-- <button
                type="button"
                class="buttonLink"
                @click="getAllAvailableResolutions"
                :disabled="is_scanning_resolutions"
              >
                get all input resolutions for
                {{ selected_devices.video_input_device.label }}
              </button> -->
        </template>

        <div class="m_captureSettings--settings--resolutions">
          <div
            v-for="res in predefined_resolutions.concat(
              custom_camera_resolution
            )"
            :key="res.name"
          >
            <label :for="res.label">
              <input
                type="radio"
                :id="res.label"
                :value="res"
                :disabled="unavailable_camera_resolutions.includes(res.label)"
                v-model="desired_camera_resolution"
              />
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

      <!-- <div>
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
        </div> -->
    </div>
    <div class="m_captureSettings--updateButton">
      <!-- <small v-if="!desired_camera_resolution">
          Select a camera resolution first
        </small> -->
      <button
        type="button"
        class="bg-rouge button-wide"
        @click="setCameraStreamFromDefaults"
        :disabled="
          !desired_camera_resolution ||
          !selected_devices.video_input_device ||
          current_settings === stream_current_settings
        "
      >
        {{ $t("update") }}
      </button>
      <!-- {{ current_settings }} -->
      <button type="button" class="bg-rouge buttonLink" @click="$emit('close')">
        <span class>{{ $t("close") }}</span>
      </button>
      <!-- <small>
          <span
            v-if="desired_camera_resolution && desired_camera_resolution.label"
          >
            {{ desired_camera_resolution.label }}</span
          >
          <span
            v-if="
              selected_devices &&
              selected_devices.video_input_device &&
              selected_devices.video_input_device.label
            "
          >
            {{ selected_devices.video_input_device.label }}
          </span>
        </small> -->
    </div>
  </div>
</template>
<script>
export default {
  props: {
    stream: MediaStream,
    audio_output_deviceId: String,
    enable_audio: Boolean,
    enable_video: Boolean,
  },
  components: {},
  data() {
    return {
      is_loading_available_devices: false,
      is_loading_feed: false,

      stream_current_settings: undefined,
      desired_camera_resolution: undefined,
      last_working_resolution: undefined,

      selected_devices: {
        video_input_device: undefined,
        audio_input_device: undefined,
        audio_output_device: undefined,
      },

      connected_devices: [],

      predefined_resolutions: [
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

      unavailable_camera_resolutions: [],
      custom_camera_resolution: {
        label: this.$t("custom"),
        type: "custom",
        width: 1280,
        height: 720,
      },

      show_debug: false,
    };
  },
  created() {},
  mounted() {
    if (
      this.$root.settings.capture_options &&
      this.$root.settings.capture_options.desired_camera_resolution
    )
      this.desired_camera_resolution = this.$root.settings.capture_options.desired_camera_resolution;
    else
      this.desired_camera_resolution = this.predefined_resolutions.find(
        (r) => r.label === "720p(HD)"
      );

    if (!navigator.getUserMedia) {
      alert("You need a browser that supports WebRTC");
      return;
    }

    this.is_loading_feed = true;
    this.is_loading_available_devices = true;

    //Call gUM early to force user gesture and allow device enumeration
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        this.$emit("update:stream", stream);
        // if ("srcObject" in this.$refs.videoElement) {
        //   this.$refs.videoElement.srcObject = stream;
        // } else {
        //   // Avoid using this in new browsers, as it is going away.
        //   this.$refs.videoElement.src = window.URL.createObjectURL(stream);
        // }
        return;
      })
      .catch((err) => {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t("notifications.couldnt_load_getusermedia") +
              "<br>" +
              err.name +
              ": " +
              err.message
          );
        this.is_loading_feed = false;
        this.$emit("hasFinishedLoading");
        return;
      })
      .then(this.refreshAvailableDevices)
      .then(() => {
        this.setDefaultInputsAndOutputs();
      })
      .catch((err) => {
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
      })
      .then(() => this.setCameraStreamFromDefaults())
      .then(() => {
        this.is_loading_feed = false;
        this.$emit("hasFinishedLoading");
      })
      .catch(() => {
        this.is_loading_feed = false;
        this.$emit("hasFinishedLoading");
      });
  },
  beforeDestroy() {
    if (this.stream)
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
  },
  watch: {
    "selected_devices.video_input_device": function () {
      this.unavailable_camera_resolutions = [];
      this.last_working_resolution = false;
    },
    enable_audio: function () {
      console.log(`WATCH • Capture: enable_audio = ${this.enable_audio}`);
      this.setCameraStreamFromDefaults();
    },
    stream: function () {
      // if ("srcObject" in this.$refs.videoElement) {
      //   this.$refs.videoElement.srcObject = this.stream;
      // } else {
      //   // Avoid using this in new browsers, as it is going away.
      //   this.$refs.videoElement.src = window.URL.createObjectURL(this.stream);
      // }
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
      let _settings = "";

      if (!!this.selected_devices.video_input_device)
        _settings += this.selected_devices.video_input_device.deviceId + "-";

      if (
        !!this.desired_camera_resolution &&
        !!this.desired_camera_resolution.width &&
        !!this.desired_camera_resolution.height
      )
        _settings +=
          this.desired_camera_resolution.width +
          "x" +
          this.desired_camera_resolution.height +
          "-";

      if (!!this.selected_devices.audio_input_device)
        _settings += this.selected_devices.audio_input_device.deviceId + "-";

      if (!!this.selected_devices.audio_output_device)
        _settings += this.selected_devices.audio_output_device.deviceId + "-";

      return _settings;
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

      // find in $root.settings.capture_options.selected_devices if video_input_device already exists
      if (this.all_video_input_devices.length > 0)
        this.selected_devices.video_input_device = this.getDefaultDevice({
          key: "video_input_device",
          devices_list: this.all_video_input_devices,
        });

      if (this.all_audio_input_devices.length > 0)
        this.selected_devices.audio_input_device = this.getDefaultDevice({
          key: "audio_input_device",
          devices_list: this.all_audio_input_devices,
        });
      if (this.all_audio_output_devices.length > 0)
        this.selected_devices.audio_output_device = this.getDefaultDevice({
          key: "audio_output_device",
          devices_list: this.all_audio_output_devices,
        });
    },

    getDefaultDevice({ key, devices_list }) {
      // find if this.$root.settings.capture_options.selected_devices has key, and if value is in devices_list
      const previously_used = this.$root.settings.capture_options
        .selected_devices;
      if (previously_used.hasOwnProperty(key) && !!previously_used[key]) {
        const found_device = devices_list.find(
          (d) => d.deviceId === previously_used[key].deviceId
        );
        // if true, use this
        if (found_device) {
          if (this.$root.state.dev_mode === "debug")
            console.log(
              `CaptureSettings • METHODS : getDefaultDevice — found previously used device for ` +
                key
            );

          return found_device;
        }
      }

      if (this.$root.state.dev_mode === "debug")
        console.log(
          `CaptureSettings • METHODS : getDefaultDevice — settings first available device for ` +
            key
        );

      return devices_list[0];

      // otherwise, use first device
    },
    // getAllAvailableResolutions() {
    //   const all_resolutions = [];

    //   this.is_scanning_resolutions = true;
    //   // this.$refs.videoElement.pause();

    //   let tasks = this.predefined_resolutions.map((resolution) => () =>
    //     this.setCameraStream(
    //       resolution,
    //       this.selected_devices.video_input_device,
    //       false
    //     )
    //   );

    //   const serial = (funcs) =>
    //     funcs.reduce(
    //       (promise, func) =>
    //         promise.then((result) =>
    //           func().then(Array.prototype.concat.bind(result))
    //         ),
    //       Promise.resolve([])
    //     );
    //   serial(tasks).then((res) => {
    //     res = res.filter((r) => !r.status && r.status !== "error");
    //     // this.unavailable_camera_resolutions = res;
    //     this.is_scanning_resolutions = false;
    //     // this.$refs.videoElement.play();
    //   });
    // },
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
    setCameraStreamFromDefaults() {
      return new Promise((resolve, reject) => {
        this.stream_current_settings = this.current_settings;

        if (!!this.selected_devices.audio_output_device)
          this.$emit(
            "update:audio_output_deviceId",
            this.selected_devices.audio_output_device.deviceId
          );

        this.setCameraStream(
          this.desired_camera_resolution,
          this.selected_devices
        )
          .then((res) => {
            this.last_working_resolution = this.desired_camera_resolution;
            this.$root.settings.capture_options.selected_devices = JSON.parse(
              JSON.stringify(this.selected_devices)
            );
            return resolve();
          })
          .catch((error) => {
            this.stream_current_settings = false;
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(
                this.$t(
                  "notifications.failed_to_start_video_change_source_or_res"
                ) +
                  "<br>" +
                  error.name
              );
            if (this.desired_camera_resolution.type !== "custom") {
              this.unavailable_camera_resolutions.push(
                this.desired_camera_resolution.label
              );
              if (this.last_working_resolution) {
                this.desired_camera_resolution = this.last_working_resolution;
                setTimeout(() => {
                  this.setCameraStreamFromDefaults().then(() => resolve());
                }, 500);
              } else {
                return reject();
              }
            }
          });
      });
    },
    setCameraStream(camera_resolution, selected_devices) {
      return new Promise((resolve, reject) => {
        const _video_input_device = selected_devices.video_input_device;
        const _audio_input_device = selected_devices.audio_input_device;

        //Kill any running streams;
        if (this.stream)
          this.stream.getTracks().forEach((track) => track.stop());

        let constraints = this.createConstraints(
          camera_resolution,
          _video_input_device,
          _audio_input_device
        );

        setTimeout(
          () => {
            navigator.mediaDevices
              .getUserMedia(constraints)
              .then(gotStream)
              .then(() => {
                return resolve(camera_resolution);
              })
              .catch((error) => {
                console.log("getUserMedia error : ", error);
                return reject(error);
              });
          },
          this.stream ? 200 : 0
        ); //official examples had this at 200

        const gotStream = (stream) => {
          this.$emit("update:stream", stream);
        };
      });
    },
    createConstraints(camera_resolution, vi_device, ai_device) {
      let _constraints = {
        audio: false,
        video: false,
      };

      if (
        !vi_device.hasOwnProperty("chromeMediaSource") ||
        !vi_device.chromeMediaSource
      ) {
        // non screen capture devices
        _constraints.audio = !this.enable_audio
          ? false
          : {
              deviceId: ai_device.deviceId
                ? { exact: ai_device.deviceId }
                : undefined,
            };

        // {
        //   // optional: [{ sourceId: this._video_input_device.audioinput }],
        // };
        _constraints.video = !this.enable_video
          ? false
          : {
              deviceId: vi_device.deviceId
                ? { exact: vi_device.deviceId }
                : undefined,
              width: { exact: camera_resolution.width }, //new syntax
              height: { exact: camera_resolution.height }, //new syntax
            };
      } else {
        // screen capture devices
        _constraints = {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: vi_device.chromeMediaSource,
              chromeMediaSourceId: vi_device.deviceId,
              minWidth: camera_resolution.width,
              maxWidth: camera_resolution.width,
              minHeight: camera_resolution.height,
              maxHeight: camera_resolution.height,
            },
          },
        };
      }

      console.log("Constraints = " + JSON.stringify(_constraints, null, 4));

      return _constraints;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_captureSettings {
  position: relative;
  flex: 1 0 200px;
  max-width: 280px;
  background-color: var(--c-rouge);
  color: white;

  display: flex;
  flex-flow: column nowrap;

  label,
  .buttonLink {
    color: inherit;
  }
}

.m_captureSettings--topbar {
  flex: 0 0 auto;
  border-bottom: 2px solid var(--c-rouge_fonce);
  // padding: calc(var(--spacing) / 2);
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;
}

.m_captureSettings--topbar--title {
  padding: calc(var(--spacing) / 2) var(--spacing);
  font-weight: 700;
  font-size: var(--font-large);
}

.m_captureSettings--settings {
  overflow-y: auto;
  flex: 1 1 auto;
  padding: calc(var(--spacing) / 2);
  // padding-bottom: var(--spacing);

  > div {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 2);
    border-radius: 6px;
  }
}

.m_captureSettings--settings--resolutions {
  label {
    padding: calc(var(--spacing) / 4) 0;

    display: flex;
    align-items: center;

    > input {
      flex: 0 0 auto;
      margin-right: calc(var(--spacing) / 3);
    }
  }
}

.m_captureSettings--updateButton {
  flex: 0 0 auto;
  border-top: 2px solid var(--c-rouge_fonce);
  padding: calc(var(--spacing) / 2);
  color: black;

  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
}
</style>
