<template>
  <Modal
    @close="$emit('close')"
    @submit="newProject"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
    >
    <template slot="header">
      <span class="">{{ $t('create_a_project') }}</span>
    </template>

    <template slot="sidebar">

<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('project_name') }}</label>
        <input type="text" v-model="projectdata.name" required autofocus>
      </div>

<!-- Preview -->
      <div class="margin-bottom-small">
        <label>{{ $t('preview') }}</label><br>
        <ImageSelect @newPreview="value => { preview = value }">
        </ImageSelect>
      </div>

<!-- Password -->
      <!-- <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="projectdata.password">
        <small>{{ $t('password_instructions') }}</small>
      </div> -->

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>{{ $t('author') }}</label><br>
        <textarea v-model="projectdata.authors">
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
      projectdata: {
        name: '',
        password: '',
        authors: this.$root.settings.current_author.hasOwnProperty('name') ? this.$root.settings.current_author.name:''
      },
      preview: undefined,
      askBeforeClosingModal: false
    };
  },
  watch: {
    'projectdata.name': function() {
      if(this.projectdata.name.length > 0) {
        this.askBeforeClosingModal = true;
      } else {
        this.askBeforeClosingModal = false;
      }
    },
    'preview': function() {
      if(!!this.preview) {
        this.askBeforeClosingModal = true;
      } else {
        this.askBeforeClosingModal = false;
      }
    }
  },
  computed: {},
  methods: {
    newProject: function(event) {
      console.log('newProject');

      function getAllProjectNames() {
        let allProjectsName = [];
        for (let slugProjectName in window.store.projects) {
          let projectName = window.store.projects[slugProjectName].name;
          allProjectsName.push(projectName);
        }
        return allProjectsName;
      }
      let allProjectsName = getAllProjectNames();

      // check if project name (not slug) already exists
      if (allProjectsName.indexOf(this.projectdata.name) >= 0) {
        // invalidate if it does
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.project_name_exists'));

        return false;
      }
      if(!!this.preview) {
        this.projectdata.preview_rawdata = this.preview;
      }
      this.$eventHub.$on('socketio.folder_created_or_updated', this.newFolderCreated);
      this.$root.createFolder({ type: 'projects', data: this.projectdata });
    },
    newFolderCreated: function(fdata) {
      if(fdata.id === this.$root.justCreatedFolderID) {
        this.$eventHub.$off('socketio.folder_created_or_updated', this.newFolderCreated);
        this.$root.justCreatedFolderID = false;
        this.$nextTick(() => {
          this.$emit('close', '');
          this.$root.openProject(fdata.slugFolderName);
        });
      }
    }
  }
};
</script>
<style>

</style>
