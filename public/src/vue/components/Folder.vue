<template>
  <div>

    <div class="m_folder">
      <img src="" class=""/>

      <div>
        <h2 
        class="margin-none margin-sides-medium margin-vert-small font-folder_title"
        @click="$root.openFolder(slugFolderName)"
        >
          {{ folder.name }}
        </h2>

        <div class="font-small">
          <div class="margin-sides-medium margin-vert-small">
            <mark class="" v-if="folder.password === 'has_pass'">
              {{ $t('protected_by_pass') }}
            </mark>
          </div>

          <div class="margin-medium">
            <i>{{ $t('created_date') }}</i>
            <br>
            {{ formatDateToHuman(folder.created) }}
          </div>
        </div>
      </div>

      <div class="margin-small flex-wrap flex-vertically-start flex-horizontally-start">
        <button 
        v-if="folder.authorized"
        type="button" 
        class="button-round margin-verysmall padding-verysmall" 
        @click="$root.openFolder(slugFolderName)"
        >
          <span class="text-cap font-verysmall">
            {{ $t('open') }}
          </span>
        </button>

        <button v-if="!folder.authorized" type="button" class="button-round margin-verysmall padding-verysmall" :readonly="read_only" @click="showInputPasswordField = !showInputPasswordField">
          <span class="text-cap font-verysmall">
            {{ $t('password') }}
          </span>
        </button>
          <button v-if="folder.authorized" type="button" class="button-round margin-verysmall padding-verysmall" @click="showEditFolderModal = true" :disabled="read_only">
          <span class="text-cap font-verysmall">
            {{ $t('edit') }}
          </span>
        </button>
        <button v-if="folder.authorized" type="button" class="button-round margin-verysmall padding-verysmall" @click="removeFolder()" :disabled="read_only">
          <span class="text-cap font-verysmall">
            {{ $t('remove') }}
          </span>
        </button>

        <div v-if="showInputPasswordField" class="margin-bottom-small">
          <input type="password" ref="passwordField" @keyup.enter="submitPassword" autofocus placeholder="…">
          <button type="button" class="border-circled button-thin padding-verysmall" @click="submitPassword">Envoyer</button>
        </div>
      </div>

      <EditFolder
        v-if="showEditFolderModal"
        :folder="folder"
        :slugFolderName="slugFolderName"
        @close="showEditFolderModal = false"
        :read_only="read_only"
      >
      </EditFolder>
    </div>
  </div>
</template>
<script>
import EditFolder from './modals/EditFolder.vue';

export default {
  props: {
    folder: Object,
    slugFolderName: String,
    read_only: Boolean,
    sort_field: String,
    index: Number
  },
  components: {
    EditFolder
  },
  data() {
    return {
      debugFolderContent: false,
      showEditFolderModal: false,
      showInputPasswordField: false
    };
  },
  methods: {
    formatDateToHuman(date) {
      return this.$moment(date, 'YYYY-MM-DD HH:mm:ss').format('LLL');
    },
    openFolder() {
      this.$root.openFolder(this.slugFolderName);
    },
    closeFolder() {
      this.$root.closeFolder();
    },
    removeFolder() {
      if (window.confirm(this.$t('sureToRemoveFolder'))) {
        this.$root.removeFolder(this.slugFolderName);
      }
    },
    submitPassword() {
      console.log('METHODS • Folder: submitPassword');
      auth.updateAdminAccess({
        [this.slugFolderName]: this.$refs.passwordField.value
      });
      this.$socketio.sendAuth();
      this.showInputPasswordField = false;
    }
  },
  watch: {}
};
</script>
<style scoped>

</style>