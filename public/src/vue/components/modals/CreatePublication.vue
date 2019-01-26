<template>
  <Modal
    @close="$emit('close')"
    @submit="newPublication"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
    :askBeforeClosingModal="askBeforeClosingModal"
    >
    <template slot="header">
      <span class="">{{ $t('create_a_publication') }}</span>
    </template>

    <template slot="sidebar">

<!-- Human name -->
      <div class="margin-bottom-small">
        <label>{{ $t('name') }}</label>
        <input type="text" v-model="publidata.name" required autofocus>
      </div>

<!-- Template -->
      <div class="margin-bottom-small">
        <label>{{ $t('format') }}</label>
        <select v-model="publidata.template">
          <option value="page_by_page">
            {{ $t('page_by_page') }}
          </option>
          <option value="video_assemblage">
            {{ $t('video_assemblage') }}
          </option>
          <option value="web" disabled>
            {{ $t('web') }}
          </option>
        </select>
      </div>

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>{{ $t('author') }}</label><br>
        <AuthorsInput
          :currentAuthors="publidata.authors"
          @authorsChanged="newAuthors => publidata.authors = newAuthors"
        />
      </div>


    </template>

    <template slot="submit_button">
      {{ $t('create') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import AuthorsInput from '../subcomponents/AuthorsInput.vue';

export default {
  props: {
    read_only: Boolean
  },
  components: {
    Modal,
    AuthorsInput
  },
  data() {
    return {
      publidata: {
        name: '',
        template: 'page_by_page',
        authors: this.$root.settings.current_author.hasOwnProperty('name') ? [{ name: this.$root.settings.current_author.name }] : '' 
      }
    };
  },
  watch: {
    'publidata.name': function() {
      if(this.publidata.name.length > 0) {
        this.askBeforeClosingModal = true;
      } else {
        this.askBeforeClosingModal = false;
      }
    }
  },
  computed: {},
  methods: {
    newPublication: function(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • CreatePublication: newPublication');
      }
      let name = this.publidata.name;

      function getAllPubliNames() {
        let allPublicationsName = [];
        for (let slugPubliName in window.store.publications) {
          let publiName = window.store.publications[slugPubliName].name;
          allPublicationsName.push(publiName);
        }
        return allPublicationsName;
      }
      let allPublicationsName = getAllPubliNames();

      // check if project name (not slug) already exists
      if (allPublicationsName.indexOf(this.publidata.name) >= 0) {
        // invalidate if it does
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.publi_name_exists'));

        return false;
      }

      let publidata = {
        name,
        authors: this.publidata.authors,
        template: this.publidata.template,
        width: 297,
        height: 420,
        style: "human tech days",
        header_left: "Human Tech Days",
        gridstep: 5,
        margin_left: 20,
        margin_right: 20,

        pages: [{
          id: +new Date() + '_' + (Math.random().toString(36) + '00000000000000000').slice(2, 3)
        }]
      }
      this.$eventHub.$on('socketio.folder_created_or_updated', this.newPublicationCreated);
      this.$root.createFolder({ type: 'publications', data: publidata });      
    },
    newPublicationCreated: function(pdata) {
      if(pdata.id === this.$root.justCreatedFolderID) {
        this.$eventHub.$off('socketio.folder_created_or_updated', this.newPublicationCreated);
        this.$root.justCreatedFolderID = false;
        this.$nextTick(() => {
          this.$emit('close', '');
          this.$root.openPublication(pdata.slugFolderName);
        });
      }
    }
  }
};
</script>