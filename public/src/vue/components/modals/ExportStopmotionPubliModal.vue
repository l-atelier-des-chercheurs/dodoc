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
          <p>{{ $t('export_stopmotion_instructions') }} </p>
          <hr>

          <div class="margin-bottom-small">
            <label>{{ $t('framerate') }}</label>
            <input type="number" v-model.number="framerate" min="1" max="30" step="1" />
          </div>

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
      video_is_playing: false,
      framerate: 4,
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
      ]
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
      if(this.video_request_status === 'generated') {
        this.video_request_status = false;
      }
    }
  },
  computed: {
  },
  methods: {
    downloadVideo() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • ExportVideoPubli: downloadVideo`);
      }

      this.$eventHub.$on('socketio.publication.publiStopmotionIsGenerated', this.videoPubliIsGenerated);
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
      this.$eventHub.$off('socketio.publication.publiStopmotionIsGenerated', this.videoPubliIsGenerated);
      this.video_request_status = 'generated';
      this.link_to_video = window.location.origin + '/publication/video/' + videoName;
    },
  }
}
</script>