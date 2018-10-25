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

<!-- Keywords -->
      <div class="margin-bottom-small">
        <label>{{ $t('keywords') }}</label>
        <vue-tags-input
          v-model="tag"
          :placeholder="$t('add_keyword')"
          :autocomplete-items="filteredKeyword"
          :tags="projectdata.keywords"
          @tags-changed="newTags => editTags(newTags)"
        />
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
import VueTagsInput from '@johmun/vue-tags-input';

export default {
  props: {
    read_only: Boolean
  },
  components: {
    Modal,
    ImageSelect,
    VueTagsInput
  },
  data() {
    return {
      projectdata: {
        name: '',
        password: '',
        authors: this.$root.settings.current_author.hasOwnProperty('name') ? this.$root.settings.current_author.name:'',
        keywords: []
      },
      tag: '',
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
  computed: {
    allKeywords() {
      let allKeywords = [];
      for (let slugProjectName in window.store.projects) {
        let projectKeywords = window.store.projects[slugProjectName].keywords;
        if(!!projectKeywords) {
          projectKeywords.map(val => {
            allKeywords.push(val.title);
          });
        }
      }

      allKeywords = allKeywords.filter(function(item, pos) {
        return allKeywords.indexOf(item) == pos;
      });

      return allKeywords.map(kw => {
        return {
          text: kw,
          classes: "tagcolorid_" + parseInt(kw, 36)%4
        }
      });
    },
    filteredKeyword() {
      return this.allKeywords.filter(i => new RegExp(this.tag, 'i').test(i.text));
    },
  },
  methods: {
    editTags: function(newTags) {
      this.projectdata.keywords = newTags.map(val => {
        val.classes = "tagcolorid_" + parseInt(val.text, 36)%4;
        return val;
      });
    },
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

      if(this.projectdata.keywords.length > 0) {
        this.projectdata.keywords = this.projectdata.keywords.map((val) => { 
          return { title: val.text }
        });
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
