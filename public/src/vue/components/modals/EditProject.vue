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
import { VueTagsInput, createTags } from '@johmun/vue-tags-input';

export default {
  props: {
    slugProjectName: String,
    project: Object,
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
        name: this.project.name,
        authors: this.project.authors,
        keywords: []
      },
      tag: '',
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
  mounted() {
    if(this.project.keywords.length > 0) {
      this.projectdata.keywords = createTags(this.project.keywords.map(val => val.title))
      this.editTags(this.projectdata.keywords);
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
    previewURL() {
      if(!this.project.preview) {
        return '';
      }
      return `/${this.slugProjectName}/${this.project.preview}`;
    }    
  },
  methods: {
    editTags: function(newTags) {
      this.projectdata.keywords = newTags.map(val => {
        val.classes = "tagcolorid_" + parseInt(val.text, 36)%4;
        return val;
      });
    },
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

      if(this.projectdata.keywords.length > 0) {
        this.projectdata.keywords = this.projectdata.keywords.map((val) => { 
          return { title: val.text }
        });
      }

      this.$root.editFolder({ 
        type: 'projects', 
        slugFolderName: this.slugProjectName, 
        data: this.projectdata 
      });

      this.$emit('close', '');
    }
  }
};
</script>
<style>

</style>
