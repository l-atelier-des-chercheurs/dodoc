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
      <div v-if="current_mode === 'LocalSources'" class>
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
            @click="refreshAvailableDevices"
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
      <div v-else-if="current_mode === 'RemoteSources'">
        <div>
          {{ $t("feature_not_yet_implemented") }}
        </div>

        <div class="u-disabled">
          <!-- <label>{{ $t("remote_access") }}</label> -->

          <small>{{ $t("connect_to_other_users") }}</small>
          <div class="padding-vert-small padding-bottom-small">
            <label class="u-label" v-html="$t('name_of_stream')" />
            <input
              type="text"
              v-model.trim="access_distant_stream.callee"
              required
              v-uppercase
              :disabled="access_distant_stream.status.enabled"
              autofocus="autofocus"
              onfocus="this.select()"
              @keydown.enter.prevent="callStream"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="m_captureSettings--updateButton" v-if="false">
      <!-- <small v-if="!desired_camera_resolution">
          Select a camera resolution first
        </small> -->

      <div
        class="m_captureSettings--updateButton--shareStreamToggle"
        v-if="current_mode === 'LocalSources'"
      >
        <transition name="fade_fast" :duration="150">
          <LoaderSpinner v-if="share_this_stream.status.loading" />
        </transition>

        <!-- <div class="u-switch u-switch-xs">
          <input
            id="shareStream"
            type="checkbox"
            v-model="share_this_stream.enabled"
          />
          <label class="u-label" for="shareStream">{{
            $t("share_stream")
          }}</label>
        </div> -->

        <div
          v-if="share_this_stream.enabled"
          class="padding-sides-small padding-bottom-small"
        >
          <label class="u-label" v-html="$t('name_of_stream')" />
          <input
            type="text"
            v-model.trim="share_this_stream.name"
            required
            v-uppercase
            autofocus="autofocus"
            onfocus="this.select()"
            @keydown.enter.prevent="setCameraStreamFromDefaults"
          />
        </div>
      </div>

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
        <template v-else-if="current_mode === 'RemoteSources'">
          <transition name="fade_fast" :duration="150">
            <LoaderSpinner v-if="access_distant_stream.calling" />
          </transition>
          <button
            type="button"
            class="u-button u-button_red u-button_wide"
            v-if="!access_distant_stream.status.enabled"
            :disabled="
              access_distant_stream.callee.length === 0 ||
              access_distant_stream.calling
            "
            @click="callStream"
          >
            {{ $t("connect") }}
          </button>
          <button
            type="button"
            class="u-button u-button_red u-button_wide"
            v-if="access_distant_stream.status.enabled"
            :disabled="
              access_distant_stream.callee.length === 0 ||
              access_distant_stream.calling
            "
            @click="hangupStream"
          >
            {{ $t("hangup") }}
          </button>
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
import RTCMultiConnection from "rtcmulticonnection";

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

      current_mode: "LocalSources",

      current_stream: undefined,
      local_stream: undefined,
      remote_stream: undefined,

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

      rtcmulti_connection: undefined,

      share_this_stream: {
        enabled: false,
        name: `DODOC-${(Math.random().toString(36) + "00000000000000000").slice(
          2,
          3 + 2
        )}`,
        status: {
          loading: false,
          enabled: undefined,
          name: undefined,
          peers_connected: [],
        },
      },

      access_distant_stream: {
        calling: false,
        callee: "",
        status: {
          enabled: false,
          callee: undefined,
        },
      },
    };
  },
  created() {},
  mounted() {
    if (!navigator.mediaDevices.getUserMedia) {
      alert("You need a browser that supports WebRTC");
      return;
    }

    this.is_loading_feed = true;
    this.is_loading_available_devices = true;

    //Call gUM early to force user gesture and allow device enumeration
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        this.local_stream = stream;
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
            this.$t("couldnt_load_getusermedia") +
              "<br>" +
              err.name +
              ": " +
              err.message
          );
        // if (err.message === "Could not start audio source") {
        // }
        this.is_loading_feed = false;
        this.$emit("hasFinishedLoading");
        this.$emit("show");
        return;
      })
      .then(this.refreshAvailableDevices)
      .then(() => {
        this.setDefaultInputsAndOutputs();
      })
      .catch((err) => {
        this.is_loading_feed = false;
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t("failed_listing_devices") +
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
    if (this.local_stream)
      this.local_stream.getTracks().forEach((track) => track.stop());
    if (this.remote_stream)
      this.remote_stream.getTracks().forEach((track) => track.stop());
    this.closeMultiRTC();
  },
  watch: {
    "selected_devices.video_input_device": function () {
      this.unavailable_camera_resolutions = [];
      this.last_working_resolution = false;
    },
    local_stream: function () {
      this.setCurrentStream();
    },
    remote_stream: function () {
      this.setCurrentStream();
    },
    current_mode: function () {
      this.setCurrentStream();
    },
    current_stream: function () {
      this.$emit("setStream", {
        stream: this.current_stream,
        type: this.current_mode,
      });
    },
    selected_devices: {
      handler() {
        localStorage.setItem(
          "selected_devices",
          JSON.stringify(this.selected_devices)
        );
        this.setCameraStreamFromDefaults();
      },
      deep: true,
    },
    desired_camera_resolution: {
      handler() {
        this.setCameraStreamFromDefaults();
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
    share_this_stream: {
      handler() {
        this.$eventHub.$emit(
          `stream.newSharingInformations`,
          this.share_this_stream.status
        );
      },
      deep: true,
    },
    access_distant_stream: {
      handler() {
        this.$eventHub.$emit(
          `stream.newDistantAccessInformations`,
          this.access_distant_stream.status
        );
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
        _settings += this.noiseSuppression + "-";
        _settings += this.echoCancellation + "-";
      }

      if (this.share_this_stream.enabled)
        _settings += this.share_this_stream.name + "-";

      if (this.selected_devices.audio_output_device)
        _settings += this.selected_devices.audio_output_device.deviceId + "-";

      return _settings;
    },
  },
  methods: {
    listDevices() {
      return new Promise((resolve, reject) => {
        if (this.$root.debug_mode === true)
          console.log(`CaptureSettings • METHODS : listDevices`);

        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            return resolve(devices);
          })
          // .then((devices) => {
          //   this.getDesktopCapturer()
          //     .then((sources) => {
          //       devices = devices.concat(sources);
          //     })
          //     .catch(() => {})
          //     .then(() => {
          //       return resolve(devices);
          //     });
          // })
          .catch((err) => {
            return reject(err);
          });
      });
    },
    setCurrentStream() {
      if (this.$root.debug_mode === true)
        console.log(`CaptureSettings • METHODS : setCurrentStream`);

      if (this.current_mode === "RemoteSources") {
        this.current_stream = this.remote_stream;
      } else if (this.current_mode === "LocalSources") {
        this.current_stream = this.local_stream;
      }
    },
    resInstructions(res) {
      if (res.type === "custom") return undefined;
      return `${res.label_detail} • ${res.ratio} • ${res.width}×${
        res.height
      } ${this.$t("pixels")}`;
    },
    setSupportedConstraints() {
      return new Promise((resolve) => {
        if (this.$root.debug_mode === true)
          console.log(`CaptureSettings • METHODS : setSupportedConstraints`);

        const supported_constraints =
          navigator.mediaDevices.getSupportedConstraints();
        if (!supported_constraints) return resolve();

        Object.entries(this.advanced_capture_options).map(([prop]) => {
          this.advanced_capture_options[prop].supported =
            this.advanced_capture_options[prop].enabled =
              supported_constraints[prop] === true;
        });
        return resolve();
      });
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
      if (this.$root.debug_mode === true)
        console.log(`CaptureSettings • METHODS : getDefaultDevice`);

      let previously_used = false;

      if (localStorage.getItem("selected_devices")) {
        try {
          previously_used = JSON.parse(
            localStorage.getItem("selected_devices")
          );
          if (previously_used?.[key]) {
            const found_device = devices_list.find(
              (d) => d.deviceId === previously_used[key].deviceId
            );
            if (found_device) return found_device;
          }
        } catch (e) {
          /**/
        }
      }

      if (option_preference) {
        const found_device = devices_list.find(
          (d) => d[option_preference.key] === option_preference.value
        );
        if (found_device) return found_device;
      }

      if (this.$root.debug_mode === true)
        console.log(
          `CaptureSettings • METHODS : getDefaultDevice — settings first available device for ` +
            key
        );

      return devices_list[0];
    },
    startMediaDeviceFeed(constraints) {
      return new Promise((resolve, reject) => {
        if (this.$root.debug_mode === true)
          console.log(`CaptureSettings • METHODS : startMediaDeviceFeed`);

        let processFeeds = [];

        // start video feed
        processFeeds.push(
          new Promise((resolve, reject) => {
            if (!constraints.video) return resolve();
            if (constraints._is_webrtc_screen_capture === true) {
              navigator.mediaDevices
                .getDisplayMedia({ video: constraints.video, audio: false })
                .then((stream) => resolve({ type: "videoStream", stream }))
                .catch((err) => reject(err));
            } else {
              navigator.mediaDevices
                .getUserMedia({ video: constraints.video, audio: false })
                .then((stream) => resolve({ type: "videoStream", stream }))
                .catch((err) => reject(err));
            }
          })
        );

        // start audio feed
        processFeeds.push(
          new Promise((resolve, reject) => {
            if (!constraints.audio) return resolve();
            navigator.mediaDevices
              .getUserMedia({ video: false, audio: constraints.audio })
              .then((stream) => resolve({ type: "audioStream", stream }))
              .catch((err) => reject(err));
          })
        );

        Promise.all(processFeeds)
          .then((streams) => {
            if (!streams) reject("no feed available");

            let tracks = [];

            const video_stream = streams.find(
              (s) => s && s.type === "videoStream"
            );
            if (video_stream) tracks.push(...video_stream.stream.getTracks());

            const audio_stream = streams.find(
              (s) => s && s.type === "audioStream"
            );
            if (audio_stream)
              tracks.push(...audio_stream.stream.getAudioTracks());

            let stream = new MediaStream(tracks);

            resolve(stream);
          })
          .catch((err) => reject(err));
      });
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
        if (!window.electronAPI.desktopCapturer) return;

        if (this.$root.debug_mode === true)
          console.log(`CaptureSettings • METHODS : getDesktopCapturer`);

        window.electronAPI
          .desktopCapturer({ types: ["window", "screen"] })
          .then((sources) => {
            sources = sources.map((s) => {
              return {
                chromeMediaSource: "desktop",
                deviceId: s.id,
                kind: "videoinput",
                label: "🖥️ " + s.name,
              };
            });

            return resolve(sources);
          })
          .catch((err) => reject(err));
        // .catch((err) => reject(err));
      });
    },
    refreshAvailableDevices() {
      return new Promise((resolve) => {
        if (this.$root.debug_mode === true)
          console.log(`CaptureSettings • METHODS : refreshAvailableDevices`);

        this.connected_devices = [];
        this.is_loading_available_devices = true;
        this.setSupportedConstraints()
          .then(() => this.listDevices())
          .then((devices) => {
            this.connected_devices = devices.map((d) => {
              const { label, kind, deviceId, chromeMediaSource = false } = d;
              let facingMode = {};
              try {
                facingMode = d.getCapabilities()?.facingMode?.[0];
              } catch (e) {
                /**/
              }

              return {
                label,
                kind,
                deviceId,
                facingMode,
                chromeMediaSource,
              };
            });

            // if (!this.$root.is_electron) {
            this.connected_devices.push({
              deviceId: "screen_capture",
              kind: "videoinput",
              label: "🖥️ " + this.$t("screen_capture"),
            });
            // }

            this.is_loading_available_devices = false;
            return resolve();
          });
      });
    },
    setCameraStreamFromDefaults() {
      return new Promise((resolve, reject) => {
        if (this.$root.debug_mode === true)
          console.log(
            `CaptureSettings • METHODS : setCameraStreamFromDefaults`
          );

        this.is_loading_feed = true;

        if (this.selected_devices.audio_output_device)
          this.$emit(
            "update:audio_output_deviceId",
            this.selected_devices.audio_output_device.deviceId
          );

        this.startLocalStream()
          .then(() => {
            this.stream_current_settings = this.current_settings;
            this.last_working_resolution = this.desired_camera_resolution;
            this.is_loading_feed = false;
            return;
          })
          .catch((error) => {
            this.is_loading_feed = false;
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(
                this.$t("failed_to_start_streams_change_source_or_res") +
                  "<br>" +
                  error.name
              );
            if (this.desired_camera_resolution.type !== "custom") {
              this.unavailable_camera_resolutions.push(
                this.desired_camera_resolution.label
              );
              if (this.last_working_resolution) {
                this.desired_camera_resolution = this.last_working_resolution;
                this.last_working_resolution = false;
                setTimeout(() => {
                  this.setCameraStreamFromDefaults()
                    .then(() => resolve())
                    .catch(() => reject());
                }, 500);
              } else {
                return reject();
              }
            }
          })
          .then(() => {
            this.share_this_stream.status.loading = true;
            return this.setStreamSharing();
          })
          .then(() => {
            this.share_this_stream.status.loading = false;
            this.is_loading_feed = false;
            return resolve();
          })
          .catch((error) => {
            this.share_this_stream.status.loading = false;
            this.is_loading_feed = false;
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("failed_to_share_stream") + "<br>" + error.name);
          });
      });
    },
    startLocalStream() {
      return new Promise((resolve, reject) => {
        if (this.$root.debug_mode === true)
          console.log(`CaptureSettings • METHODS : startLocalStream`);

        //Kill any running streams;
        if (this.local_stream)
          this.local_stream.getTracks().forEach((track) => track.stop());

        let constraints = this.createConstraintsFromSelected();

        setTimeout(
          () => {
            this.startMediaDeviceFeed(constraints)
              .then((stream) => {
                this.local_stream = stream;
                return resolve();
              })
              .catch((error) => {
                console.log("getUserMedia error : ", error);
                this.$emit("show");
                if (error.name === "NotAllowedError") {
                  this.status = "not_allowed";
                }
                return reject(error);
              });
          },
          this.local_stream ? 200 : 0
        ); //official examples had this at 200
      });
    },
    createConstraintsFromSelected() {
      if (this.$root.debug_mode === true)
        console.log(
          `CaptureSettings • METHODS : createConstraintsFromSelected`
        );

      let _constraints = {
        audio: false,
        video: false,
      };

      _constraints.audio = {
        deviceId: this.selected_devices.audio_input_device.deviceId
          ? { exact: this.selected_devices.audio_input_device.deviceId }
          : undefined,
        echoCancellation:
          this.advanced_capture_options.echoCancellation.enabled,
        noiseSuppression:
          this.advanced_capture_options.noiseSuppression.enabled,
      };

      // IF ELECTRON DESKTOP CAPTURER AND VIDEO ENABLED
      if (this.selected_devices.video_input_device?.chromeMediaSource) {
        // screen capture devices
        _constraints._is_electron_screen_capture = true;
        _constraints.video = {
          mandatory: {
            chromeMediaSource:
              this.selected_devices.video_input_device.chromeMediaSource,
            chromeMediaSourceId:
              this.selected_devices.video_input_device.deviceId,
            // minWidth: this.desired_camera_resolution.width,
            // maxWidth: this.desired_camera_resolution.width,
            // minHeight: this.desired_camera_resolution.height,
            // maxHeight: this.desired_camera_resolution.height,
          },
        };
      } else {
        // IF BROWSER SCREEN CAPTURE
        // IF BROWSER OR ELECTRON CAMERA FEED
        if (
          this.selected_devices.video_input_device &&
          this.selected_devices.video_input_device.deviceId === "screen_capture"
        ) {
          _constraints._is_webrtc_screen_capture = true;
          _constraints.video = {
            cursor: this.advanced_capture_options.cursor.enabled,
          };
        } else {
          _constraints.video = {
            deviceId: this.selected_devices.video_input_device.deviceId
              ? {
                  exact: this.selected_devices.video_input_device.deviceId,
                }
              : undefined,
            width: { exact: this.desired_camera_resolution.width }, //new syntax
            height: { exact: this.desired_camera_resolution.height }, //new syntax
          };
        }
      }

      console.log("Constraints = " + JSON.stringify(_constraints, null, 4));

      return _constraints;
    },
    setStreamSharing() {
      return new Promise((resolve, reject) => {
        if (this.$root.debug_mode === true)
          console.log(`CaptureSettings • METHODS : setStreamSharing`);

        if (!this.share_this_stream.enabled) {
          this.stopSharingStream();
          return resolve();
        }

        if (this.share_this_stream.name.length === 0)
          return reject("missing_stream_name");

        if (!this.local_stream)
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("no_stream_found_while_sharing"));

        if (!this.rtcmulti_connection) {
          this.initRTCMulti();
        }

        this.rtcmulti_connection.addStream(this.local_stream);

        this.rtcmulti_connection.open(
          this.share_this_stream.name,
          (isRoomOpened, roomid, error) => {
            if (this.$root.debug_mode === true)
              console.log(
                `CaptureSettings • METHODS : setStreamSharing • opened room ${roomid}`
              );

            this.share_this_stream.status.enabled = true;
            this.share_this_stream.status.name = roomid;

            this.rtcmulti_connection.onNewParticipant = (
              participantId,
              userPreferences
            ) =>
              this.newParticipantOnStream({ participantId, userPreferences });

            this.rtcmulti_connection.onleave = (participantId) =>
              this.onParticipantLeave({ participantId });

            if (error) {
              this.$alertify
                .closeLogOnClick(true)
                .delay(4000)
                .error(
                  this.$t("failed_to_start_stream_sharing") +
                    " " +
                    error.message
                );
            }
          }
        );

        return resolve();
      });
    },
    newParticipantOnStream({ participantId, userPreferences }) {
      this.share_this_stream.status.peers_connected.push(participantId);

      this.$alertify
        .closeLogOnClick(true)
        .delay(8000)
        .success(this.$t("new_user_connected_to_stream"));

      this.rtcmulti_connection.acceptParticipationRequest(
        participantId,
        userPreferences
      );
    },
    onParticipantLeave(participantId) {
      if (this.$root.debug_mode === true)
        console.log(
          `CaptureSettings • METHODS : onParticipantLeave ${participantId}`
        );

      this.share_this_stream.status.peers_connected.filter(
        (id) => id !== participantId
      );
    },
    callStream() {
      if (this.$root.debug_mode === true)
        console.log(`CaptureSettings • METHODS : callStream`);

      this.access_distant_stream.calling = true;

      if (!this.rtcmulti_connection) this.initRTCMulti();

      const call_timeout = setTimeout(() => {
        this.access_distant_stream.calling = false;
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error("Failed to call timeout");
      }, 5000);

      this.rtcmulti_connection.onstream = (event) => {
        if (this.$root.debug_mode === true)
          console.log(`CaptureSettings • METHODS : callStream • onstream`);

        event.mediaElement.removeAttribute("src");
        event.mediaElement.removeAttribute("srcObject");
        event.mediaElement.muted = true;
        event.mediaElement.volume = 0;

        if (this.access_distant_stream.calling) {
          this.remote_stream = event.stream;
          this.access_distant_stream.calling = false;
          this.access_distant_stream.status.enabled = true;
          clearTimeout(call_timeout);
        }
      };

      this.rtcmulti_connection.checkPresence(
        this.access_distant_stream.callee,
        (isOnline, username) => {
          if (this.$root.debug_mode === true)
            console.log(
              `CaptureSettings • METHODS : username • for ${username} and ${isOnline}`
            );
          if (!isOnline) {
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(username + " is not online.");

            this.access_distant_stream.calling = false;
            clearTimeout(call_timeout);
            return;
          }

          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(username + " is online.");
          this.access_distant_stream.status.callee = username;
          this.rtcmulti_connection.join(username);
        }
      );
    },
    hangupStream() {
      if (this.$root.debug_mode === true)
        console.log(`CaptureSettings • METHODS : hangupStream`);

      this.rtcmulti_connection.leave();
      this.access_distant_stream.status.enabled = false;
    },
    initRTCMulti() {
      if (this.$root.debug_mode === true)
        console.log(`CaptureSettings • METHODS : initRTCMulti`);

      if (!window.rtcmulti_connection)
        window.rtcmulti_connection = new RTCMultiConnection();
      this.rtcmulti_connection = window.rtcmulti_connection;

      this.rtcmulti_connection.iceServers = [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun.l.google.com:19302?transport=udp",
          ],
        },
      ];

      // detect 2G
      if (
        navigator.connection &&
        navigator.connection.type === "cellular" &&
        navigator.connection.downlinkMax <= 0.115
      )
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("bandwidth_very_low_for_stream_sharing"));

      this.rtcmulti_connection.socketURL =
        "https://rtcmulticonnection.herokuapp.com:443/";

      this.rtcmulti_connection.dontCaptureUserMedia = true;

      this.rtcmulti_connection.session = {
        video: true,
        audio: true,
        oneway: true,
      };

      this.rtcmulti_connection.onstream = (event) => {
        console.log("CaptureSettings: onstream");
        event.mediaElement.volume = 0;
      };
      this.rtcmulti_connection.onstreamended = () => {
        console.log("CaptureSettings: onstreamended");
        this.$alertify.closeLogOnClick(true).delay(4000).error("onstreamended");
        // this.share_this_stream.status.enabled = false;
      };
      this.rtcmulti_connection.onMediaError = (e) => {
        console.log("CaptureSettings: onMediaError");
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("stream_sharing_media_error") + e.message);
      };
    },
    stopSharingStream() {
      if (this.$root.debug_mode === true)
        console.log(`CaptureSettings • METHODS : stopSharingStream`);

      if (!this.rtcmulti_connection) return;

      // only disconnect peers connected to this stream

      this.share_this_stream.status.peers_connected.map((pid) => {
        this.rtcmulti_connection.disconnectWith(pid);
      });
    },
    closeMultiRTC() {
      if (this.$root.debug_mode === true)
        console.log(`CaptureSettings • METHODS : closeMultiRTC`);

      if (!this.rtcmulti_connection) return;

      this.stopSharingStream();
      this.rtcmulti_connection.closeSocket();
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
.m_captureSettings--updateButton--shareStreamToggle {
  position: relative;
  background-color: var(--c-rouge_fonce);
  color: white;
  text-align: center;
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
