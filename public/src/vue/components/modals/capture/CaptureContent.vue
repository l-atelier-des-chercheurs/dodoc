<template>
  <div>
    Hello !
    {{ folder.name }}
    <div v-for="(currentId, kind) in selected_devices">
      {{ kind }}
      <select v-if="sorted_available_devices.hasOwnProperty(kind)" v-model="selected_devices[kind]">
        <option v-for="(device, index) in sorted_available_devices[kind]" :key="device.deviceId" :value="device">
          {{ device.label }}
        </option>        
      </select>
    </div>

    <pre>{{ selected_devices }}</pre>

    <video ref="videoElement" autoplay muted />     
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
      videoStream: '',
      audioStream: '',
      currentFeedsSource: {},
      available_devices: {},
      selected_devices: {
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
        // set initial value
        debugger;
        Object.keys(this.selected_devices).map((kind) => {
          debugger;
          if(this.selected_devices[kind] === '') {
            if(this.sorted_available_devices.hasOwnProperty(kind)) {
              this.selected_devices[kind] = this.sorted_available_devices[kind][0];
            }
          }
        });
      });

    },
    // _gotDevices(deviceInfos) {
      // // Handles being called several times to update labels. Preserve values.
      // var values = selectors.map(function(select) {
      //   return select.value;
      // });
      // selectors.forEach(function(select) {
      //   while (select.firstChild) {
      //     select.removeChild(select.firstChild);
      //   }
      // });
      // var previousVideoDeviceId = store.get(userSelectedVideoDevice);
      // var previousAudioDeviceId = store.get(userSelectedAudioDevice);

      // for (var i = 0; i !== deviceInfos.length; ++i) {

      //   if(available_devices)
      //   var deviceInfo = deviceInfos[i]; 
      //   var deviceId = deviceInfo.deviceId;
        // var option = document.createElement('option');
        // option.value = deviceId;
        // if( deviceId === previousVideoDeviceId || deviceId === previousAudioDeviceId)
        //   option.selected = true;
        // if (deviceInfo.kind === 'audioinput') {
        //   option.text = deviceInfo.label || 'microphone ' + (audioInputSelect.length + 1);
        //   audioInputSelect.appendChild(option);
        // } else if (deviceInfo.kind === 'audiooutput') {
        //   option.text = deviceInfo.label || 'speaker ' + (audioOutputSelect.length + 1);
        //   audioOutputSelect.appendChild(option);
        // } else if (deviceInfo.kind === 'videoinput') {
        //   option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
        //   videoSelect.appendChild(option);
        // } else {
        //   console.log('Some other kind of source/device: ', deviceInfo);
        // }
      // }
      // selectors.forEach(function(select, selectorIndex) {
      //   if (Array.prototype.slice.call(select.childNodes).some(function(n) {
      //     return n.value === values[selectorIndex];
      //   })) {
      //     select.value = values[selectorIndex];
      //   }
      // });
    // },

    startCameraFeed() {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: startCameraFeed');
        alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log('METHODS • Capture: startCameraFeed');
        this.stopAllFeeds();
        this.getCameraFeed()
          .then((stream) => {
            this.videoStream = stream;
            this.$refs.videoElement.srcObject = stream;
            resolve();
          }, (err) => {
            alertify.error( "Failed to start camera feed: " + err);
            reject();
          });
      });
    },
    stopAllFeeds() {
      console.log('METHODS • Capture: stopAllFeeds');
      if( !this.$refs.videoElement.paused)
        this.$refs.videoElement.pause();

      if(this.videoStream) this.videoStream.getTracks().forEach((track) => track.stop());
      if(this.audioStream) this.audioStream.getTracks().forEach((track) => track.stop());

      // imageMode.stop();
      // videoMode.stop();
      // stopMotionMode.stop();
      // audioMode.stop();
    },
    getCameraFeed(withAudio) {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: getCameraFeed');

        if( currentFeedsSource === undefined || currentFeedsSource.video === undefined) {
          reject("Camera not yet ready");
        }

        navigator.getUserMedia(
          {
            video: currentFeedsSource.video,
            audio: withAudio
          },
          function (stream) {
            resolve(stream);
          },
          function(err) {
            $(document).trigger('open_settings_pane');
            for (index=0; index < videoResSwitches.length; index++) {
              videoResSwitches[index].checked = false;
            }
            alertify.error(dodoc.lang().videoStreamCouldntBeStartedTryChangingRes);
          }
        );
      });
    }
    
  }
}
</script>
<style>

</style>