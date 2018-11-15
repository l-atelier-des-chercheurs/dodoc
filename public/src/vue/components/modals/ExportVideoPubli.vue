<template>
  <Modal
    @close="$emit('close')"
    class="m_exportModal"
    :typeOfModal="'EditMeta'"
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
              {{ $t('pdf_created') }}
            </template>
          </button>
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
      video_request_status: false
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
      this.$root.downloadVideoPubli({ 
        slugPubliName: this.slugPubliName, 
      });
      this.video_request_status = 'waiting_for_server';
    },
    videoPubliIsGenerated({ pdfName, pdfPath }) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: videoPubliIsGenerated`);
      }
      this.$eventHub.$off('socketio.publication.videoIsGenerated', this.videoPubliIsGenerated);
      this.video_request_status = 'generated';
    },
  }
}
</script>