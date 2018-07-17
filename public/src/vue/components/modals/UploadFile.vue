<template>
  <Modal
    @close="$emit('close')"
    @submit="sendAllFiles"
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
          @change="selected_files = $event.target.files; selected_files_meta = {};"
        >
        <label for="addMedia">
          <svg width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path></svg>
          {{ $t('select_files_to_import') }}
        </label>
      </div>

      <div
        v-for="(f, index) in selected_files" 
        :key="index"
        class="m_uploadFile"
        :class="cssStatus(f)"
        :style="`--progress-percent: ${selected_files_meta.hasOwnProperty(f.name) ? selected_files_meta[f.name].upload_percentages/100 : 0}`"
      >
        <img 
          v-if="!!f.type && f.type.includes('image')" 
          class="m_uploadFile--image"
          :src="getImgPreview(f)"
        >
        <div :title="f.name" class="m_uploadFile--filename">
          {{ f.name }}
        </div>
        {{ Number.parseInt(f.size/1024) }}
        <div class="m_uploadFile--action">
          <button type="button" class="buttonLink"
            @click="sendThisFile(f)"
            :disabled="read_only || (selected_files_meta.hasOwnProperty(f.name) && selected_files_meta[f.name].status === 'success')"
          >
            <template v-if="!selected_files_meta.hasOwnProperty(f.name)">
              {{ $t('import') }}
            </template>
            <template v-else-if="selected_files_meta[f.name].status === 'success'">
              {{ $t('sent') }}
            </template>
            <template v-else-if="selected_files_meta[f.name].status === 'failed'">
              {{ $t('retry') }}
            </template>
          </button>
        </div>
      </div>

    </template>

    <template slot="submit_button" v-if="selected_files.length > 0">
      {{ $t('import_all_files') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import * as axios from 'axios';

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
      selected_files: false,
      selected_files_meta: {},
      upload_percentages: 0
    };
  },
  watch: {
  },
  mounted() {
  },
  computed: {
    uriToUploadMedia: function() {
      return this.slugProjectName + '/file-upload';
    }
  },
  methods: {
    sendThisFile(f) {
      this.$set(this.selected_files_meta, f.name, {
        upload_percentages: 0,
        status: 'sending'
      });

      let formData = new FormData();
      formData.append('files', f, f.name);
      const meta = {
        fileCreationDate: f.lastModified,
        authors: this.$root.settings.current_author.hasOwnProperty('name') ? this.$root.settings.current_author.name:'' 
      }
      formData.append(f.name, JSON.stringify(meta));

      // TODO : possibilité de cancel
      axios.post(this.uriToUploadMedia, formData,{
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: function( progressEvent ) {
            this.selected_files_meta[f.name].upload_percentages = parseInt( Math.round( ( progressEvent.loaded * 100 ) / progressEvent.total ) );
          }.bind(this)            
        })
        .then(x => x.data)
        .then(x => {
          this.selected_files_meta[f.name].status = 'success';
          this.selected_files_meta[f.name].upload_percentages = 100;         
          // resolve(x.map(img => Object.assign({}, img, { url: `${BASE_URL}/images/${img.id}` })));
        })
        .catch(err => {
          this.selected_files_meta[f.name].status = 'failed'; 
          this.selected_files_meta[f.name].upload_percentages = 0;         
        });
    },
    sendAllFiles() {
      // TODO : start 1 by 1
      Array
        .from(Array(this.selected_files.length).keys())
        .map(x => {
          this.sendThisFile(this.selected_files[x]);
        });
    },
    getImgPreview(file) {
      return URL.createObjectURL(file);
    },
    cssStatus(f) {
      if(this.selected_files_meta.hasOwnProperty(f.name)) {
        return 'is--' + this.selected_files_meta[f.name].status;
      }
    }
  }
};
</script>
<style>

</style>
