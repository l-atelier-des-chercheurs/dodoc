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
              <video ref="video" :src="link_to_video" controls preload="auto" />
              <svg 
                ref="playIcon" 
                v-if="!video_is_playing"
                class="mediaContainer--videoPlay" 
                viewBox="0 0 200 200" 
                alt="Play video"
                @click="togglePlayVideo()"
              >
                <circle cx="100" cy="100" r="90" fill="#fff" stroke-width="15" stroke="#fff"></circle>
                <polygon points="70, 55 70, 145 145, 100" fill="#353535"></polygon>
              </svg>
            </div>
            <div class="margin-vert-medium">
              <a 
                v-if="link_to_video !== false"
                class="buttonLink margin-left-none padding-left-none"
                :href="link_to_video"
              >
                {{ $t('download') }}
              </a>
              <br>
              <div class="">
                <label v-html="$t('add_to_project')" />
                <select>
                  <option 
                    v-for="project in $root.store.projects" 
                    :key="project.name"
                  >
                    {{ project.name }}
                  </option>        
                </select>
              </div>
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

export default {
  props: {
    slugPubliName: String
  },
  components: {
    Modal
  },
  data() {
    return {
      video_request_status: false,
      link_to_video: false,
      video_is_playing: false
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
    togglePlayVideo() {
      if(this.video_is_playing === false) {
        this.video_is_playing = true;
        this.$refs.video.play();
        this.$refs.video.setAttribute('controls', 'controls')      
      }
    },
    downloadVideo() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • ExportVideoPubli: downloadVideo`);
      }

      this.$eventHub.$on('socketio.publication.videoIsGenerated', this.videoPubliIsGenerated);
      this.$root.downloadVideoPubli({ 
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
    },
  }
}
</script>