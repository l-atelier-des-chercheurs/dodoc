<template>
  <Modal
    @close="$emit('close')"
    class="m_exportModal"
    :typeOfModal="'EditMeta'"
  >
    <template slot="header">
      <span class="">{{ $t('export_creation') }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-sides-medium font-small">
        <div class="">
          <div v-html="$t('get_pdf')" />
          <button type="button" 
            class="margin-small margin-left-none bg-bleuvert c-blanc button-allwide" 
            :disabled="pdf_request_status !== false"
            @click="downloadPDF"
          >
            <template v-if="!pdf_request_status">
              {{ $t('download_pdf') }}
            </template>
            <template v-else-if="pdf_request_status === 'waiting_for_server'"> 
              <span class="loader loader-xs" />
              {{ $t('notifications.creation_in_progress') }}
            </template>
            <template v-else-if="pdf_request_status === 'generated'">
              {{ $t('notifications.pdf_created') }}
            </template>
          </button>

          <div v-if="pdf_request_status === 'generated'">
            <a 
              v-if="link_to_pdf !== false"
              class="buttonLink margin-left-none"
              :href="link_to_pdf" target="_blank"
              download
            >
              {{ $t('download') }}
            </a>
            <!-- <a 
              v-if="path_to_pdf !== false && $root.state.is_electron"
              :href="path_to_pdf" target="_blank" 
              class="buttonLink margin-left-none js--openInNativeApp"
            >
              {{ $t('open_in_app') }}
            </a>             -->
            <a 
              v-if="link_to_pdf !== false && $root.state.is_electron"
              :href="link_to_pdf" target="_blank"
              class="buttonLink margin-left-none"
            >
              {{ $t('open_in_app') }}
            </a>       

            <AddCreationToProject
              v-if="link_to_pdf !== false"
              :media_filename="exported_pdf_name"
              @close="$emit('close')"
            />
          </div>
        </div>    
        <hr>
        <div class="">
          <div v-html="$t('get_website')" />
          <button type="button" 
            class="margin-small margin-left-none bg-bleumarine c-blanc button-allwide" 
            @click="downloadWeb"
            :disabled="web_export_started"
          >
            <template v-if="web_export_started"> 
              <span class="loader loader-xs" />
            </template>
          
            {{ $t('download_website') }}
          </button>
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
      pdf_request_status: false,
      link_to_pdf: false,
      path_to_pdf: false,
      web_export_started: false,
      exported_pdf_name: ''
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
    downloadPDF() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • ExportPagePubli: downloadPDF`);
      }

      this.link_to_pdf = false;
      this.path_to_pdf = false;

      this.$eventHub.$on('socketio.publication.pdfIsGenerated', this.publiIsGenerated);

      this.$root.downloadPubliPDF({ 
        slugPubliName: this.slugPubliName, 
      });
      this.pdf_request_status = 'waiting_for_server';
    },
    publiIsGenerated({ pdfName, pdfPath }) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: publiIsGenerated`);
      }
      this.$eventHub.$off('socketio.publication.pdfIsGenerated', this.publiIsGenerated);

      this.pdf_request_status = 'generated';
      this.exported_pdf_name = pdfName;
      this.link_to_pdf = window.location.origin + '/publication/print/' + pdfName;
    },
    downloadWeb() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: downloadWeb`);
      }
      this.web_export_started = true;
      setTimeout(() => {
        this.web_export_started = false;
      }, 2000);
      window.location.replace(window.location.origin + '/publication/web/' + this.slugPubliName);
    }
  }
}
</script>