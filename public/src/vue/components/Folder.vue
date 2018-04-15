<template>
  <div class="m_folder">

    <div class="m_folder--presentation">
      <div class="m_folder--presentation--vignette" @click="$root.openFolder(slugFolderName)">
        <img v-if="previewURL"
          :src="previewURL" class=""
        />
      </div>

      <div class="m_folder--presentation--title">
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
            {{ $t('created_date') }}
            <br>
            {{ formatDateToHuman(folder.date_created) }}
          </div>
        </div>
      </div>

      <div class="margin-small flex-wrap flex-no-grow flex-horizontally-centered">
        <button 
          v-if="folder.authorized && context !== 'full'"
          type="button" 
          class="button-redthin" 
          @click="$root.openFolder(slugFolderName)"
        >
          <span class="">
            {{ $t('open') }}
          </span>
        </button>

        <button v-if="!folder.authorized" type="button" class="button-round margin-verysmall padding-verysmall" :readonly="read_only" @click="showInputPasswordField = !showInputPasswordField">
          <span class="text-cap font-verysmall">
            {{ $t('password') }}
          </span>
        </button>
        <button v-if="folder.authorized && context === 'full'" type="button" class="button-round margin-verysmall padding-verysmall" @click="showEditFolderModal = true" :disabled="read_only">
          <span class="text-cap font-verysmall">
            {{ $t('edit') }}
          </span>
        </button>
        <button v-if="folder.authorized && context === 'full'" type="button" class="button-round margin-verysmall padding-verysmall" @click="removeFolder()" :disabled="read_only">
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

    <!-- <div class="m_folder--description"
      v-if="context === 'full'"
    >
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
      </p>
    </div> -->

    <div class="m_folder--favMedias"
      v-if="context === 'full'"
    >
      <div class="text-cap font-verysmall  c-noir">
        Média favoris
      </div>

      <div class="m_folder--favMedias--list">
        <MediaCard
          v-if="favMedias !== undefined"
          v-for="media in favMedias"
          :key="media.slugMediaName"
          :media="media"
          :slugFolderName="slugFolderName"
        >
        </MediaCard>
      </div>
    </div>

    <MediaLibrary
      v-if="context === 'full'"
      :slugFolderName="slugFolderName"
      :folder="folder"
      :read_only="read_only"
    >
    </MediaLibrary>

    <button 
      type="button" 
      class="button-inline bg-rouge captureButton"
      v-if="context === 'full' && ((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass') && $root.state.connected"
      @click="$root.settings.view = 'CaptureView'"
      :disabled="read_only" 
    >
      <img src="/images/i_record.svg" width="48" height="48" />
      <span>    
          {{ $t('capture') }}
      </span>
    </button>
  </div>
</template>
<script>
import EditFolder from './modals/EditFolder.vue';
import MediaLibrary from './MediaLibrary.vue';
import MediaCard from './subcomponents/MediaCard.vue';
import _ from 'underscore';

export default {
  props: {
    folder: Object,
    slugFolderName: String,
    read_only: Boolean,
    index: Number,
    context: String
  },
  components: {
    EditFolder,
    MediaLibrary,
    MediaCard
  },
  data() {
    return {
      debugFolderContent: false,
      showEditFolderModal: false,
      showInputPasswordField: false
    };
  },
  watch: {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  computed: {
    favMedias() {
      if(Object.keys(this.folder.medias).length === 0) {
        return [];
      }
      const favMedias = {};
      Object.keys(this.folder.medias).map((m) => {
        if(this.folder.medias[m].fav === true) {
          favMedias[m] = this.folder.medias[m];
        }
      });
      return favMedias;
    },
    previewURL() {
      if(this.folder.preview === '') {
        return false;
      }
      return `/${this.slugFolderName}/${this.folder.preview}?${(new Date()).getTime()}`;
    }
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
        this.closeFolder();
      }
    },
    submitPassword() {
      console.log('METHODS • Folder: submitPassword');
      auth.updateAdminAccess({
        [this.slugFolderName]: this.$refs.passwordField.value
      });
      this.$socketio.sendAuth();
      this.showInputPasswordField = false;
    },
  },
};
</script>
<style scoped>

</style>