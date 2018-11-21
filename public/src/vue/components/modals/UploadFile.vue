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
          :name="'medias'" 
          @change="updateSelectedFiles($event)"
        >
        <label for="addMedia">
          <svg width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path></svg>
          {{ $t('select_files_to_import') }}
        </label>
      </div>

      <transition-group
        tag="div" 
        name="fileupload_list"
      >
        <div
          v-for="(f, index) in selected_files" 
          :key="f.name"
          class="m_uploadFile"
          :class="cssStatus(f)"
          :style="`--progress-percent: ${selected_files_meta.hasOwnProperty(f.name) ? selected_files_meta[f.name].upload_percentages/100 : 0}`"
        >
          <!-- too heavy on memory on mobile devices -->
          <img 
            v-if="!!f.type && f.type.includes('image') && index < 5" 
            class="m_uploadFile--image"
            :src="getImgPreview(f)"
          >
          <div v-else class="m_uploadFile--image" />

          <div :title="f.name" class="m_uploadFile--filename">
            {{ f.name }}
          </div>
          <div class="m_uploadFile--size">
            {{ formatBytes(f.size) }}
          </div>
          <div class="m_uploadFile--action"
            v-if="selected_files_meta.hasOwnProperty(f.name)"
          >
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
      </transition-group>

    </template>

    <template slot="submit_button" v-if="selected_files.length > 0">
      {{ $t('import_all_files') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import * as axios from 'axios';
import { setTimeout } from 'timers';

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
      selected_files: false,
      selected_files_meta: {},
      upload_percentages: 0
    };
  },
  watch: {
  },
  mounted() {
  },
  beforeDestroy() {
  },
  computed: {
    uriToUploadMedia: function() {
      return this.slugProjectName + '/file-upload';
    }
  },
  methods: {
    sendThisFile(f) {
      return new Promise((resolve, reject) => {
        if (this.$root.state.dev_mode === 'debug') {
          console.log(`METHODS • UploadFile / sendThisFile : name = ${f.name}`);
        }

        const filename = f.name;
        const modified = f.lastModified;

        this.$set(this.selected_files_meta, filename, {
          upload_percentages: 0,
          status: 'sending'
        });

        let formData = new FormData();
        formData.append('files', f, filename);
        const meta = {
          fileCreationDate: modified,
          authors: this.$root.settings.current_author.hasOwnProperty('name') ? [{ name: this.$root.settings.current_author.name }] : '' 
        }
        formData.append(filename, JSON.stringify(meta));

        const socketid = this.$socketio.socket.id;
        if(socketid !== undefined) {
          formData.append('socketid', socketid);
        }

        if (this.$root.state.dev_mode === 'debug') {
          console.log(`METHODS • sendThisFile: name = ${filename} / formData is ready`);
        }

        // TODO : possibilité de cancel
        axios.post(this.uriToUploadMedia, formData,{
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: function( progressEvent ) {
              this.selected_files_meta[filename].upload_percentages = parseInt(Math.round((progressEvent.loaded * 100 ) / progressEvent.total ) );
            }.bind(this)            
          })
          .then(x => x.data)
          .then(x => {
            if (this.$root.state.dev_mode === 'debug') {
              console.log(`METHODS • sendThisFile: name = ${filename} / success uploading`);
            }

            this.selected_files_meta[filename].status = 'success';
            this.selected_files_meta[filename].upload_percentages = 100;     

            resolve();    
            // resolve(x.map(img => Object.assign({}, img, { url: `${BASE_URL}/images/${img.id}` })));
          })
          .catch(err => {
            if (this.$root.state.dev_mode === 'debug') {
              console.log(`METHODS • sendThisFile: name = ${filename} / failed uploading`);
            }

            this.selected_files_meta[filename].status = 'failed'; 
            this.selected_files_meta[filename].upload_percentages = 0;   
            reject();      
          });
      });
    },
    sendAllFiles() {
      // TODO : start 1 by 1
      // Array.from(Array(this.selected_files.length).keys())
      //   .map(x => {
      //     await this.sendThisFile(this.selected_files[x]);
      //   });

      const executeSequentially = (array) => {  
        return this.sendThisFile(this.selected_files[array.shift()])
          .then(x => array.length == 0 ? x : executeSequentially(array));
      }

      executeSequentially(Array.from(Array(this.selected_files.length).keys())).then(x => {
        Object.keys(this.selected_files_meta).map(name => {
          let index = 1;
          if(this.selected_files_meta[name].status === 'success') {
            setTimeout(() => {
              this.selected_files = this.selected_files.filter(x => x.name !== name);
              this.$delete(this.selected_files_meta, name);

              // check if there are anymore files to upload 
              if(Object.keys(this.selected_files_meta).length === 0) {
                this.$emit('close');
              }
            }, 500 * index);
            index++;
          }
        });
      });

      // const test = async () => {
      //   for (let task of Array.from(Array(this.selected_files.length).keys()).map()) {
      //     await sendThisFile(task);
      //   }
      // }
    },
    formatBytes(a,b) {
      if(0==a)
        return `0 ${this.$t('bytes')}`;

      var e=[this.$t('bytes'),this.$t('kb'),this.$t('mb'),this.$t('gb'),"TB","PB","EB","ZB","YB"];

      var c=1024,
        d=b||2,
        f=Math.floor(Math.log(a)/Math.log(c));
      return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
    },
    getImgPreview(file) {
      return URL.createObjectURL(file);
    },
    cssStatus(f) {
      if(this.selected_files_meta.hasOwnProperty(f.name)) {
        return 'is--' + this.selected_files_meta[f.name].status;
      }
    },
    updateSelectedFiles($event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • UploadFile / updateSelectedFiles`);
      }
      this.selected_files = Array.from($event.target.files); 
      this.selected_files_meta = {};
    }
  }
};
</script>
<style>

</style>
