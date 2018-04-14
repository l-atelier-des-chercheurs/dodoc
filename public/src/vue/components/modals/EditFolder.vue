<template>

  <Modal
    @close="$emit('close')"
    @submit="editThisFolder"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    >
    <template slot="header">
      <span class="text-cap"> {{ $t('edit_folder') }}</span> <i>{{ folder.name }}</i>
    </template>

    <template slot="sidebar">

<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input type="text" v-model="folderdata.name" required :readonly="read_only">
      </div>

<!-- Preview -->
      <div class="margin-bottom-small">
        <label>{{ $t('preview') }}</label><br>
        <ImageSelect 
          :previewURL="previewURL"
          @newPreview="value => { folder_preview = value }"
        >
        </ImageSelect>
      </div>

<!-- Password -->
<!--
      <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="folderdata.password" :readonly="read_only">
        <small>{{ $t('password_instructions') }}</small>
      </div>
 -->

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>{{ $t('author') }}</label><br>
        <textarea v-model="folderdata.authors" :readonly="read_only">
        </textarea>
      </div>

    </template>

    <template slot="submit_button">
      {{ $t('save') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import DateTime from '../subcomponents/DateTime.vue';
import alertify from 'alertify.js';
import slug from 'slugg';
import ImageSelect from '../subcomponents/ImageSelect.vue';

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    read_only: Boolean
  },
  components: {
    Modal,
    DateTime,
    ImageSelect
  },
  data() {
    return {
      folderdata: {
        name: this.folder.name,
        start: this.$moment(this.folder.start).isValid()
          ? this.folder.start
          : '',
        end: this.$moment(this.folder.end).isValid() ? this.folder.end : '',
        authors: this.folder.authors
      },
      folder_preview: undefined
    };
  },
  computed: {
    previewURL() {
      if(!this.folder.preview) {
        return '';
      }
      return `/${this.slugFolderName}/${this.folder.preview}`;
    }    
  },
  methods: {
    editThisFolder: function(event) {
      console.log('editThisFolder');

      // only if user changed the name of this folder
      if (this.folderdata.name !== this.folder.name) {
        function getAllFolderNames() {
          let allFoldersName = [];
          for (let slugFolderName in window.store.folders) {
            let foldersName = window.store.folders[slugFolderName].name;
            allFoldersName.push(foldersName);
          }
          return allFoldersName;
        }
        let allFoldersName = getAllFolderNames();

        // check if folder name (not slug) already exists
        if (allFoldersName.indexOf(this.folderdata.name) >= 0) {
          // invalidate if it does
          alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t('notifications.folder_name_exists'));
          return false;
        }

        if (slug(this.folderdata.name).length === 0) {
          alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              this.$t('notifications.folder_name_needs_alphanumeric_characters')
            );
        }
      }

      if(typeof this.folder_preview !== 'undefined') {
        this.folderdata.preview_rawdata = this.folder_preview;
      }

      // copy all values
      let values = this.folderdata;
      values.slugFolderName = this.slugFolderName;

      this.$root.editFolder(values);

      // then close that popover
      this.$emit('close', '');
    }
  },
  mounted() {}
};
</script>
<style>

</style>
