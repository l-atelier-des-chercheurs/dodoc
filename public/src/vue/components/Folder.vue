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

      <FileUpload
        v-if="((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass') && $root.state.connected"
        :slugFolderName="slugFolderName"
        :disabled="read_only"
      >
      </FileUpload>

      <EditFolder
        v-if="showEditFolderModal"
        :folder="folder"
        :slugFolderName="slugFolderName"
        @close="showEditFolderModal = false"
        :read_only="read_only"
      >
      </EditFolder>

      <select v-model="sort.current">
        <option v-for="option in sort.available" :value="option" :key="option.name">
          {{ option.name }}
        </option>
      </select>

      <div class="font-small padding-medium">
        {{ $t('filter') }}
      </div>
      <div>
        <input type="text" v-model="filter">
      </div>

      {{ this.showMediaModalFor }}

      <div class="m_folder--library">
        <div
        v-for="media in sortedMedias"
        v-if="media.hasOwnProperty(sort.current.field) && media[sort.current.field] !== ''"
        :key="media.slugMediaName"
        :title="media.slugMediaName"
        >
          <MediaContent
          v-model="media.content"
          :context="'Library'"
          :slugMediaName="media.slugMediaName"
          :slugFolderName="slugFolderName"
          :media="media"
          ></MediaContent>
          <button type="button" class="border-circled button-thin button-wide padding-verysmall margin-verysmall flex-wrap flex-vertically-centered c-noir"
            @click.stop="openMediaModal(media.slugMediaName)"
            >
            {{ $t('open') }}
          </button>
        </div>
        <EditMedia
        v-if="showMediaModalFor !== ''"
        :slugFolderName="slugFolderName"
        :slugMediaName="showMediaModalFor"
        :media="folder.medias[showMediaModalFor]"
        @close="showMediaModalFor = ''"
        :read_only="read_only"
        >
        </EditMedia>        
      </div>
    </div>
  </div>
</template>
<script>
import EditFolder from './modals/EditFolder.vue';
import EditMedia from './modals/EditMedia.vue';
import FileUpload from './FileUpload.vue';
import MediaContent from './subcomponents/MediaContent.vue';

export default {
  props: {
    folder: Object,
    slugFolderName: String,
    read_only: Boolean,
    sort_field: String,
    index: Number
  },
  components: {
    EditFolder,
    EditMedia,
    FileUpload,
    MediaContent
  },
  data() {
    return {
      debugFolderContent: false,
      showEditFolderModal: false,
      showInputPasswordField: false,
      showMediaModalFor: '',

      filter: '',
      sort: {
        current: {
          field: 'date_created',
          name: this.$t('date'),
          type: 'date',
          order: 'descending'
        },

        available: [
          {
            field: 'date_created',
            name: this.$t('date'),
            type: 'date',
            order: 'ascending'
          },
          {
            field: 'date_modified',
            name: this.$t('last_modified'),
            type: 'date',
            order: 'descending'
          },
          {
            field: 'caption',
            name: this.$t('caption'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'type',
            name: this.$t('type'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'keywords',
            name: this.$t('keywords'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'authors',
            name: this.$t('author'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'content',
            name: this.$t('content'),
            type: 'alph',
            order: 'ascending'
          }
        ]
      }
    };
  },
  computed: {
    sortedMedias() {
      var sortable = [];
      for (let slugMediaName in this.folder.medias) {
        let mediaDataToOrderBy;

        if (this.sort.current.type === 'date') {
          mediaDataToOrderBy = +this.$moment(
            this.folder.medias[slugMediaName][this.sort.current.field],
            'YYYY-MM-DD HH:mm:ss'
          );
        } else if (this.sort.current.type === 'alph') {
          mediaDataToOrderBy = this.folder.medias[slugMediaName][
            this.sort.current.field
          ];
        }

        sortable.push({
          slugMediaName: slugMediaName,
          mediaDataToOrderBy: mediaDataToOrderBy
        });
      }
      let sortedSortable = sortable.sort(function(a, b) {
        let valA = a.mediaDataToOrderBy;
        let valB = b.mediaDataToOrderBy;
        if (
          typeof a.mediaDataToOrderBy === 'string' &&
          typeof b.mediaDataToOrderBy === 'string'
        ) {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      });

      if (this.sort.current.order === 'descending') {
        sortedSortable.reverse();
      }

      // array order is garanteed while objects properties aren’t,
      // that’s why we use an array here
      let sortedMedias = sortedSortable.reduce((result, d) => {
        let sortedMediaObj = this.folder.medias[d.slugMediaName];
        sortedMediaObj.slugMediaName = d.slugMediaName;

        if (this.filter.length > 0) {
          // if there is a filter set, let’s only return medias whose mediaDataToOrderBy contain that string
          let originalContentFromMedia =
            sortedMediaObj[this.sort.current.field] + '';
          if (originalContentFromMedia.indexOf(this.filter) !== -1) {
            result.push(sortedMediaObj);
          }
        } else {
          result.push(sortedMediaObj);
        }

        return result;
      }, []);
      return sortedMedias;
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
    openMediaModal(slugMediaName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • TimelineMedia: openMedia');
      }
      this.showMediaModalFor = slugMediaName;
    }
  },
  watch: {}
};
</script>
<style scoped>

</style>