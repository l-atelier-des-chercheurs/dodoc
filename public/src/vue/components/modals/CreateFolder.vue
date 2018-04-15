<template>
  <Modal
    @close="$emit('close')"
    @submit="newFolder"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    >
    <template slot="header">
      <span class="">{{ $t('create_a_folder') }}</span>
    </template>

    <template slot="sidebar">

<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input type="text" v-model="folderdata.name" required autofocus>
      </div>

<!-- Preview -->
      <div class="margin-bottom-small">
        <label>{{ $t('preview') }}</label><br>
        <ImageSelect @newPreview="value => { folder_preview = value }">
        </ImageSelect>
      </div>

<!-- Password -->
      <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="folderdata.password">
        <small>{{ $t('password_instructions') }}</small>
      </div>

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>{{ $t('author') }}</label><br>
        <textarea v-model="folderdata.authors">
        </textarea>
      </div>

    </template>

    <template slot="submit_button">
      {{ $t('create') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import ImageSelect from '../subcomponents/ImageSelect.vue';

export default {
  props: {
    read_only: Boolean
  },
  components: {
    Modal,
    ImageSelect
  },
  data() {
    return {
      folderdata: {
        name: '',
        start: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        end: '',
        password: '',
        authors: ''
      }
    };
  },
  computed: {},
  methods: {
    newFolder: function(event) {
      console.log('newFolder');

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
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.folder_name_exists'));

        return false;
      }

      if(!!this.folder_preview) {
        this.folderdata.preview_rawdata = this.folder_preview;
      }

      // copy all values
      let values = this.folderdata;
      values.slugFolderName = this.slugFolderName;

      this.$root.createFolder(values);

      // then close that popover
      this.$emit('close', '');
    }
  }
};
</script>
<style>

</style>
