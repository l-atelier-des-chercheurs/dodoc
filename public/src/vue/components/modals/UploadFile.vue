<template>
  <Modal
    @close="$emit('close')"
    @submit="sendFiles"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="false"
    :isFile="true"
  >
    <!-- @submit="uploadFiles" -->
    <template slot="header">
      <span class="">{{ $t('import_medias') }}</span>
    </template>

    <template slot="sidebar">

      <div class="margin-bottom-small">
        <label>{{ $t('import') }}</label><br>
        <input type="file" id="addMedia" multiple class="inputfile-2" 
          :name="uploadFieldName" 
          :disabled="isSaving" 
          @change="filesChange($event.target.name, $event.target.files);"
        >
        <label for="addMedia">
          <svg width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path></svg>
          {{ $t('add') }}
        </label>
      </div>

      <p v-if="fileCount">
        Medias selected: {{ fileCount }}
      </p>

      <p v-if="isSaving">
        Uploading {{ fileCount }} files...
      </p>

      {{ currentStatus }}


        <!-- <label class="file-select">
          <div class="select-button">
            <span v-if="value">Selected File: {{value.name}}</span>
            <span v-else>Select File</span>
          </div>
          <input type="file" name="upload" multiple="multiple"><br>
        </label>
        <input type="submit" value="Upload"> -->
    </template>

    <template slot="submit_button">
      {{ $t('import') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import * as axios from 'axios';

const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;


export default {
  props: {
    read_only: Boolean,
    slugProjectName: String
  },
  components: {
    Modal
  },
  data() {
    return {
      uploadedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadFieldName: 'medias',
      fileCount: false,
      formData: false,
      fileCount: false
    };
  },
  watch: {
  },
  computed: {
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isSaving() {
      return this.currentStatus === STATUS_SAVING;
    },
    isSuccess() {
      return this.currentStatus === STATUS_SUCCESS;
    },
    isFailed() {
      return this.currentStatus === STATUS_FAILED;
    },  
    uriToUploadMedia: function() {
      return this.slugProjectName + '/file-upload';
    }
  },
  methods: {
    upload(formData) {
      return new Promise((resolve, reject) => {

        const url = this.uriToUploadMedia;
        debugger;
        axios.post(url, formData)
          // get data
          .then(x => x.data)
          // add url field
          .then(x => {
            resolve();
            // resolve(x.map(img => Object.assign({}, img, { url: `${BASE_URL}/images/${img.id}` })));
          })
          .catch(err => reject(err));
      });
    },
    reset() {
      // reset form to initial state
      this.currentStatus = STATUS_INITIAL;
      this.uploadedFiles = [];
      this.uploadError = null;
    },
    sendFiles() {
      if(!this.formData) {
        return;
      }

      // upload data to the server
      this.currentStatus = STATUS_SAVING;

      this.upload(this.formData)
        .then(x => {
          debugger;
          this.uploadedFiles = [].concat(x);
          this.currentStatus = STATUS_SUCCESS;
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t('notifications.medias_uploaded'));
          this.formData = false;
          this.fileCount = 0;
          this.$emit('close', '');
        })
        .catch(err => {
          debugger;
          this.uploadError = err.response;
          this.currentStatus = STATUS_FAILED;
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t('notifications.medias_upload_failed'));
        });
    },
    filesChange(fieldName, fileList) {
      // handle file changes
      this.formData = new FormData();

      this.fileCount = fileList.length;

      if (!fileList.length) return;

      // append the files to FormData
      Array
        .from(Array(fileList.length).keys())
        .map(x => {
          this.formData.append(fieldName, fileList[x], fileList[x].name);
        });

      // save it
    }
  },
  mounted() {
    this.reset();
  }
};
</script>
<style>

</style>
