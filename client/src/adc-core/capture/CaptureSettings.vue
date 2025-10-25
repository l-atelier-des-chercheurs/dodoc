<template>
  <div class="m_captureSettings">
    <transition name="fade_fast" :duration="400">
      <LoaderSpinner
        class="_loader"
        v-if="is_loading_available_devices || is_loading_feed"
      />
    </transition>

    <!-- <RadioSwitch
      :content.sync="current_mode"
      :options="[
        {
          label: $t('stream_local_mode'),
          value: 'LocalSources',
        },
        {
          label: $t('stream_remote_mode'),
          value: 'RemoteSources',
        },
      ]"
    /> -->

    <div class="m_captureSettings--settings">
      <div class>
        <div v-if="status === 'not_allowed'">
          <div class="padding-top-verysmall">
            {{ $t("camera_access_refused") }}
          </div>
        </div>

        <label class="u-label _sourcesTitle">
          {{ $t("sources") }}
          <button
            type="button"
            class="u-buttonLink margin-none margin-left padding-bottom-none"
            @click="manualRefreshDevices"
          >
            {{ $t("reload") }}
          </button>
        </label>

        <div class="">
          <div class="">
            <label class="u-label">{{ $t("camera") }}</label>

            <div>
              <small v-if="all_video_input_devices.length === 0">
                {{ $t("no_video_input_available") }}
              </small>
              <select
                v-else
                id="devices"
                name="Video devices"
                title="devices"
                class=""
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

            <div
              v-if="
                selected_devices.video_input_device &&
                selected_devices.video_input_device.deviceId ===
                  'screen_capture'
              "
              class="margin-top-veryverysmall"
            >
              <span class="u-switch u-switch-xs">
                <input
                  id="show_cursor"
                  type="checkbox"
                  v-model="advanced_capture_options.cursor.enabled"
                  :disabled="!advanced_capture_options.cursor.supported"
                  true-value="always"
                  false-value="never"
                />
                <label class="u-label" for="show_cursor">{{
                  $t("show_cursor")
                }}</label>
                <small v-if="!advanced_capture_options.cursor.supported">
                  {{ $t("not_supported_on_this_device") }}
                </small>
              </span>
            </div>
          </div>
          <div>
            <label class="u-label">{{ $t("audioinput") }}</label>
            <div>
              <small v-if="all_audio_input_devices.length === 0">
                {{ $t("no_audio_input_available") }}
              </small>
              <select
                v-else
                id="devices"
                name="Video devices"
                title="devices"
                class=""
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
            </div>

            <div
              v-if="selected_devices.audio_input_device"
              class="margin-top-veryverysmall"
            >
              <span class="u-switch u-switch-xs">
                <input
                  id="echoCancellation"
                  type="checkbox"
                  :disabled="
                    !advanced_capture_options.echoCancellation.supported
                  "
                  v-model="advanced_capture_options.echoCancellation.enabled"
                />
                <label class="u-label" for="echoCancellation">{{
                  $t("echoCancellation")
                }}</label>
                <small
                  v-if="!advanced_capture_options.echoCancellation.supported"
                >
                  {{ $t("not_supported_on_this_device") }}
                </small>
              </span>
            </div>
            <div
              v-if="selected_devices.audio_input_device"
              class="margin-top-veryverysmall"
            >
              <span class="u-switch u-switch-xs">
                <input
                  id="noiseSuppression"
                  type="checkbox"
                  :disabled="
                    !advanced_capture_options.noiseSuppression.supported
                  "
                  v-model="advanced_capture_options.noiseSuppression.enabled"
                />
                <label class="u-label" for="noiseSuppression">{{
                  $t("noiseSuppression")
                }}</label>
                <small
                  v-if="!advanced_capture_options.noiseSuppression.supported"
                >
                  {{ $t("not_supported_on_this_device") }}
                </small>
              </span>
            </div>
          </div>
          <div>
            <label class="u-label">{{ $t("audiooutput") }}</label>

            <div>
              <small v-if="all_audio_output_devices.length === 0">
                {{ $t("no_audio_output_available") }}
              </small>
              <select
                v-else
                id="devices"
                name="Video devices"
                title="devices"
                class=""
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
        </div>

        <div class="u-spacingBottom" />

        <label class="u-label">{{ $t("resolutions") }}</label>
        <div>
          <div
            v-if="
              !selected_devices.video_input_device ||
              !selected_devices.video_input_device.deviceId
            "
          >
            <small>
              {{ $t("pick_a_camera") }}
            </small>
          </div>
          <div
            v-if="
              selected_devices.video_input_device &&
              (selected_devices.video_input_device.deviceId ===
                'screen_capture' ||
                selected_devices.video_input_device.chromeMediaSource)
            "
          >
            <small>
              {{ $t("cant_pick_resolution_when_screen_capture") }}
            </small>
          </div>
          <div class="m_captureSettings--settings--resolutions" v-else>
            <div
              v-for="res in predefined_resolutions.concat(
                custom_camera_resolution
              )"
              :key="res.name"
            >
              <label :for="res.label" class="">
                <input
                  type="radio"
                  :id="res.label"
                  :value="res"
                  :disabled="unavailable_camera_resolutions.includes(res.label)"
                  v-model="desired_camera_resolution"
                />
                <span class="_resolutionLabel">
                  <DLabel
                    :str="res.label"
                    tag="div"
                    :instructions="resInstructions(res)"
                  />
                </span>
              </label>
            </div>

            <div
              v-if="
                desired_camera_resolution &&
                desired_camera_resolution.type === 'custom'
              "
              class="u-sameRow _customResolution"
            >
              <label class="u-label" for="custom_width">
                <input
                  name="custom_width"
                  type="number"
                  min="2"
                  max="4096"
                  step="2"
                  v-model.number="desired_camera_resolution.width"
                />
              </label>
              <span class="u-padding_verysmall _customResolutionX"> × </span>
              <label class="u-label" for="custom_height">
                <input
                  name="custom_height"
                  type="number"
                  min="2"
                  max="2160"
                  step="2"
                  v-model.number="desired_camera_resolution.height"
                />
                {{ $t("pixels") }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="m_captureSettings--updateButton" v-if="false">
      <!-- <small v-if="!desired_camera_resolution">
          Select a camera resolution first
        </small> -->

      <div class="m_captureSettings--updateButton--buttons">
        <template v-if="current_mode === 'LocalSources'">
          <!-- <button
            type="button"
            v-if="show_update_btn"
            class="u-button u-button_white u-button_wide"
            @click="setCameraStreamFromDefaults"
          >
            {{ $t("update") }}
          </button> -->
        </template>

        <!-- <button
          type="button"
          class="bg-rouge u-buttonLink"
          @click="$emit('close')"
        >
          <span class>{{ $t("close") }}</span>
        </button> -->
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    audio_output_deviceId: String,
  },
  components: {},
  data() {
    return {
      is_loading_available_devices: false,
      is_loading_feed: false,
      status: undefined,

      local_stream: undefined,

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
          label: this.$t("very_high"),
          label_detail: "4K(UHD)",
          width: 3840,
          height: 2160,
          ratio: "16:9",
        },
        {
          label: this.$t("high"),
          label_detail: "1080p(FHD)",
          width: 1920,
          height: 1080,
          ratio: "16:9",
        },
        {
          label: this.$t("medium"),
          label_detail: "720p(HD)",
          width: 1280,
          height: 720,
          ratio: "16:9",
        },
        {
          label: this.$t("low"),
          label_detail: "VGA",
          width: 640,
          height: 480,
          ratio: "4:3",
        },
      ],

      unavailable_camera_resolutions: [],
      custom_camera_resolution: {
        label: this.$t("custom_f"),
        type: "custom",
        width: 1280,
        height: 720,
      },

      advanced_capture_options: {
        echoCancellation: {
          supported: undefined,
          enabled: false,
        },
        noiseSuppression: {
          supported: undefined,
          enabled: false,
        },
        cursor: {
          supported: undefined,
          enabled: false,
        },
      },
    };
  },
  created() {},
  async mounted() {
    try {
      await this.initializeCaptureSettings();
    } catch (error) {
      console.error("Failed to initialize capture settings:", error);
      this.handleInitializationError(error);

      // Fallback: try to at least show the UI with basic functionality
      this.is_loading_feed = false;
      this.is_loading_available_devices = false;
      this.$emit("hasFinishedLoading");
    }
  },
  async beforeDestroy() {
    try {
      await this.cleanupStream();
    } catch (error) {
      console.warn("Error during component cleanup:", error);
    }
  },
  watch: {
    "selected_devices.video_input_device": function () {
      this.unavailable_camera_resolutions = [];
      this.last_working_resolution = false;
    },
    selected_devices: {
      async handler() {
        try {
          localStorage.setItem(
            "selected_devices",
            JSON.stringify(this.selected_devices)
          );
          await this.setCameraStreamFromDefaults();
        } catch (error) {
          console.error("Error in selected_devices watcher:", error);
        }
      },
      deep: true,
    },
    desired_camera_resolution: {
      async handler() {
        try {
          await this.setCameraStreamFromDefaults();
        } catch (error) {
          console.error("Error in desired_camera_resolution watcher:", error);
        }
      },
      deep: true,
    },
    last_working_resolution: {
      handler() {
        // TODO save last working res
        // if (!this.last_working_resolution)
        //   this.$root.settings.capture_options.last_working_resolution = false;
        // this.$root.settings.capture_options.last_working_resolution =
        //   JSON.parse(JSON.stringify(this.last_working_resolution));
      },
      deep: true,
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

      if (this.selected_devices.video_input_device) {
        _settings += this.selected_devices.video_input_device.deviceId + "-";
        if (
          this.selected_devices.video_input_device.deviceId === "screen_capture"
        )
          _settings += this.advanced_capture_options.cursor.enabled + "-";
      }

      if (
        !!this.desired_camera_resolution &&
        !!this.desired_camera_resolution.width &&
        !!this.desired_camera_resolution.height
      ) {
        _settings +=
          this.desired_camera_resolution.width +
          "x" +
          this.desired_camera_resolution.height +
          "-";
      }

      if (this.selected_devices.audio_input_device) {
        _settings += this.selected_devices.audio_input_device.deviceId + "-";
        _settings +=
          this.advanced_capture_options.noiseSuppression.enabled + "-";
        _settings +=
          this.advanced_capture_options.echoCancellation.enabled + "-";
      }

      if (this.selected_devices.audio_output_device)
        _settings += this.selected_devices.audio_output_device.deviceId + "-";

      return _settings;
    },
  },
  methods: {
    async initializeCaptureSettings() {
      console.log("Starting capture settings initialization...");

      // Check browser compatibility first
      if (!this.checkBrowserCompatibility()) {
        console.log("Browser compatibility check failed");
        return;
      }

      this.is_loading_feed = true;
      this.is_loading_available_devices = true;

      try {
        console.log("Requesting initial permissions...");
        // Request initial permissions
        await this.requestInitialPermissions();

        console.log("Refreshing available devices...");
        // Refresh available devices
        await this.refreshAvailableDevices();

        console.log("Setting default inputs and outputs...");
        // Set default inputs and outputs
        this.setDefaultInputsAndOutputs();

        console.log("Setting up camera stream...");
        // Set up camera stream
        await this.setCameraStreamFromDefaults();

        console.log("Initialization completed successfully");
        this.is_loading_feed = false;
        this.$emit("hasFinishedLoading");
      } catch (error) {
        console.error("Initialization failed:", error);
        this.is_loading_feed = false;
        this.$emit("hasFinishedLoading");
        throw error;
      }
    },

    async manualRefreshDevices() {
      try {
        console.log("Manual device refresh requested");
        await this.refreshAvailableDevices();
        this.setDefaultInputsAndOutputs();
        await this.setCameraStreamFromDefaults();
      } catch (error) {
        console.error("Manual refresh failed:", error);
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            "Failed to refresh devices. Please check your permissions and try again."
          );
      }
    },

    checkBrowserCompatibility() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t("browser_not_supported") ||
              "Your browser doesn't support media capture"
          );
        return false;
      }
      return true;
    },

    async requestInitialPermissions() {
      try {
        console.log("Requesting getUserMedia permissions...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        console.log("Permissions granted, stream created:", stream);

        // Store the stream temporarily for device enumeration
        this.local_stream = stream;
      } catch (error) {
        console.error("Permission request failed:", error);
        this.handlePermissionError(error);
        throw error;
      }
    },

    handlePermissionError(error) {
      let errorMessage =
        this.$t("couldnt_load_getusermedia") ||
        "Could not access media devices";

      switch (error.name) {
        case "NotAllowedError":
          errorMessage +=
            "<br>" + (this.$t("permission_denied") || "Permission denied");
          this.status = "not_allowed";
          break;
        case "NotFoundError":
          errorMessage +=
            "<br>" + (this.$t("no_media_devices") || "No media devices found");
          break;
        case "NotReadableError":
          errorMessage +=
            "<br>" + (this.$t("device_in_use") || "Device is already in use");
          break;
        default:
          errorMessage += "<br>" + error.name + ": " + error.message;
      }

      this.$alertify.closeLogOnClick(true).delay(4000).error(errorMessage);
    },

    handleInitializationError(error) {
      console.error("Initialization error:", error);
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error(
          (this.$t("failed_to_initialize_capture") ||
            "Failed to initialize capture settings") +
            "<br>" +
            error.message
        );
      this.$emit("show");
    },

    async listDevices() {
      if (this.$root.debug_mode === true) {
        console.log(`CaptureSettings • METHODS : listDevices`);
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Validate devices array
        if (!Array.isArray(devices)) {
          throw new Error("Invalid devices response from browser");
        }

        try {
          // Get desktop capture sources
          const desktopSources = await this.getDesktopCapturer();
          if (Array.isArray(desktopSources)) {
            return devices.concat(desktopSources);
          }
        } catch (error) {
          console.warn("Failed to get desktop sources:", error);
          // Continue with regular devices even if desktop capture fails
        }

        return devices;
      } catch (error) {
        console.error("Failed to enumerate devices:", error);
        throw new Error(`Device enumeration failed: ${error.message}`);
      }
    },
    resInstructions(res) {
      if (res.type === "custom") return undefined;
      return `${res.label_detail} • ${res.ratio} • ${res.width}×${
        res.height
      } ${this.$t("pixels")}`;
    },
    setSupportedConstraints() {
      if (this.$root.debug_mode === true) {
        console.log(`CaptureSettings • METHODS : setSupportedConstraints`);
      }

      try {
        const supported_constraints =
          navigator.mediaDevices.getSupportedConstraints();
        if (!supported_constraints) {
          console.warn("getSupportedConstraints not available");
          return;
        }

        // Safely update constraint support
        Object.keys(this.advanced_capture_options).forEach((prop) => {
          const isSupported = supported_constraints[prop] === true;
          this.advanced_capture_options[prop].supported = isSupported;
          // Only enable if supported, otherwise keep current state
          if (isSupported) {
            this.advanced_capture_options[prop].enabled = true;
          }
        });
      } catch (error) {
        console.error("Failed to set supported constraints:", error);
      }
    },
    setDefaultInputsAndOutputs() {
      if (this.$root.debug_mode === true)
        console.log(`CaptureSettings • METHODS : setDefaultInputsAndOutputs`);

      if (this.connected_devices.length === 0) return;

      if (this.all_video_input_devices.length > 0)
        this.selected_devices.video_input_device = this.getDefaultDevice({
          key: "video_input_device",
          option_preference: {
            key: "facingMode",
            value: "environment",
          },
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

      // TODO restore last working res
      // if (
      //   this.$root.settings.capture_options &&
      //   this.$root.settings.capture_options.last_working_resolution
      // ) {
      //   this.desired_camera_resolution = JSON.parse(
      //     JSON.stringify(
      //       this.$root.settings.capture_options.last_working_resolution
      //     )
      //   );
      // } else {
      this.desired_camera_resolution = this.predefined_resolutions.find(
        (r) => r.height === 720
      );
      // }
    },
    getDefaultDevice({ key, option_preference, devices_list }) {
      if (this.$root.debug_mode === true) {
        console.log(
          `CaptureSettings • METHODS : getDefaultDevice ${key} ${option_preference} ${devices_list}`
        );
      }

      // Validate input parameters
      if (!key || !Array.isArray(devices_list) || devices_list.length === 0) {
        console.warn("Invalid parameters for getDefaultDevice");
        return devices_list[0] || null;
      }

      let previously_used = null;

      // Try to restore previously used device
      try {
        const storedDevices = localStorage.getItem("selected_devices");
        if (storedDevices) {
          previously_used = JSON.parse(storedDevices);

          if (previously_used?.[key]?.deviceId) {
            const found_device = devices_list.find(
              (d) => d.deviceId === previously_used[key].deviceId
            );
            if (found_device) {
              return found_device;
            }
          }
        }
      } catch (error) {
        console.warn("Failed to parse stored devices:", error);
        // Clear corrupted data
        localStorage.removeItem("selected_devices");
      }

      // Try to find device with preferred option
      if (option_preference?.key && option_preference?.value) {
        const found_device = devices_list.find(
          (d) => d[option_preference.key] === option_preference.value
        );
        if (found_device) {
          return found_device;
        }
      }

      if (this.$root.debug_mode === true) {
        console.log(
          `CaptureSettings • METHODS : getDefaultDevice — setting first available device for ${key}`
        );
      }

      return devices_list[0];
    },
    async startMediaDeviceFeed(constraints) {
      if (this.$root.debug_mode === true) {
        console.log(`CaptureSettings • METHODS : startMediaDeviceFeed`);
      }

      // Validate constraints
      if (!constraints || typeof constraints !== "object") {
        throw new Error("Invalid constraints provided");
      }

      try {
        const streams = await Promise.allSettled([
          this.startVideoFeed(constraints),
          this.startAudioFeed(constraints),
        ]);

        const tracks = [];
        const errors = [];

        // Process video stream
        if (streams[0].status === "fulfilled" && streams[0].value) {
          const videoStream = streams[0].value;
          if (videoStream.stream) {
            tracks.push(...videoStream.stream.getTracks());
          }
        } else if (streams[0].status === "rejected") {
          errors.push(`Video: ${streams[0].reason.message}`);
        }

        // Process audio stream
        if (streams[1].status === "fulfilled" && streams[1].value) {
          const audioStream = streams[1].value;
          if (audioStream.stream) {
            tracks.push(...audioStream.stream.getAudioTracks());
          }
        } else if (streams[1].status === "rejected") {
          errors.push(`Audio: ${streams[1].reason.message}`);
        }

        // Check if we have any tracks
        if (tracks.length === 0) {
          throw new Error(`No media tracks available. ${errors.join("; ")}`);
        }

        return new MediaStream(tracks);
      } catch (error) {
        console.error("Failed to start media device feed:", error);
        throw error;
      }
    },

    async startVideoFeed(constraints) {
      if (!constraints.video) {
        return null;
      }

      try {
        let stream;
        if (constraints._is_webrtc_screen_capture === true) {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: constraints.video,
            audio: false,
          });
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            video: constraints.video,
            audio: false,
          });
        }

        return { type: "videoStream", stream };
      } catch (error) {
        console.error("Failed to start video feed:", error);
        throw error;
      }
    },

    async startAudioFeed(constraints) {
      if (!constraints.audio) {
        return null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: constraints.audio,
        });

        return { type: "audioStream", stream };
      } catch (error) {
        console.error("Failed to start audio feed:", error);
        throw error;
      }
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
    async getDesktopCapturer() {
      // Check if we're in Electron and desktopCapturer is available
      if (!window.electronAPI || !window.electronAPI.desktopCapturer) {
        if (this.$root.debug_mode === true) {
          console.log(
            "Desktop capture not available (not in Electron or API missing)"
          );
        }
        return [];
      }

      if (this.$root.debug_mode === true) {
        console.log(`CaptureSettings • METHODS : getDesktopCapturer`);
      }

      try {
        const sources = await window.electronAPI.desktopCapturer({
          types: ["window", "screen"],
        });

        if (!sources || !Array.isArray(sources)) {
          console.log("No desktop sources available");
          return [];
        }

        const desktopSources = sources.map((s) => {
          return {
            chromeMediaSource: "desktop",
            deviceId: s.id,
            kind: "videoinput",
            label: "🖥️ " + s.name,
            thumbnail: s.thumbnail, // Include thumbnail for preview
          };
        });

        console.log(`Found ${desktopSources.length} desktop sources`);
        return desktopSources;
      } catch (error) {
        console.error("Desktop capture error:", error);
        return []; // Return empty array instead of rejecting
      }
    },
    async refreshAvailableDevices() {
      console.log("Refreshing available devices...");

      this.connected_devices = [];
      this.is_loading_available_devices = true;

      try {
        // Set supported constraints first
        console.log("Setting supported constraints...");
        this.setSupportedConstraints();

        // Get device list
        console.log("Enumerating devices...");
        const devices = await this.listDevices();
        console.log("Found devices:", devices.length);

        // Process and validate devices
        this.connected_devices = devices.map((d) => {
          const { label, kind, deviceId, chromeMediaSource = false } = d;
          let facingMode = {};

          try {
            const capabilities = d.getCapabilities?.();
            facingMode = capabilities?.facingMode?.[0] || {};
          } catch (error) {
            // Capabilities not available, continue with empty facingMode
            console.warn("Could not get device capabilities:", error);
          }

          return {
            label: label || `Unknown ${kind}`,
            kind,
            deviceId,
            facingMode,
            chromeMediaSource,
          };
        });

        // Add screen capture option for non-Electron environments
        this.connected_devices.push({
          deviceId: "screen_capture",
          kind: "videoinput",
          label: "🖥️ " + this.$t("screen_capture"),
        });

        console.log("Processed devices:", this.connected_devices.length);
        this.is_loading_available_devices = false;
      } catch (error) {
        console.error("Failed to refresh available devices:", error);
        this.is_loading_available_devices = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            (this.$t("failed_listing_devices") || "Failed to list devices") +
              "<br>" +
              error.message
          );

        throw error;
      }
    },
    async setCameraStreamFromDefaults() {
      if (this.$root.debug_mode === true) {
        console.log(`CaptureSettings • METHODS : setCameraStreamFromDefaults`);
      }

      this.is_loading_feed = true;

      try {
        // Update audio output device if selected
        if (this.selected_devices.audio_output_device) {
          this.$emit(
            "update:audio_output_deviceId",
            this.selected_devices.audio_output_device.deviceId
          );
        }

        await this.startLocalStream();

        this.stream_current_settings = this.current_settings;
        this.last_working_resolution = this.desired_camera_resolution;
        this.is_loading_feed = false;
      } catch (error) {
        this.is_loading_feed = false;

        console.error("Failed to set camera stream:", error);

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            (this.$t("failed_to_start_streams_change_source_or_res") ||
              "Failed to start streams. Try changing source or resolution") +
              "<br>" +
              error.name
          );

        // Try to recover with last working resolution
        if (
          this.desired_camera_resolution?.type !== "custom" &&
          this.last_working_resolution
        ) {
          this.unavailable_camera_resolutions.push(
            this.desired_camera_resolution.label
          );
          this.desired_camera_resolution = this.last_working_resolution;
          this.last_working_resolution = false;

          // Retry after a short delay
          setTimeout(async () => {
            try {
              await this.setCameraStreamFromDefaults();
            } catch (retryError) {
              console.error("Retry failed:", retryError);
            }
          }, 500);
        } else {
          throw error;
        }
      }
    },
    async startLocalStream() {
      if (this.$root.debug_mode === true) {
        console.log(`CaptureSettings • METHODS : startLocalStream`);
      }

      try {
        // Clean up any existing stream
        await this.cleanupStream();

        // Create constraints from selected devices
        const constraints = this.createConstraintsFromSelected();

        // Validate constraints before attempting to create stream
        this.validateConstraints(constraints);

        // Start the media device feed
        const stream = await this.startMediaDeviceFeed(constraints);

        this.local_stream = stream;

        // Emit the stream directly to the parent component
        this.$emit("setStream", stream);

        return stream;
      } catch (error) {
        console.error("getUserMedia error:", error);
        this.$emit("show");

        if (error.name === "NotAllowedError") {
          this.status = "not_allowed";
        }

        throw error;
      }
    },

    async cleanupStream() {
      if (this.local_stream) {
        try {
          this.local_stream.getTracks().forEach((track) => track.stop());
          this.local_stream = undefined;
          // Wait a bit for cleanup to complete
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.warn("Error during stream cleanup:", error);
        }
      }
    },

    validateConstraints(constraints) {
      if (!constraints || typeof constraints !== "object") {
        throw new Error("Invalid constraints object");
      }

      // Validate video constraints if present
      if (constraints.video && typeof constraints.video === "object") {
        if (constraints.video.width && constraints.video.height) {
          if (constraints.video.width < 1 || constraints.video.height < 1) {
            throw new Error("Invalid video dimensions");
          }
        }
      }

      // Validate audio constraints if present
      if (constraints.audio && typeof constraints.audio === "object") {
        if (constraints.audio.deviceId && !constraints.audio.deviceId.exact) {
          console.warn("Audio deviceId should use exact constraint");
        }
      }
    },
    createConstraintsFromSelected() {
      if (this.$root.debug_mode === true) {
        console.log(
          `CaptureSettings • METHODS : createConstraintsFromSelected`
        );
      }

      const constraints = {
        audio: false,
        video: false,
      };

      // Audio constraints
      if (this.selected_devices.audio_input_device) {
        constraints.audio = {
          deviceId: this.selected_devices.audio_input_device.deviceId
            ? { exact: this.selected_devices.audio_input_device.deviceId }
            : undefined,
          echoCancellation:
            this.advanced_capture_options.echoCancellation.enabled,
          noiseSuppression:
            this.advanced_capture_options.noiseSuppression.enabled,
        };
      }

      // Video constraints
      if (this.selected_devices.video_input_device) {
        const videoDevice = this.selected_devices.video_input_device;

        // Electron desktop capturer
        if (videoDevice.chromeMediaSource) {
          constraints._is_electron_screen_capture = true;
          constraints.video = {
            mandatory: {
              chromeMediaSource: videoDevice.chromeMediaSource,
              chromeMediaSourceId: videoDevice.deviceId,
            },
          };
        }
        // Browser screen capture
        else if (videoDevice.deviceId === "screen_capture") {
          constraints._is_webrtc_screen_capture = true;
          constraints.video = {
            cursor: this.advanced_capture_options.cursor.enabled,
          };
        }
        // Regular camera
        else {
          constraints.video = {
            deviceId: videoDevice.deviceId
              ? { exact: videoDevice.deviceId }
              : undefined,
          };

          // Add resolution constraints if available and valid
          if (
            this.desired_camera_resolution?.width &&
            this.desired_camera_resolution?.height
          ) {
            constraints.video.width = {
              exact: this.desired_camera_resolution.width,
            };
            constraints.video.height = {
              exact: this.desired_camera_resolution.height,
            };
          }
        }
      }

      if (this.$root.debug_mode === true) {
        console.log("Constraints = " + JSON.stringify(constraints, null, 4));
      }

      return constraints;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_captureSettings {
  // margin-top: calc(var(--spacing) / 2);
  color: white;

  label,
  small,
  .u-label,
  .u-buttonLink {
    color: inherit;
  }

  select,
  input {
    color: var(--c-noir);
  }
}

.m_captureSettings--settings {
  overflow-y: auto;
  flex: 1 1 auto;
  // padding-bottom: var(--spacing);

  > div {
    padding: calc(var(--spacing) / 2);
    padding-top: calc(var(--spacing) / 4);
    > div {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 2);
      border-radius: 6px;

      > div {
        padding-top: calc(var(--spacing) / 4);
        margin-bottom: calc(var(--spacing) / 4);

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    > label {
      line-height: 2;
    }
  }
}

.m_captureSettings--settings--resolutions {
  label {
    padding: calc(var(--spacing) / 4) 0;

    display: flex;
    align-items: center;

    > input {
      flex: 0 0 auto;
      margin: 0;
      margin-right: calc(var(--spacing) / 3);
    }
  }
}

.m_captureSettings--updateButton {
  flex: 0 0 auto;
  border-top: 2px solid var(--c-rouge_fonce);
  color: black;

  display: flex;
  flex-flow: column wrap;
  // align-items: center;
  // justify-content: center;
}

.m_sideBySideSwitches {
  flex-flow: row nowrap;
}

.m_sideBySideSwitches > * {
  display: block;
  border-color: var(--c-rouge_fonce);
  min-width: 100px;
  padding: calc(var(--spacing) / 8) 0;

  display: flex;
  flex-flow: row wrap;
  align-items: stretch;

  input {
    margin: calc(var(--spacing) / 2);

    @media only screen and (max-width: 780px) {
      margin: calc(var(--spacing) / 4);
    }
  }

  > div {
    flex: 1 1 0;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }

  small {
    flex: 0 0 100%;
    background-color: var(--c-rouge_fonce);
    display: block;
    text-align: center;
    font-style: normal;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.m_captureSettings--updateButton--buttons {
  padding: calc(var(--spacing) / 2);
  display: flex;
  justify-content: center;
}

._close_button {
  position: absolute;
  top: 0;
  right: 0;
  min-height: 0;
  padding: 0;
  margin: calc(var(--spacing) / 4);

  img {
    width: 2rem;
    height: 2rem;
  }
}

._loader {
  position: absolute;
  z-index: 1000;
}

._customResolution {
  justify-content: center;

  input {
    width: auto;
  }
}
._customResolutionX {
  font-size: var(--sl-font-size-large);
}

._resolutionLabel {
  flex: 1;
  // display: flex;
  // flex-flow: row wrap;
  // justify-content: space-between;
  // align-items: baseline;

  ::v-deep {
    ._labelLine {
      color: white;
      font-size: var(--sl-font-size-normal);
    }
    .u-instructions {
      color: white;
      margin-bottom: 0;
    }
  }
}

._sourcesTitle {
  display: flex;
  justify-content: space-between;
}
</style>
