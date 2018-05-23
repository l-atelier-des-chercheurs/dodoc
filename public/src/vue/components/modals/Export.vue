<template>
  <Modal
    @close="$emit('close')"
    class="m_exportModal"
    :typeOfModal="'SmallAndScroll'"
  >
    <template slot="header">
      <span class="">{{ $t('export_publication') }}</span>
    </template>

    <template slot="preview">
      <div class="margin-sides-medium">
        <div class="padding-vert-medium">
          <div v-html="$t('get_pdf')" />
          <button type="button" class="margin-small margin-left-none bg-bleuvert c-blanc" 
            :disabled="pdf_request_status !== false"
            @click="downloadPDF"
          >
            <template v-if="!pdf_request_status">
              {{ $t('download_pdf') }}
            </template>
            <template v-else-if="pdf_request_status === 'waiting_for_server'"> 
              <span class="loader loader-xs" />
              {{ $t('pdf_creation_in_progress') }}
            </template>
            <template v-else-if="pdf_request_status === 'generated'">
              {{ $t('pdf_created') }}
            </template>
          </button>

          <div v-if="pdf_request_status === 'generated'">
            <a :href="link_to_pdf" target="_blank" download="">
              {{ $t('download') }}
            </a>
          </div>
        </div>    
        <!-- <hr> -->
        <!-- <div class="padding-vert-medium">
          <div>Pour récupérer un PDF de cette publication, cliquez sur le bouton ci-dessous&nbsp;:</div>
          <button type="button" class="margin-small margin-left-none">
            Exporter en PDF
          </button>
        </div>     -->
      </div>
    </template>    
  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';

export default {
  props: {
    slugPubliName: String
  },
  components: {
    Modal
  },
  data() {
    return {
      pdf_request_status: false,
      link_to_pdf: ''
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
        console.log(`METHODS • Publication: downloadPDF`);
      }

      this.$eventHub.$on('publication.pdfIsGenerated', this.publiIsGenerated);

      this.$root.downloadPubliPDF({ 
        slugPubliName: this.slugPubliName, 
      });
      this.pdf_request_status = 'waiting_for_server';
    },
    publiIsGenerated({ pdfPath, pdfURL }) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: downloadPDF`);
      }
      this.$eventHub.$off('publication.pdfIsGenerated', this.publiIsGenerated);

      this.pdf_request_status = 'generated';
      this.link_to_pdf = pdfURL;

      debugger;
    }
  }
}
</script>