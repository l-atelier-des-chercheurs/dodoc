<template>
  <Modal
    @close="$emit('close')"
    @submit="newProject"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    >
    <template slot="header">
      <span class="">{{ $t('create_a_project') }}</span>
    </template>

    <template slot="sidebar">

<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input type="text" v-model="projectdata.name" required autofocus>
      </div>

<!-- Preview -->
      <div class="margin-bottom-small">
        <label>{{ $t('preview') }}</label><br>
        <ImageSelect @newPreview="value => { preview = value }">
        </ImageSelect>
      </div>

<!-- Password -->
      <div class="margin-bottom-small">
        <label>{{ $t('password') }}</label>
        <input type="password" v-model="projectdata.password">
        <small>{{ $t('password_instructions') }}</small>
      </div>

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
        start: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        end: '',
        password: '',
        authors: ''
      },
      preview: undefined
    };
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

      // copy all values
      let values = this.projectdata;
      values.slugProjectName = this.slugProjectName;

      this.$root.createFolder(values);

      // then close that popover
      this.$emit('close', '');
    }
  }
};
</script>
<style>

</style>
