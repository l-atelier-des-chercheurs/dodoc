<template>
  <Modal
    @close="$emit('close')"
    @submit="newPublication"
    :read_only="read_only"
    :typeOfModal="'EditMeta'"
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

<!-- Author(s) -->
      <div class="margin-bottom-small">
        <label>{{ $t('author') }}</label><br>
        <textarea v-model="publidata.authors">
        </textarea>
      </div>

<!-- Template -->
      <div class="margin-bottom-small">
        <label>{{ $t('format') }}</label>
        <select v-model="publidata.template">
          <option value="page_by_page">
            {{ $t('page_by_page') }}
          </option>
          <option value="web" disabled>
            {{ $t('web') }}
          </option>
        </select>
      </div>

    </template>

    <template slot="submit_button">
      {{ $t('create') }}
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';

export default {
  props: {
    read_only: Boolean
  },
  components: {
    Modal
  },
  data() {
    return {
      publidata: {
        name: '',
        template: 'page_by_page',
        authors: this.$root.settings.current_author.hasOwnProperty('name') ? this.$root.settings.current_author.name:''
      }
    };
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
        width: 210,
        height: 297,
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