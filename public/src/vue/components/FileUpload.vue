<template>
  <div class="dropzone">
    <Dropzone
      :id="uniqueDropzoneID"
      ref="dropzone"
      :url="uriToUploadMedia"
      @vdropzone-success="showSuccess"
      @vdropzone-sending="addMeta"
      @vdropzone-error="reportError"
      :preview-template="template"
      :use-custom-dropzone-options=true
      :dropzone-options="customOptionsObject"
      :maxFileSizeInMB="1024"
      :maxNumberOfFiles="100"
    >
      <input type="hidden">
<!--
  ideal implementation: one button each
      <input name="imageCapture" type="file" accept="image/*" capture>
      <input name="videoCapture" type="file" accept="video/*" capture>
      <input name="audioCapture" type="file" accept="audio/*" capture>
-->
    </Dropzone>

  </div>
</template>
<script>
import Dropzone from 'vue2-dropzone';

export default {
  props: {
    slugProjectName: String
  },
  components: {
    Dropzone
  },
  data() {
    return {
      customOptionsObject: {
        language: {
          dictDefaultMessage: this.$t('import'),
          dictCancelUpload: 'Annuler l’upload',
          dictRemoveFile: 'Masquer'
        }
      }
    };
  },
  computed: {
    uniqueDropzoneID: function() {
      return 'myVueDropzone_' + Math.ceil(Math.random() * 1000);
    },
    uriToUploadMedia: function() {
      return this.slugProjectName + '/file-upload';
    }
  },
  mounted: function() {
    document.addEventListener('dragover', this.enhanceDropzone);
    $(this.$refs.dropzoneoverlay)
      .on('dragleave', this.unenhanceDropzone)
      .on('drop', this.unenhanceDropzone);
  },
  destroyed: function() {
    document.removeEventListener('dragover', this.enhanceDropzone);
  },
  methods: {
    reportError: function(err) {
      alert(`Failed to upload: ${JSON.stringify(err)}`);
    },
    enhanceDropzone: function(evt) {
      $(this.$refs.dropzone.$el).addClass('is--bigger');
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    },
    unenhanceDropzone: function(evt) {
      $(this.$refs.dropzone.$el).removeClass('is--bigger');
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    },
    showSuccess: function(file) {
      setTimeout(() => {
        this.$refs.dropzone.removeFile(file);
      }, 1500);
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log(this.$t('notifications.file_was_sent'));
    },
    addMeta: function(file, xhr, formData) {
      if (
        typeof window.FileReader !== 'function' &&
        typeof window.FileReader !== 'object'
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.file_upload_not_allowed'));
        return;
      }

      let objToSend = {};

      objToSend.fileCreationDate = file.lastModified;

      if (
        this.$root.settings.current_author.hasOwnProperty('name')
      ) {
        objToSend.authors = this.$root.settings.current_author.name;
      }

      let fileName = file.name;
      formData.append(fileName, JSON.stringify(objToSend));
    },
    template: function() {
      return `
          <div class="dz-preview dz-file-preview">
              <div class="dz-image" style="width: 50px;height: 50px">
                <img data-dz-thumbnail /></div>
              <div class="dz-details">
                <div class="dz-filename"><span data-dz-name></span></div>
                <div class="dz-size"><span data-dz-size></span></div>
              </div>
              <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
              <div class="dz-error-message"><span data-dz-errormessage></span></div>
              <div class="dz-success-mark"><i class="fa fa-check"></i></div>
              <div class="dz-error-mark"><i class="fa fa-close"></i></div>
          </div>
            `;
    }
  }
};
</script>
<style lang="sass">
</style>
