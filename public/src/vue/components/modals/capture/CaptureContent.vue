<template>
  <div>
    Hello !
    {{ folder.name }}

    <fieldset>
      <legend>Mode</legend>
      {{ selected_mode }}
      <div v-for="mode in available_modes">
        <input type="radio" id="mode.key" value="mode.key" v-model="selected_mode">
        <label for="mode.key">{{ mode.name }}</label>
      </div>
    </fieldset>

    <div v-for="(currentId, kind) in selected_devicesId">
      <select v-if="sorted_available_devices.hasOwnProperty(kind)" v-model="selected_devicesId[kind]">
        <option v-for="(device, index) in sorted_available_devices[kind]" :value="device.deviceId">
          {{ device.label }}
        </option>        
      </select>
    </div>

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
      selected_mode: '',
      available_modes: [
        { 
          name: this.$t('photo'),
          key: 'photo'
        },
        {
          name: this.$t('video'),
          key: 'video'
        },
        {
          name: this.$t('stopmotion'),
          key: 'stopmotion'
        },
        {
          name: this.$t('audio'),
          key: 'audio'
        }
      ],
      videoStream: '',
      audioStream: '',
      available_devices: {},
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
    this.init();
  },
  beforeDestroy() {
  },

  watch: {
    'selected_devicesId.audioinput': function() {
      this.$refs.videoElement.setSinkId(this.selected_devicesId.audioinput);      
    },
    'selected_devicesId.videoinput': function() {
      this.startCameraFeed();
    }
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

        // get from localstorage and put in selected_devicesId.audioinput, selected_devicesId.videoinput and selected_devicesId.audiooutput 

        // set initial value
        Object.keys(this.selected_devicesId).map((kind) => {
          if(this.selected_devicesId[kind] === '') {
            if(this.sorted_available_devices.hasOwnProperty(kind)) {
              this.selected_devicesId[kind] = this.sorted_available_devices[kind][0].deviceId;
            }
          }
        });

        // get last mode from localstorage

        // otherwise start first mode
        if(this.selected_mode === '') {
          this.selected_mode = this.available_modes[0].key;
        }

        this.startCameraFeed();
      });
    },

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
          })
          .catch((err) => {
            alertify.error(err);
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
    getCameraFeed(withAudio = false) {
      return new Promise((resolve, reject) => {
        console.log('METHODS • Capture: getCameraFeed');

        if(this.selected_devicesId.videoinput === '') {
          reject(this.$t('notifications.video_source_not_set'));
        }
        const constraints = {
          video: {
            optional: [{sourceId: this.selected_devicesId.videoinput}]
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
    }
    
  }
}
</script>
<style>

</style>