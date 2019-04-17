<template>
  <Modal
    @close="$emit('close')"
    class="m_exportModal"
    :typeOfModal="'ExportVideo'"
  >
    <template slot="header">
      <span class="">{{ $t('export_publication') }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-sides-medium font-small">
        <div class="">
          {{ $t('export_video_instructions') }} 
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
              {{ $t('creation_in_progress') }}
            </template>
            <template v-else-if="video_request_status === 'generated'">
              {{ $t('video_created') }}

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
import { setTimeout } from 'timers';
import AddCreationToProject from '../subcomponents/AddCreationToProject.vue';

export default {
  props: {
    slugPubliName: String
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
  },
  computed: {
  },
  methods: {
    downloadVideo() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • ExportVideoPubli: downloadVideo`);
      }

      this.$eventHub.$on('socketio.publication.videoIsGenerated', this.videoPubliIsGenerated);
      this.$socketio.downloadVideoPubli({ 
        slugPubliName: this.slugPubliName
      });
      this.video_request_status = 'waiting_for_server';
    },
    videoPubliIsGenerated({ videoName }) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: videoPubliIsGenerated`);
      }
      this.$eventHub.$off('socketio.publication.videoIsGenerated', this.videoPubliIsGenerated);
      this.video_request_status = 'generated';
      this.link_to_video = window.location.origin + '/publication/video/' + videoName;
      this.exported_video_name = videoName; 
    },
  }
}
</script>