<template>

  <Modal
    @close="$emit('close')"
    @submit="editThisProject"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
    >
    <template slot="header">
      <div class="">{{ $t('edit_project') }}</div>
    </template>

    <template slot="sidebar">
<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('project_name') }}</label>
        <input class="input-big" type="text" v-model="projectdata.name" required :readonly="read_only">
      </div>

<!-- Preview -->
      <div class="margin-bottom-small">
        <label>{{ $t('preview') }}</label><br>
        <ImageSelect 
          :previewURL="previewURL"
          @newPreview="value => { preview = value }"
        >
        </ImageSelect>
      </div>

<!-- Password -->
<!--
      <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="projectdata.password" :readonly="read_only">
        <small>{{ $t('password_instructions') }}</small>
      </div>
 -->

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>{{ $t('author') }}</label><br>
        <textarea v-model="projectdata.authors" :readonly="read_only">
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
import slug from 'slugg';
import ImageSelect from '../subcomponents/ImageSelect.vue';

export default {
  props: {
    slugProjectName: String,
    project: Object,
    read_only: Boolean
  },
  components: {
    Modal,
    ImageSelect
  },
  data() {
    return {
      projectdata: {
        name: this.project.name,
        authors: this.project.authors
      },
      preview: undefined,
      askBeforeClosingModal: false
    };
  },
  watch: {
    'projectdata.name': function() {
      this.askBeforeClosingModal = true;
    },
    'preview': function() {
      this.askBeforeClosingModal = true;
    }
  },
  computed: {
    previewURL() {
      if(!this.project.preview) {
        return '';
      }
      return `/${this.slugProjectName}/${this.project.preview}`;
    }    
  },
  methods: {
    editThisProject: function(event) {
      console.log('editThisProject');

      // only if user changed the name of this folder
      if (this.projectdata.name !== this.project.name) {
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
      }

      if(typeof this.preview !== 'undefined') {
        this.projectdata.preview_rawdata = this.preview;
      }

      this.$root.editFolder({ 
        type: 'projects', 
        slugFolderName: this.slugProjectName, 
        data: this.projectdata 
      });

      this.$emit('close', '');
    }
  },
  mounted() {}
};
</script>
<style>

</style>
