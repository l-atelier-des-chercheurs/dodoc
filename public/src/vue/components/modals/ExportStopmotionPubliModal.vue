<template>
  <Modal
    @close="$emit('close')"
    class="m_exportModal"
    :typeOfModal="'ExportVideo'"
  >
    <template slot="header">
      <span class="">{{ $t('export_creation') }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-sides-medium font-small">
        <div class="">
          <p>{{ $t('export_stopmotion_instructions') }} </p>
          <hr>

          <div class="margin-bottom-small">
            <label>{{ $t('framerate') }} : {{ framerate }}fps = 
              <template v-if="framerate <= 1">
                {{ $t('very_slow') }}
              </template>
              <template v-else-if="framerate <= 10">
                {{ $t('slow') }}
              </template>
              <template v-else-if="framerate <= 20">
                {{ $t('speed_medium') }}
              </template>
              <template v-else-if="framerate <= 30">
                {{ $t('fast') }}
              </template>
            </label>
            <input type="range" v-model.number="framerate" min="0.1" max="30" step=".1" />
          </div>
          <!-- <div class="flex-nowrap" style="align-items: center;">
            <div class="margin-bottom-small">
              <label>{{ $t('framerate') }}</label>
              <input type="number" v-model.number="framerate" step="1" />
            </div>
            <div class="margin-verysmall">=</div>
            <div class="margin-bottom-small">
              <label>{{ $t('seconds_per_image') }}</label>
              <input type="number" v-model.number="seconds_per_image" step="1" />
            </div>
          </div> -->

          <div class="margin-bottom-small">
            <label>{{ $t('quality') }}</label>
            <select v-model="quality">
              <option 
                v-for="q in available_qualities" 
                :value="q.height" 
                :key="q.height"
              >
                {{ $t(q.label) }}
              </option>        
            </select>
          </div>

          <button type="button" 
            class="margin-small margin-left-none bg-bleuvert c-blanc button-allwide" 
            :disabled="video_request_status !== false"
            @click="downloadVideo"
          >
            <template v-if="!video_request_status">
              {{ $t('make_video') }}
            </template>
            <template v-else-if="video_request_status === 'waiting_for_server'"> 
              <span class="loader loader-xs" />
              {{ $t('notifications.creation_in_progress') }}
            </template>
            <template v-else-if="video_request_status === 'generated'">
              {{ $t('notifications.video_created') }}
            </template>
            <template v-else-if="video_request_status === 'failed'">
              {{ $t('notifications.video_creation_failed') }}
            </template>
          </button>
          
          <div v-if="video_request_status === 'generated'">
            <div class="mediaContainer">
              <vue-plyr :options="plyr_options">
                <video :src="link_to_video" controls preload="auto" />
              </vue-plyr>
            </div>
            <div class="margin-vert-medium">
              <a 
                v-if="link_to_video !== false"
                class="buttonLink margin-left-none padding-left-none"
                :href="link_to_video"
              >
                {{ $t('download') }}
              </a>

              <AddCreationToProject
                v-if="exported_video_name !== false"
                :media_filename="exported_video_name"
                :publication="publication"
                @close="$emit('close')"
              />

            </div>
            
          </div>
        </div>
      </div>
    </template>    
  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import AddCreationToProject from '../subcomponents/AddCreationToProject.vue';
import { setTimeout } from 'timers';

export default {
  props: {
    publication: Object,
    slugPubliName: String,
  },
  components: {
    Modal,
    AddCreationToProject
  },
  data() {
    return {
      video_request_status: false,
      link_to_video: false,
      video_is_playing: false,
      framerate: 4,
      seconds_per_image: .25,
      quality: 720,
      available_qualities: [
        { 
          label: 'very_high',
          height: 1080
        },
        { 
          label: 'high',
          height: 720
        },
        { 
          label: 'medium',
          height: 640
        },
        { 
          label: 'low',
          height: 360
        },
      ],

      exported_video_name: false,

      plyr_options: {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        iconUrl: '/images/plyr.svg'
      }

    }
  },
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },
  watch: {
    'quality': function() {
      if(this.video_request_status === 'generated') {
        this.video_request_status = false;
      }
    },
    'framerate': function() {
      this.seconds_per_image = 1/this.framerate;
      this.framerate = this.framerate.toFixed(1);
      if(this.video_request_status === 'generated') {
        this.video_request_status = false;
      }
    },
    'seconds_per_image': function() {
      this.framerate = 1/this.seconds_per_image;
    }
  },
  computed: {
  },
  methods: {
    downloadVideo() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • ExportVideoPubli: downloadVideo`);
      }

      this.$eventHub.$once('socketio.publication.publiStopmotionIsGenerated', this.videoPubliIsGenerated);
      this.$eventHub.$once('socketio.publication.publiStopmotionFailed', this.videoPubliFailedToGenerate);

      this.$socketio.downloadStopmotionPubli({ 
        slugPubliName: this.slugPubliName,
        options: {
          framerate: this.framerate,
          quality: this.quality
        }
      });
      this.video_request_status = 'waiting_for_server';
    },
    videoPubliIsGenerated({ videoName }) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: videoPubliIsGenerated`);
      }

      this.$eventHub.$off('socketio.publication.publiStopmotionFailed');
      
      this.video_request_status = 'generated';
      this.link_to_video = window.location.origin + '/publication/video/' + videoName;
      this.exported_video_name = videoName; 
    },
    videoPubliFailedToGenerate() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: videoPubliFailedToGenerate`);
      }

      this.$eventHub.$off('socketio.publication.publiStopmotionIsGenerated');

      this.video_request_status = 'failed';
    }
  }
}
</script>